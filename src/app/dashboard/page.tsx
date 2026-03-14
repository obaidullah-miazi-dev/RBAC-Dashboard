'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldAlert, CheckCircle2, Key } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex-1 p-8 lg:p-12">
      <div className="mx-auto space-y-10">
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome back, {user.name} 👋</h1>
            <p className="mt-2 text-zinc-500 font-medium">
              Here is your current session token context and access level.
            </p>
          </div>
          <div className="bg-[#FF6B4A]/10 px-6 py-3 rounded-2xl border border-[#FF6B4A]/20 flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] animate-pulse" />
             <span className="text-[#FF6B4A] font-bold tracking-wide uppercase text-sm">{user.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white overflow-hidden shadow-xl shadow-zinc-200/50 rounded-3xl border border-zinc-100 relative group transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 className="w-32 h-32 text-green-500" />
            </div>
            <div className="px-8 py-8 relative z-10">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-2xl mr-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Profile Details</h3>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Email Address</p>
                  <p className="font-semibold text-zinc-900 text-lg">{user.email}</p>
                </div>
                <div>
                   <p className="text-sm text-zinc-500 font-medium">Account ID</p>
                   <p className="font-mono text-xs text-zinc-600 bg-zinc-50 p-2 rounded-lg mt-1 inline-block border border-zinc-100">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl shadow-zinc-200/50 rounded-3xl border border-zinc-100 relative group transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Key className="w-32 h-32 text-[#FF6B4A]" />
            </div>
            <div className="px-8 py-8 relative z-10">
              <div className="flex items-center">
                <div className="bg-[#FF6B4A]/10 p-3 rounded-2xl mr-4">
                  <Key className="h-6 w-6 text-[#FF6B4A]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Resolved Atoms</h3>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {user.permissions.length === 0 ? (
                  <span className="text-sm text-zinc-500 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">No explicit permissions</span>
                ) : (
                  user.permissions.map(atom => (
                    <span key={atom} className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B4A]/10 text-[#E54D2B] border border-[#FF6B4A]/20">
                      {atom}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {user.permissions.includes('write:reports') && (
           <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 shadow-lg shadow-blue-100/50">
             <div className="flex items-center mb-4">
               <div className="bg-blue-100 p-2 rounded-xl mr-3">
                 <ShieldAlert className="h-6 w-6 text-blue-600" />
               </div>
               <h3 className="text-xl font-bold text-blue-900">Restricted Component Demo</h3>
             </div>
             <p className="text-blue-800 font-medium leading-relaxed max-w-3xl">
               You can see this block because your token possesses the <span className="bg-white px-2 py-1 rounded-lg shadow-sm border border-blue-100 mx-1 font-bold">write:reports</span> atom. If an admin revokes this atom, the Middleware will intercept your next render and this block will securely disappear.
             </p>
           </div>
        )}

      </div>
    </div>
  );
}
