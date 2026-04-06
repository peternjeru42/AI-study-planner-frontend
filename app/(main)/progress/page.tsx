'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

import { progressApi, subjectsApi } from '@/lib/api';
import { Progress, Subject } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [overview, setOverview] = useState({
    averageCompletionRate: 0,
    totalStudyHours: 0,
    totalSubjects: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        setError('');
        const [overviewData, progressData, subjectData] = await Promise.all([
          progressApi.overview(),
          progressApi.subjects(),
          subjectsApi.list(),
        ]);
        if (!ignore) {
          setOverview(overviewData);
          setProgress(progressData);
          setSubjects(subjectData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load progress');
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const progressData = progress.map((item) => ({
    name: subjects.find((subject) => subject.id === item.subjectId)?.code || 'Unknown',
    completion: item.completionRate,
    hours: item.studyHours,
  }));

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Progress Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor your academic progress</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{Math.round(overview.averageCompletionRate)}%</p>
                <p className="text-sm text-muted-foreground">Average Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{overview.totalStudyHours}</p>
            <p className="text-sm text-muted-foreground">Total Study Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{overview.totalSubjects}</p>
            <p className="text-sm text-muted-foreground">Subjects</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Completion Rates</CardTitle>
          <CardDescription>Progress across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Bar dataKey="completion" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject Progress Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.map((item) => {
              const subject = subjects.find((candidate) => candidate.id === item.subjectId);
              return (
                <div key={item.subjectId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color }} />
                      <span className="font-medium text-foreground">{subject?.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{Math.round(item.completionRate)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${item.completionRate}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.completedAssignments} of {item.totalAssignments} completed • {item.studyHours} hours
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
