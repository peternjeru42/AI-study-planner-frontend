'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, LogOut } from 'lucide-react';

import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { StudyPreferences } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const { user, profile, updateAuthState, logout } = useAuth();
  const [preferences, setPreferences] = useState<StudyPreferences | null>(profile);
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const buildDefaultPreferences = (userId: string): StudyPreferences => ({
    userId,
    startTime: '08:00',
    endTime: '22:00',
    sessionLength: 60,
    breakLength: 15,
    maxSessionsPerDay: 6,
    weekendAvailable: true,
    enableInAppNotifications: true,
    enableEmailNotificationsSimulated: true,
    darkMode: false,
    timezone: 'Africa/Nairobi',
  });

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        setError('');
        const payload = await authApi.me();
        if (!ignore) {
          updateAuthState(payload.user, payload.profile);
          setPreferences(payload.profile ?? buildDefaultPreferences(payload.user.id));
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load settings');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSavePreferences = async () => {
    if (!preferences || !user) return;
    try {
      setError('');
      const payload = await authApi.updateProfile({
        name: user.name,
        ...preferences,
      });
      updateAuthState(payload.user, payload.profile);
      setPreferences(payload.profile);
      setSavedMessage('Preferences saved successfully!');
      window.setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (loading || !user || !preferences) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {savedMessage ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{savedMessage}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input value={user.name} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Input value={user.role} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Member Since</label>
              <Input value={user.enrollmentDate.toLocaleDateString()} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Preferences</CardTitle>
          <CardDescription>Customize your study schedule settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preferred Study Start Time</label>
              <Input type="time" value={preferences.startTime} onChange={(e) => setPreferences({ ...preferences, startTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preferred Study End Time</label>
              <Input type="time" value={preferences.endTime} onChange={(e) => setPreferences({ ...preferences, endTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Study Session Length (minutes)</label>
              <Input
                type="number"
                min="15"
                max="180"
                step="15"
                value={preferences.sessionLength}
                onChange={(e) => setPreferences({ ...preferences, sessionLength: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Break Length (minutes)</label>
              <Input
                type="number"
                min="5"
                max="60"
                step="5"
                value={preferences.breakLength}
                onChange={(e) => setPreferences({ ...preferences, breakLength: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max Sessions Per Day</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={preferences.maxSessionsPerDay}
                onChange={(e) => setPreferences({ ...preferences, maxSessionsPerDay: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={preferences.weekendAvailable}
                  onChange={(e) => setPreferences({ ...preferences, weekendAvailable: e.target.checked })}
                  className="w-4 h-4 border border-input rounded cursor-pointer"
                />
                Study on Weekends
              </label>
            </div>
          </div>

          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="in-app"
                checked={preferences.enableInAppNotifications ?? true}
                onChange={(e) => setPreferences({ ...preferences, enableInAppNotifications: e.target.checked })}
                className="w-4 h-4 border border-input rounded cursor-pointer"
              />
              <label htmlFor="in-app" className="text-sm text-foreground cursor-pointer">In-app notifications</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email"
                checked={preferences.enableEmailNotificationsSimulated ?? true}
                onChange={(e) => setPreferences({ ...preferences, enableEmailNotificationsSimulated: e.target.checked })}
                className="w-4 h-4 border border-input rounded cursor-pointer"
              />
              <label htmlFor="email" className="text-sm text-foreground cursor-pointer">Email notifications (simulated)</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Sign out of your current session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
