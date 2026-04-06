'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Calendar, CheckSquare, Users } from 'lucide-react';

import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      if (!user || user.role !== 'admin') return;
      try {
        const payload = await dashboardApi.admin();
        if (!ignore) {
          setData(payload);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview and management of the StudyFlow platform</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data?.activeStudents ?? 0}
          description="Active student accounts"
          icon={<Users className="w-8 h-8 text-blue-500" />}
        />
        <StatCard
          title="Assessments"
          value={data?.assessmentsCount ?? 0}
          description="Across all students"
          icon={<CheckSquare className="w-8 h-8 text-green-500" />}
        />
        <StatCard
          title="Study Plans"
          value={data?.generatedPlansCount ?? 0}
          description="Generated so far"
          icon={<Calendar className="w-8 h-8 text-purple-500" />}
        />
        <StatCard
          title="Notifications"
          value={data?.notificationsCount ?? 0}
          description="Stored in the backend"
          icon={<BarChart3 className="w-8 h-8 text-amber-500" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events from backend logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.recentLogs?.audit ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent audit logs available.</p>
              ) : (
                (data?.recentLogs?.audit ?? []).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.action}</p>
                      <p className="text-xs text-muted-foreground">{event.target_model}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Backend-backed scheduler state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Queued Jobs', value: data?.schedulerJobStats?.queued ?? 0 },
                { name: 'Running Jobs', value: data?.schedulerJobStats?.running ?? 0 },
                { name: 'Completed Jobs', value: data?.schedulerJobStats?.completed ?? 0 },
                { name: 'Failed Jobs', value: data?.schedulerJobStats?.failed ?? 0 },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{service.name}</span>
                  <div className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground">{service.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
