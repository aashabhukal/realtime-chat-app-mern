// src/components/auth/OTPForm.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import * as authService from '../../services/authService';
import { toast } from 'react-toastify';

const OTPForm = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && value && newOtp.every((d) => d!== '')) {
      handleSubmit(null, newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' &&!otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
      handleSubmit(null, pasted);
    }
  };

  const handleSubmit = async (e, code) => {
    if (e) e.preventDefault();
    const finalOtp = code || otp.join('');
    if (finalOtp.length!== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, finalOtp);
      toast.success('Email verified successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendOTP(email);
      toast.success('OTP resent to your email');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-indigo-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Email</h2>
          <p className="text-sm text-gray-500 text-center mt-2">We've sent a 6-digit code to</p>
          <p className="text-sm font-semibold text-indigo-600 text-center flex items-center justify-center gap-1 mt-1">
            <Mail size={14} /> {email}
          </p>
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || otp.some((d) =>!d)}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            {timer > 0? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold text-indigo-600">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto"
              >
                <RefreshCw size={14} className={resendLoading? 'animate-spin' : ''} />
                {resendLoading? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;