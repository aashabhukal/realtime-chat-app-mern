import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false);
  const { login }=useAuth(); const navigate=useNavigate();

  const submit=async(e)=>{ e.preventDefault(); setLoading(true);
    try{ await login(email,password); navigate('/chat'); }
    catch(err){ alert('Login failed'); } finally{ setLoading(false); } };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">Email</label>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="you@email.com"
          className="mt-2 w-full px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-purple-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-purple-500/10 transition-all" />
      </div>
      <div>
        <label className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">Password</label>
        <div className="relative mt-2">
          <input type={show?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-5 py-4 pr-12 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-purple-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-purple-500/10 transition-all" />
          <button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-lg">
            {show?'🙈':'👁️'}
          </button>
        </div>
      </div>

      <button disabled={loading}
        className="w-full mt-2 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#9d6bff] hover:to-[#7077ff] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.7)] hover:shadow-[0_15px_40px_-10px_rgba(139,92,246,0.9)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-60">
        {loading?'Signing in...':'Sign In →'}
      </button>

      <p className="text-center text-[13.5px] text-white/45 pt-3">
        Don't have an account? <Link to="/register" className="text-[#a78bfa] font-semibold hover:text-[#c4b5fd]">Create account</Link>
      </p>
    </form>
  );
};
export default LoginForm;