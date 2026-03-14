'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { grantPermissions, revokePermissions, toggleUserStatus } from '@/app/actions/user';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'suspended' | 'banned';
}

export function AdminUsersClient({ initialUsers, allAtoms }: { initialUsers: UserData[], allAtoms: string[] }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [createLoading, setCreateLoading] = useState(false);

  if (!currentUser) return null;

  const handleGrant = async (atom: string) => {
    if (!selectedUser) return;
    setError(null);
    try {
      const result = await grantPermissions(selectedUser._id, [atom]);
      if (result.success) {
        setUsers(users.map(u => 
          u._id === selectedUser._id ? { ...u, permissions: result.permissions } : u
        ));
        setSelectedUser({ ...selectedUser, permissions: result.permissions });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    setError(null);
    try {
      const nextStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
      const result = await toggleUserStatus(selectedUser._id, nextStatus);
      if (result.success) {
        setUsers(users.map(u => 
          u._id === selectedUser._id ? { ...u, status: result.status } : u
        ));
        setSelectedUser({ ...selectedUser, status: result.status });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreateLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setUsers([...users, data.user]);
      setIsCreating(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('agent');
      setSelectedUser(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:mx-auto">
      <div className="w-full md:w-1/3 flex flex-col gap-5">
        {currentUser.permissions.includes('write:users') && (
          <button
            onClick={() => { setIsCreating(true); setSelectedUser(null); setError(null); }}
            className="w-full py-3.5 px-4 bg-[#FF6B4A] hover:bg-[#E54D2B] text-white rounded-2xl shadow-lg shadow-[#FF6B4A]/30 font-bold transition-all"
          >
            + Add New User
          </button>
        )}
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/50 border border-zinc-100">
          <ul className="divide-y divide-zinc-100">
            {users.map(u => (
              <li 
                key={u._id} 
                onClick={() => { setSelectedUser(u); setIsCreating(false); setError(null); }}
                className={`p-5 cursor-pointer transition-all border-l-4 ${selectedUser?._id === u._id && !isCreating ? 'bg-[#FAFBFF] border-[#FF6B4A]' : 'border-transparent hover:bg-zinc-50'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-900">{u.name}</span>
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FF6B4A]/10 text-[#FF6B4A]">
                      {u.role}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 mt-1">{u.email}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full md:w-2/3">
        {isCreating ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Create New User</h3>
              <button onClick={() => setIsCreating(false)} className="text-sm font-semibold text-zinc-400 hover:text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-xl transition-all">Cancel</button>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2 ml-1">Full Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 rounded-xl outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2 ml-1">Email Address</label>
                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 rounded-xl outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2 ml-1">Password</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 rounded-xl outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2 ml-1">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 rounded-xl outline-none transition-all appearance-none bg-white">
                  {currentUser.role === 'admin' && <option value="admin">Admin</option>}
                  {(currentUser.role === 'admin' || currentUser.role === 'manager') && <option value="manager">Manager</option>}
                  <option value="agent">Agent</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <button disabled={createLoading} type="submit" className="w-full py-4 px-4 bg-[#FF6B4A] hover:bg-[#E54D2B] text-white rounded-xl shadow-lg shadow-[#FF6B4A]/30 font-bold transition-all disabled:opacity-50 mt-8">
                {createLoading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        ) : selectedUser ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                Edit <span className="text-[#FF6B4A]">{selectedUser.name}</span>
              </h3>
              
              {currentUser.permissions.includes('write:users') && currentUser.id !== selectedUser._id && (
                <button
                  onClick={handleStatusToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedUser.status === 'active' 
                      ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                  }`}
                >
                  {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-1">Permission Atoms</h4>
              {allAtoms.map(atom => {
                const hasPerm = selectedUser.permissions.includes(atom);
                const iHavePerm = currentUser.permissions.includes(atom);
                const isSelf = selectedUser._id === currentUser.id;
                
                // Can only mutate if you possess the atom (Grant Ceiling) AND not modifying yourself 
                const disabled = !iHavePerm || isSelf;

                return (
                  <div key={atom} className="flex items-center justify-between p-4 border border-zinc-100 rounded-2xl bg-[#FAFBFF] transition-colors hover:bg-zinc-50">
                    <div>
                      <div className="font-bold text-zinc-900 text-sm">{atom}</div>
                      {!iHavePerm && (
                        <div className="text-[11px] font-medium text-red-500 mt-0.5">You do not possess this atom.</div>
                      )}
                    </div>
                    <button
                      disabled={disabled}
                      onClick={() => hasPerm ? handleRevoke(atom) : handleGrant(atom)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        hasPerm 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {hasPerm ? 'Revoke' : 'Grant'}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-5 bg-yellow-50 border border-yellow-100 rounded-2xl text-sm text-yellow-800 font-medium">
              <strong>Grant Ceiling Active:</strong> You can only grant/revoke atoms that you inherently possess in your own token context.
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-3xl text-zinc-400 bg-zinc-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="font-medium text-zinc-500">Select a user to manage profile details</p>
            <p className="text-sm mt-1">or create a new user from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
