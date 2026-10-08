// src/components/auth/RegisterForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AtSign } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
// import { useAuth } from '../../hooks/useAuth';
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.username || !form.email || !form.password) {
      return toast.error('Please fill all fields');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(form);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        icon={User}
        placeholder="Ali Khan"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        autoFocus
      />

      <Input
        label="Username"
        icon={AtSign}
        placeholder="ali_khan"
        value={form.username}
        onChange={(e) =>
          setForm({ ...form, username: e.target.value.toLowerCase() })
        }
      />

      <Input
        label="Email"
        icon={Mail}
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <Input
        label="Password"
        icon={Lock}
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;