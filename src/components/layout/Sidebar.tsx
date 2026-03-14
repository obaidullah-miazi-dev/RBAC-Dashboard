'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  if (!user) return null; // Don't render if not logged in

  const userPermissions = user.permissions || [];

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      // Minimal permission to see dashboard link
      requiredAtom: 'read:dashboard',
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: Users,
      // Must have read:users to even see the link in the sidebar
      requiredAtom: 'read:users',
    },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-zinc-100 flex flex-col h-full border-r border-zinc-800">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <Shield className="w-6 h-6 text-blue-500 mr-2" />
        <span className="font-bold text-lg tracking-tight">RBAC System</span>
      </div>
      
      <div className="p-4 border-b border-zinc-800">
        <p className="text-sm font-medium text-white">{user.name}</p>
        <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          // Dynamic conditional rendering based on permission atoms
          if (item.requiredAtom && !userPermissions.includes(item.requiredAtom)) {
            return null; // Skip rendering if missing atom
          }

          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-500'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={logout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-zinc-300 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
