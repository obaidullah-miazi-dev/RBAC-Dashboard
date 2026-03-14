import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { AdminUsersClient } from './AdminUsersClient';
import { ALL_ATOMS } from '@/lib/constants'; 
import { resolveUserPermissions } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await connectToDatabase();
  
  // Fetch users server-side to pass as initial data
  // Only pass non-sensitive info
  const users = await User.find({}, { passwordHash: 0, refreshTokens: 0 }).lean();
  
  // Calculate final permissions for every user
  let serializedUsers = [];
  try {
    // Fetch users server-side to pass as initial data
    // Only pass non-sensitive info
    const users = await User.find({}, { passwordHash: 0, refreshTokens: 0 }).lean();
    
    // Calculate final permissions for every user
    serializedUsers = await Promise.all(
      users.map(async (user) => {
        const finalPermissions = await resolveUserPermissions(user._id.toString());
        return {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          permissions: finalPermissions,
        };
      })
    );
  } catch (err: unknown) {
    console.error('Error fetching users:', err);
    return <div className="p-8 text-red-500">Failed to load users: {err instanceof Error ? err.message : 'Unknown error'}</div>;
  }

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">User Management</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Click on a user to manage their permission atoms. Grant Ceiling enforcements apply.
          </p>
        </div>
        
        <div className="mt-8">
          <AdminUsersClient initialUsers={serializedUsers as any} allAtoms={ALL_ATOMS} />
        </div>
      </div>
    </div>
  );
}
