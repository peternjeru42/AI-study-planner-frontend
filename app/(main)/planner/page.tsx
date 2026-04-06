'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { plannerApi } from '@/lib/api';
import { StudySession } from '@/lib/types';
import { DateUtils } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlannerPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const currentPlan = await plannerApi.current();
      const currentSessions = (currentPlan?.sessions ?? []).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      })) as StudySession[];
      setSessions(currentSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load planner');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await plannerApi.generate();
      const nextSessions = (result.sessions ?? []).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      })) as StudySession[];
      setSessions(nextSessions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const todaySessions = sessions.filter((session) => new Date(session.startTime).toDateString() === today.toDateString());
  const upcomingSessions = sessions
    .filter((session) => new Date(session.startTime) > today)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Planner</h1>
          <p className="text-muted-foreground mt-1">Generate and manage your study schedule</p>
        </div>
        <Button onClick={handleGeneratePlan} disabled={loading} className="gap-2" size="lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Generate Plan'}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{sessions.length}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{todaySessions.length}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{(sessions.reduce((sum, session) => sum + session.duration, 0) / 60).toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Total Hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Sessions</CardTitle>
          <CardDescription>{todaySessions.length} sessions scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <p className="text-muted-foreground">No sessions scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todaySessions.map((session) => (
                <div key={session.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{session.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {DateUtils.formatTime(new Date(session.startTime))} - {DateUtils.formatTime(new Date(session.endTime))}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">{session.duration} min</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Next 10 scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground">No upcoming sessions</p>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{session.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{DateUtils.formatDateTime(new Date(session.startTime))}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{session.duration} min</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
