'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, BookOpen, Calendar, CheckSquare, LayoutDashboard, Settings, TrendingUp } from 'lucide-react';

import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const isStudent = user?.role === 'student';

  const studentNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/subjects', label: 'Subjects', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/assessments', label: 'Assessments', icon: <CheckSquare className="w-5 h-5" /> },
    { href: '/planner', label: 'Study Planner', icon: <Calendar className="w-5 h-5" /> },
    { href: '/progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const adminNavItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const navItems = isStudent ? studentNavItems : adminNavItems;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed md:sticky left-0 top-16 md:top-0 bottom-0 md:bottom-auto w-64 bg-sidebar border-r border-sidebar-border h-[calc(100vh-64px)] md:h-screen overflow-y-auto z-30 md:z-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
