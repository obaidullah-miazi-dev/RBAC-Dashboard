'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, Shield } from 'lucide-react';
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
      requiredAtom: 'read:dashboard',
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: Users,
      requiredAtom: 'read:users',
    },
    {
      label: 'Leads',
      href: '/dashboard/leads',
      icon: Users,
      requiredAtom: 'read:leads',
    },
    {
      label: 'Tasks',
      href: '/dashboard/tasks',
      icon: LayoutDashboard,
      requiredAtom: 'read:tasks',
    },
    {
      label: 'Reports',
      href: '/dashboard/reports',
      icon: LayoutDashboard,
      requiredAtom: 'read:reports',
    },
    {
      label: 'Audit Log',
      href: '/dashboard/audit-log',
      icon: Shield,
      requiredAtom: 'read:audit',
    },
    {
      label: 'Customer Portal',
      href: '/dashboard/customer-portal',
      icon: Users,
      requiredAtom: 'read:portal',
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: LayoutDashboard,
      requiredAtom: 'read:settings',
    },
  ];

  return (
    <aside className="w-64 bg-white text-zinc-900 flex flex-col h-full border-r border-zinc-100 shadow-sm shadow-zinc-200/40 relative z-20">
      <div className="h-20 flex items-center px-6 border-b border-zinc-100 mt-2">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <img src="/logo-text.png" alt="Obliq" className="h-6 object-contain" />
        </div>
      </div>
      
      <div className="p-5 border-b border-zinc-100 bg-[#FAFBFF]/50">
        <p className="text-sm font-bold text-zinc-900">{user.name}</p>
        <p className="text-xs text-zinc-500 font-medium capitalize mt-0.5">{user.role}</p>
      </div>

      <nav className="flex-1 py-5 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.requiredAtom && !userPermissions.includes(item.requiredAtom)) {
            return null;
          }

          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3.5 py-3 text-sm font-semibold rounded-xl transition-all ${
                isActive
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <item.icon className={`mr-3.5 h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-[#FF6B4A]' : 'text-zinc-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-zinc-100">
        <button
          onClick={logout}
          className="flex w-full items-center px-4 py-3 text-sm font-semibold text-zinc-600 rounded-xl hover:bg-zinc-50 hover:text-red-500 transition-colors group"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-zinc-400 group-hover:text-red-500 transition-colors" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
