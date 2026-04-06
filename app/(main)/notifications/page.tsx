'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';

import { notificationsApi } from '@/lib/api';
import { Notification } from '@/lib/types';
import { DateUtils } from '@/lib/utils/date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      setError('');
      setNotifications(await notificationsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const filtered = notifications.filter((notification) => (filter === 'unread' ? !notification.read : true));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline-reminder':
        return '🗓️';
      case 'session-reminder':
        return '⏰';
      case 'overdue-alert':
        return '⚠️';
      case 'daily-plan':
        return '📋';
      case 'weekly-summary':
        return '📊';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your study progress</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All ({notifications.length})
        </Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>
          Unread ({notifications.filter((notification) => !notification.read).length})
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary rounded-lg">
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">No notifications</h3>
                  <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notification) => (
            <Card key={notification.id} className={!notification.read ? 'border-primary/50 bg-primary/5' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{DateUtils.formatDateTime(new Date(notification.createdAt))}</p>
                      </div>
                      <Badge variant={notification.read ? 'secondary' : 'default'} className="shrink-0">
                        {notification.channel}
                      </Badge>
                    </div>
                  </div>
                  {!notification.read ? (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
