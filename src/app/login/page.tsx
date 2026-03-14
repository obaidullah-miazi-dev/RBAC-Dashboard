'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      login(data.accessToken, data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFBFF] relative overflow-hidden font-sans">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
       <div className='flex items-center gap-2'>
         <img src="/logo.png" alt="Obliq Logo Mark" className="h-8 w-auto object-contain" />
         <img src="/logo-text.png" alt="Obliq Typography" className="h-6 w-auto object-contain" />
       </div>
      </div>

      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 z-10 relative">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-bold text-zinc-900 mb-2">Login</h2>
            <p className="text-[15px] text-zinc-500">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-zinc-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-[#FAFBFF] border border-zinc-200 rounded-2xl text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 focus:border-[#FF6B4A] transition-all"
                placeholder="example@email.com"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="block text-[14px] font-medium text-zinc-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-12 py-3.5 bg-[#FAFBFF] border border-zinc-200 rounded-2xl text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 focus:border-[#FF6B4A] transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 rounded-[6px] border transition-colors ${rememberMe ? 'bg-[#FF6B4A] border-[#FF6B4A]' : 'bg-[#FAFBFF] border-zinc-200 group-hover:border-[#FF6B4A]/50'}`}></div>
                  {rememberMe && (
                    <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[14px] text-zinc-500 select-none">Remember me</span>
              </label>
              
              <a href="#" className="text-[14px] font-medium text-[#FF6B4A] hover:text-[#E55A3B] transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl text-[15px] font-semibold text-white bg-[#FF6B4A] hover:bg-[#E55A3B] focus:outline-none focus:ring-4 focus:ring-[#FF6B4A]/20 disabled:opacity-70 transition-all shadow-[0_8px_20px_-6px_rgba(255,107,74,0.5)] shadow-[#FF6B4A]/30 hover:shadow-[#FF6B4A]/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-8 font-medium">
            Don&apos;t have an account? <a href="#" className="font-bold text-zinc-900 hover:text-[#FF6B4A] transition-colors">Sign up</a>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:block lg:w-1/2 relative p-4">
        <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-[0_0_40px_rgba(255,107,74,0.1)] bg-gradient-to-br from-[#FF9854] via-[#FF7543] to-[#E54D2B]">
          {/* Background Vector Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/vector.png" 
              alt="Decorative Background" 
              className="w-full h-full object-cover opacity-80"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* Overflowing Dashboard Image */}
          <div className="absolute top-24 bottom-24 -right-1/4 left-16 z-10 flex items-center shadow-[-20px_20px_60px_-15px_rgba(0,0,0,0.3)]">
            <img 
              src="/dashboard.png" 
              alt="Dashboard Preview" 
              className="w-auto h-auto min-w-[120%] object-cover object-left rounded-l-2xl border-y border-l border-white/20"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
