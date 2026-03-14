import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { AdminUsersClient } from './AdminUsersClient';
import { ALL_ATOMS } from '@/lib/constants'; // Need to create this

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await connectToDatabase();
  
  // Fetch users server-side to pass as initial data
  // Only pass non-sensitive info
  const users = await User.find({}, { passwordHash: 0, refreshTokens: 0 }).lean();
  
  // Convert _id to string for serialization
  const serializedUsers = users.map(user => ({
    ...user,
    _id: user._id.toString(),
  }));

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
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
