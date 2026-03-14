'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldAlert, CheckCircle2, Key } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Welcome back, {user.name}. Here is your current token context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
                <h3 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white">Session Active</h3>
              </div>
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                <p>Email: <span className="font-semibold text-zinc-900 dark:text-white">{user.email}</span></p>
                <p>Role Template: <span className="font-semibold text-zinc-900 dark:text-white capitalize">{user.role}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <Key className="h-6 w-6 text-purple-500 mr-3" />
                <h3 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white">Resolved Atoms</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.permissions.length === 0 ? (
                  <span className="text-sm text-zinc-500">No explicit permissions</span>
                ) : (
                  user.permissions.map(atom => (
                    <span key={atom} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {atom}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {user.permissions.includes('write:reports') && (
           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-6">
             <div className="flex items-center mb-4">
               <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
               <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300">Restricted Component Demo</h3>
             </div>
             <p className="text-sm text-blue-700 dark:text-blue-400">
               You can see this block because you possess the <strong>write:reports</strong> atom. If this atom is revoked, this block will instantly disappear upon refresh.
             </p>
           </div>
        )}

      </div>
    </div>
  );
}
