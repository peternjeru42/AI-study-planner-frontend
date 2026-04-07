'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BookOpen, LogOut, Menu } from 'lucide-react';

import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';

export const Navbar: React.FC<{ showMenu?: boolean; onMenuToggle?: () => void }> = ({
  showMenu = false,
  onMenuToggle,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadUnreadCount = async () => {
      if (!user || user.role !== 'student') {
        setUnreadCount(0);
        return;
      }

      try {
        const count = await notificationsApi.unreadCount();
        if (!ignore) {
          setUnreadCount(count);
        }
      } catch {
        if (!ignore) {
          setUnreadCount(0);
        }
      }
    };

    loadUnreadCount();

    return () => {
      ignore = true;
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {showMenu ? (
            <button onClick={onMenuToggle} className="p-2 hover:bg-secondary rounded-lg transition md:hidden">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          ) : null}
          <Link href="/" className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-secondary">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">StudyFlow</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user?.role === 'student' ? (
            <button
              className="p-2 hover:bg-secondary rounded-lg transition relative"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          ) : null}

          <div className="h-8 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2 group relative">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">{user?.name}</span>

            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
