import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#080614] font-sans">
      {/* BG */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#7c3aed33_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#4f46e533_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-40" style={{backgroundImage:'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize:'32px 32px'}}></div>

      {/* floating bubbles */}
      <div className="absolute top-[18%] left-[18%] text-4xl animate-bounce opacity-80 hidden md:block">💬</div>
      <div className="absolute top-[22%] right-[20%] text-3xl animate-pulse opacity-80 hidden md:block">✅</div>
      <div className="absolute bottom-[20%] left-[16%] text-4xl opacity-80 hidden md:block">💜</div>
      <div className="absolute bottom-[18%] right-[18%] text-4xl opacity-80 hidden md:block">😊</div>

      {/* Card */}
      <div className="relative w-full max-w-[440px]">
        <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500/50 via-white/10 to-indigo-500/50 rounded-[30px] blur-[1px]"></div>
        <div className="relative bg-[#121024]/90 backdrop-blur-2xl border border-white/10 rounded-[30px] p-9 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.4)]">

          <div className="text-center">
            <h1 className="text-[13px] font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
              AURA
            </h1>
            <h2 className="text-white text-[32px] font-extrabold mt-4 tracking-tight">Welcome Back</h2>
            <p className="text-white/50 text-[14px] mt-2">Sign in to continue your conversations</p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;