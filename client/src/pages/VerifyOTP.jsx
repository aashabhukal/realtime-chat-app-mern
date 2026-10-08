// src/pages/VerifyOTP.jsx
import OTPForm from '../components/auth/OTPForm';
import { MessageCircle } from 'lucide-react';

const VerifyOTP = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
        </div>
        <OTPForm />
      </div>
    </div>
  );
};

export default VerifyOTP;