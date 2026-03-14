import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import Role from '@/models/Role';
import UserPermission from '@/models/UserPermission';
import mongoose from 'mongoose';

const ALL_ATOMS = [
  'read:dashboard',
  'read:users',
  'write:users',
  'grant:permissions',
  'read:reports',
  'write:reports',
];

async function seed() {
  await connectToDatabase();

  // 1. Seed Roles
  const roles = [
    { name: 'admin', description: 'System Administrator', permissions: ALL_ATOMS },
    { name: 'manager', description: 'Regional Manager', permissions: ['read:dashboard', 'read:users', 'read:reports', 'grant:permissions'] },
    { name: 'agent', description: 'Field Agent', permissions: ['read:dashboard'] },
    { name: 'customer', description: 'Client User', permissions: [] },
  ];

  for (const roleData of roles) {
    const existingRole = await Role.findOne({ name: roleData.name });
    if (!existingRole) {
      await Role.create(roleData);
      console.log(`Seeded role: ${roleData.name}`);
    }
  }

  // 2. Seed Users & their Permissions
  const usersToSeed = [
    {
      email: 'admin@example.com',
      passwordHash: 'password', // Test password bypass implemented in login route
      name: 'Super Admin',
      role: 'admin',
      status: 'active',
      perms: ALL_ATOMS, // Base perms for admin
    },
    {
      email: 'manager@example.com',
      passwordHash: 'password',
      name: 'Regional Manager',
      role: 'manager',
      status: 'active',
      perms: ['read:dashboard', 'read:users', 'read:reports', 'grant:permissions'],
    },
    {
      email: 'agent@example.com',
      passwordHash: 'password',
      name: 'Field Agent',
      role: 'agent',
      status: 'active',
      perms: ['read:dashboard'],
    }
  ];

  for (const u of usersToSeed) {
    let existingUser = await User.findOne({ email: u.email });
    
    if (!existingUser) {
      existingUser = await User.create({
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        status: u.status,
      });
      console.log(`Seeded user (${u.email} / password)`);
      
      // Create UserPermission
      await UserPermission.create({
        userId: existingUser._id,
        grantedPermissions: u.perms,
        revokedPermissions: [],
      });
      console.log(`Seeded user permissions for ${u.email}`);
    } else {
      // Backfill status if missing for existing users
      if (!existingUser.status) {
        existingUser.status = u.status as any;
        await existingUser.save();
        console.log(`Backfilled status for existing user: ${u.email}`);
      }
      
      // Also ensure UserPermission exists for them
      const existingPerms = await UserPermission.findOne({ userId: existingUser._id });
      if (!existingPerms) {
        await UserPermission.create({
          userId: existingUser._id,
          grantedPermissions: u.perms,
          revokedPermissions: [],
        });
        console.log(`Backfilled UserPermission for: ${u.email}`);
      }
    }
  }
}

seed().then(() => {
  console.log('Seed check complete');
  mongoose.disconnect();
}).catch(console.error);
