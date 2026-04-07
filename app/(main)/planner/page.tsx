'use client';

import { useEffect, useState } from 'react';
import { Bot, RefreshCw, Sparkles } from 'lucide-react';

import { PlannerAIModel, PlannerAIResponse, plannerApi } from '@/lib/api';
import { StudySession } from '@/lib/types';
import { DateUtils } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function PlannerPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [models, setModels] = useState<PlannerAIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini');
  const [question, setQuestion] = useState('What should I focus on this week to stay ahead of deadlines?');
  const [aiResponse, setAiResponse] = useState<PlannerAIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [error, setError] = useState('');
  const [assistantError, setAssistantError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [currentPlan, availableModels] = await Promise.all([plannerApi.current(), plannerApi.aiModels()]);
      const currentSessions = (currentPlan?.sessions ?? []).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      })) as StudySession[];
      setSessions(currentSessions);
      setModels(availableModels);
      const recommendedModel = availableModels.find((item) => item.recommended)?.id;
      if (recommendedModel) {
        setSelectedModel(recommendedModel);
      }
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

  const handleAskAssistant = async () => {
    if (!question.trim()) {
      setAssistantError('Enter a question for the AI study assistant.');
      return;
    }

    setAssistantLoading(true);
    setAssistantError('');
    try {
      const result = await plannerApi.aiAssistant({ model: selectedModel, question: question.trim() });
      setAiResponse(result);
    } catch (err) {
      setAssistantError(err instanceof Error ? err.message : 'Failed to generate AI guidance');
    } finally {
      setAssistantLoading(false);
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

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>AI Study Assistant</CardTitle>
              <CardDescription>Use OpenAI models to analyze your current study load and generate tailored guidance.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}{model.recommended ? ' (Recommended)' : ''}
                  </option>
                ))}
              </select>
              {models.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {models.find((model) => model.id === selectedModel)?.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Question</label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="Ask for prioritization, schedule risks, revision strategy, or how to handle multiple deadlines."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              The assistant uses your current subjects, pending assessments, and upcoming sessions as context.
            </p>
            <Button onClick={handleAskAssistant} disabled={assistantLoading} className="gap-2">
              <Sparkles className={`h-4 w-4 ${assistantLoading ? 'animate-pulse' : ''}`} />
              {assistantLoading ? 'Generating Guidance...' : 'Ask AI Assistant'}
            </Button>
          </div>

          {assistantError ? <p className="text-sm text-destructive">{assistantError}</p> : null}

          {aiResponse ? (
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-1 text-foreground">{aiResponse.model}</span>
                <span>{aiResponse.contextSummary.subjectsCount} subjects</span>
                <span>{aiResponse.contextSummary.assessmentsCount} assessments</span>
                <span>{aiResponse.contextSummary.sessionsCount} upcoming sessions</span>
              </div>
              <p className="mb-3 text-sm font-medium text-foreground">{aiResponse.question}</p>
              <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">{aiResponse.answer}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
