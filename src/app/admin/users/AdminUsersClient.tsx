'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { grantPermissions, revokePermissions } from '@/app/actions/user';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export function AdminUsersClient({ initialUsers, allAtoms }: { initialUsers: UserData[], allAtoms: string[] }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleGrant = async (atom: string) => {
    if (!selectedUser) return;
    setError(null);
    try {
      // Optimistic UI could be applied here
      const result = await grantPermissions(selectedUser._id, [atom]);
      if (result.success) {
        setUsers(users.map(u => 
          u._id === selectedUser._id ? { ...u, permissions: result.permissions } : u
        ));
        setSelectedUser({ ...selectedUser, permissions: result.permissions });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevoke = async (atom: string) => {
    if (!selectedUser) return;
    setError(null);
    try {
      const result = await revokePermissions(selectedUser._id, [atom]);
      if (result.success) {
        setUsers(users.map(u => 
          u._id === selectedUser._id ? { ...u, permissions: result.permissions } : u
        ));
        setSelectedUser({ ...selectedUser, permissions: result.permissions });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map(u => (
              <li 
                key={u._id} 
                onClick={() => { setSelectedUser(u); setError(null); }}
                className={`p-4 cursor-pointer transition-colors ${selectedUser?._id === u._id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-900 dark:text-white">{u.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">{u.email}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full md:w-1/2">
        {selectedUser ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Edit Permissions for <span className="text-blue-600 dark:text-blue-400">{selectedUser.name}</span>
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <div className="space-y-4">
              {allAtoms.map(atom => {
                const hasPerm = selectedUser.permissions.includes(atom);
                const iHavePerm = currentUser.permissions.includes(atom);
                const isSelf = selectedUser._id === currentUser.id;
                
                // Can only mutate if you possess the atom (Grant Ceiling) AND not modifying yourself (anti-lockout safeguard usually)
                const disabled = !iHavePerm || isSelf;

                return (
                  <div key={atom} className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-white text-sm">{atom}</div>
                      {!iHavePerm && (
                        <div className="text-xs text-red-500">You do not possess this atom.</div>
                      )}
                    </div>
                    <button
                      disabled={disabled}
                      onClick={() => hasPerm ? handleRevoke(atom) : handleGrant(atom)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        hasPerm 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {hasPerm ? 'Revoke' : 'Grant'}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-md text-sm text-yellow-800 dark:text-yellow-600">
              <strong>Grant Ceiling Active:</strong> You can only grant/revoke atoms that you inherently possess in your own token context.
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500">
            Select a user from the list to manage permissions.
          </div>
        )}
      </div>
    </div>
  );
}
