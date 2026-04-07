'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, PencilLine, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';

import { PlannerAIModel, plannerApi } from '@/lib/api';
import { AIPlanDraft, AIPlanDraftSession, StudyPlan, StudyScope, StudyDurationUnit } from '@/lib/types';
import { DateUtils } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const EXAMPLE_PROMPT =
  'For instance I want to study Discrete maths unit for 10 hours a week excluding Tuesdays, create a study plan.';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
type DraftEditor = AIPlanDraft & { model?: string };

const toDateInput = (value: Date) => value.toISOString().split('T')[0];
const nextDay = () => {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  return value;
};

const newSession = (index: number): AIPlanDraftSession => ({
  tempId: `session-${Date.now()}-${index}`,
  title: `Study Session ${index}`,
  sessionDate: toDateInput(nextDay()),
  startTime: '09:00',
  endTime: '10:00',
  duration: 60,
  sessionType: 'revision',
  notes: '',
});

const emptyDraft = (model?: string): DraftEditor => ({
  model,
  title: '',
  studyScope: 'unit',
  targetName: '',
  durationValue: 10,
  durationUnit: 'hours',
  excludedDays: [],
  instructions: EXAMPLE_PROMPT,
  summary: '',
  startDate: toDateInput(nextDay()),
  endDate: toDateInput(nextDay()),
  sessions: [],
});

const planToDraft = (plan: StudyPlan, model?: string): DraftEditor => {
  if (plan.aiDraft) return { ...plan.aiDraft, model };
  return {
    model,
    title: plan.title,
    studyScope: 'course',
    targetName: plan.title.replace(/ study plan$/i, ''),
    durationValue: Math.max(1, Math.round(plan.sessions.reduce((sum, item) => sum + item.duration, 0) / 60)),
    durationUnit: 'hours',
    excludedDays: [],
    instructions: '',
    summary: '',
    startDate: plan.generatedForStartDate,
    endDate: plan.generatedForEndDate,
    sessions: plan.sessions.map((item, index) => ({
      tempId: `existing-${item.id}-${index}`,
      title: item.title,
      sessionDate: item.sessionDate ?? toDateInput(item.startTime),
      startTime: item.startTime.toTimeString().slice(0, 5),
      endTime: item.endTime.toTimeString().slice(0, 5),
      duration: item.duration,
      sessionType: item.sessionType ?? 'revision',
      notes: '',
    })),
  };
};

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [models, setModels] = useState<PlannerAIModel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editor, setEditor] = useState<DraftEditor>(emptyDraft('gpt-5-mini'));
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError('');
      const [nextPlans, nextModels] = await Promise.all([plannerApi.plans(), plannerApi.aiModels()]);
      setPlans(nextPlans);
      setModels(nextModels);
      const recommended = nextModels.find((item) => item.recommended)?.id ?? nextModels[0]?.id ?? 'gpt-5-mini';
      setEditor((current) => ({ ...current, model: current.model || recommended }));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load planner data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const allSessions = useMemo(
    () =>
      plans.flatMap((plan) =>
        plan.sessions.map((session) => ({ ...session, planTitle: plan.title, generationTrigger: plan.generationTrigger })),
      ),
    [plans],
  );
  const plannedSessions = useMemo(() => allSessions.filter((item) => item.status === 'planned'), [allSessions]);
  const aiPlans = useMemo(() => plans.filter((item) => item.generationTrigger === 'ai_custom'), [plans]);
  const assessmentSessions = useMemo(
    () => plannedSessions.filter((item) => item.generationTrigger !== 'ai_custom'),
    [plannedSessions],
  );
  const todaySessions = useMemo(() => plannedSessions.filter((item) => DateUtils.isToday(item.startTime)), [plannedSessions]);
  const upcomingSessions = useMemo(
    () =>
      [...plannedSessions]
        .filter((item) => item.startTime > new Date())
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 10),
    [plannedSessions],
  );

  const openCreate = () => {
    const recommended = models.find((item) => item.recommended)?.id ?? models[0]?.id ?? 'gpt-5-mini';
    setEditingPlanId(null);
    setModalError('');
    setEditor(emptyDraft(recommended));
    setModalOpen(true);
  };

  const openEdit = (plan: StudyPlan) => {
    const recommended = models.find((item) => item.recommended)?.id ?? models[0]?.id ?? 'gpt-5-mini';
    setEditingPlanId(plan.id);
    setModalError('');
    setEditor(planToDraft(plan, recommended));
    setModalOpen(true);
  };

  const generateAssessmentPlan = async () => {
    try {
      setAssessmentLoading(true);
      setPageError('');
      await plannerApi.generate();
      await loadData();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to generate the assessment plan.');
    } finally {
      setAssessmentLoading(false);
    }
  };

  const generateDraft = async () => {
    if (!editor.targetName.trim()) {
      setModalError('Enter the unit, topic, or course you want to study.');
      return;
    }
    try {
      setDraftLoading(true);
      setModalError('');
      const response = await plannerApi.aiDraft({
        model: editor.model,
        studyScope: editor.studyScope,
        targetName: editor.targetName.trim(),
        durationValue: Number(editor.durationValue),
        durationUnit: editor.durationUnit,
        excludedDays: editor.excludedDays,
        instructions: editor.instructions ?? '',
      });
      setEditor({ ...response.draft, model: response.model });
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to generate the AI draft.');
    } finally {
      setDraftLoading(false);
    }
  };

  const savePlan = async () => {
    if (!editor.title.trim()) {
      setModalError('Add a plan title before saving.');
      return;
    }
    if (editor.sessions.length === 0) {
      setModalError('Generate or add at least one session before saving.');
      return;
    }
    try {
      setSaving(true);
      setModalError('');
      if (editingPlanId) {
        await plannerApi.aiUpdate(editingPlanId, editor);
      } else {
        await plannerApi.aiSave(editor);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to save the AI plan.');
    } finally {
      setSaving(false);
    }
  };

  const setSessionField = (tempId: string, field: keyof AIPlanDraftSession, value: string | number) => {
    setEditor((current) => ({
      ...current,
      sessions: current.sessions.map((session) => {
        if (session.tempId !== tempId) return session;
        const next = { ...session, [field]: value };
        if (field === 'startTime' || field === 'duration') {
          const [hour, minute] = String(next.startTime).split(':').map(Number);
          const end = new Date();
          end.setHours(hour, minute + Number(next.duration), 0, 0);
          next.endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        }
        return next;
      }),
    }));
  };

  const toggleExcludedDay = (day: string) => {
    setEditor((current) => ({
      ...current,
      excludedDays: current.excludedDays.includes(day)
        ? current.excludedDays.filter((item) => item !== day)
        : [...current.excludedDays, day],
    }));
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">Planner Workspace</p>
          <h1 className="text-3xl font-bold text-foreground">Build custom study plans that fit your real schedule.</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Create an AI plan for a unit, topic, or course, edit the draft before you save, and let StudyFlow queue reminders
            one hour before each study session.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={openCreate}
            size="lg"
            className="cursor-pointer rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-[0_20px_45px_-22px_rgba(37,99,235,0.95)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600 hover:shadow-[0_24px_50px_-20px_rgba(14,165,233,0.85)]"
          >
            <Sparkles className="h-4 w-4" />
            Generate Study Plan
          </Button>
          <Button
            onClick={generateAssessmentPlan}
            disabled={assessmentLoading}
            size="lg"
            variant="outline"
            className="cursor-pointer rounded-2xl border-sky-200 bg-white/80 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
          >
            <RefreshCw className={`h-4 w-4 ${assessmentLoading ? 'animate-spin' : ''}`} />
            {assessmentLoading ? 'Generating...' : 'Generate from Assessments'}
          </Button>
        </div>
      </div>

      {pageError ? <p className="text-sm text-destructive">{pageError}</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-3xl font-bold">{plannedSessions.length}</p><p className="text-sm text-muted-foreground">Scheduled Sessions</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-3xl font-bold">{aiPlans.length}</p><p className="text-sm text-muted-foreground">Custom AI Plans</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-3xl font-bold">{todaySessions.length}</p><p className="text-sm text-muted-foreground">Sessions Today</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-3xl font-bold">{(plannedSessions.reduce((sum, item) => sum + item.duration, 0) / 60).toFixed(1)}</p><p className="text-sm text-muted-foreground">Planned Hours</p></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Card className="border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50">
          <CardHeader>
            <CardTitle>Current Study Plans</CardTitle>
            <CardDescription>Your saved AI plans. Edit them whenever the week changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p className="text-sm text-muted-foreground">Loading plans...</p> : null}
            {!loading && aiPlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-6 text-sm text-muted-foreground">
                No custom AI plans yet. Generate one from a unit, topic, or course.
              </div>
            ) : null}
            {aiPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{plan.title}</p>
                    <p className="text-sm text-muted-foreground">{plan.sessions.length} sessions - {plan.generatedForStartDate} to {plan.generatedForEndDate}</p>
                    <p className="mt-1 text-xs text-sky-700">Reminders are queued 1 hour before every session.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(plan)} className="cursor-pointer rounded-xl border-sky-200 hover:bg-sky-50">
                    <PencilLine className="h-4 w-4" />
                    Edit Plan
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  {plan.sessions.slice(0, 4).map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-950">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{session.sessionDate} - {DateUtils.formatTime(session.startTime)} to {DateUtils.formatTime(session.endTime)}</p>
                      </div>
                      <span className="text-xs font-medium text-sky-700">{session.duration} min</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment-Based Schedule</CardTitle>
              <CardDescription>The deterministic planner still turns your assessments into study blocks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assessmentSessions.length === 0 ? <p className="text-sm text-muted-foreground">No assessment-generated sessions yet.</p> : assessmentSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="rounded-xl border border-border px-4 py-3">
                  <p className="font-medium text-foreground">{session.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{DateUtils.formatDateTime(session.startTime)} - {session.duration} min</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>The next ten sessions across your current plans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming sessions.</p> : upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{session.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{DateUtils.formatDateTime(session.startTime)}</p>
                    <p className="mt-1 text-xs text-sky-700">{session.planTitle}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{session.duration} min</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingPlanId ? 'Edit AI Study Plan' : 'Generate AI Study Plan'}</DialogTitle>
            <DialogDescription>Tell the model what to plan, then edit the sessions before you save them.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-sm font-medium text-slate-950">Example</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{EXAMPLE_PROMPT}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <select value={editor.model ?? ''} onChange={(e) => setEditor((current) => ({ ...current, model: e.target.value }))} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200">
                  {models.map((model) => <option key={model.id} value={model.id}>{model.label}{model.recommended ? ' (Recommended)' : ''}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">{models.find((model) => model.id === editor.model)?.description}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Title</label>
                <Input value={editor.title} onChange={(e) => setEditor((current) => ({ ...current, title: e.target.value }))} placeholder="Discrete Maths Study Plan" className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Study Scope</label>
                <select value={editor.studyScope} onChange={(e) => setEditor((current) => ({ ...current, studyScope: e.target.value as StudyScope }))} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200">
                  <option value="unit">Unit</option><option value="topic">Topic</option><option value="course">Course</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">What do you want to study?</label>
                <Input value={editor.targetName} onChange={(e) => setEditor((current) => ({ ...current, targetName: e.target.value }))} placeholder="Discrete Maths" className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input type="number" min={1} value={editor.durationValue} onChange={(e) => setEditor((current) => ({ ...current, durationValue: Number(e.target.value) || 1 }))} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select value={editor.durationUnit} onChange={(e) => setEditor((current) => ({ ...current, durationUnit: e.target.value as StudyDurationUnit }))} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200">
                  <option value="hours">Hours</option><option value="days">Days</option><option value="weeks">Weeks</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excluded Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const active = editor.excludedDays.includes(day);
                  return (
                    <button key={day} type="button" onClick={() => toggleExcludedDay(day)} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${active ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Extra Instructions</label>
              <Textarea rows={4} value={editor.instructions ?? ''} onChange={(e) => setEditor((current) => ({ ...current, instructions: e.target.value }))} placeholder={EXAMPLE_PROMPT} />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-950">Generate the first draft</p>
                <p className="text-xs text-muted-foreground">The AI will return editable sessions that you can adjust before saving.</p>
              </div>
              <Button type="button" onClick={generateDraft} disabled={draftLoading} className="cursor-pointer rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-[0_20px_45px_-22px_rgba(37,99,235,0.95)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600 hover:shadow-[0_24px_50px_-20px_rgba(14,165,233,0.85)]">
                <Sparkles className={`h-4 w-4 ${draftLoading ? 'animate-pulse' : ''}`} />
                {draftLoading ? 'Generating Draft...' : 'Generate Draft'}
              </Button>
            </div>

            {modalError ? <p className="text-sm text-destructive">{modalError}</p> : null}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950">Editable Sessions</p>
                  <p className="text-sm text-muted-foreground">Accept the draft or edit every block before saving.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => setEditor((current) => ({ ...current, sessions: [...current.sessions, newSession(current.sessions.length + 1)] }))} className="cursor-pointer rounded-xl border-sky-200 hover:bg-sky-50">
                  <Plus className="h-4 w-4" />
                  Add Session
                </Button>
              </div>

              {editor.sessions.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground">No draft sessions yet. Generate a draft or add one manually.</div> : (
                <div className="space-y-4">
                  {editor.sessions.map((session, index) => (
                    <div key={session.tempId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-950">Session {index + 1}</p>
                        <button type="button" onClick={() => setEditor((current) => ({ ...current, sessions: current.sessions.filter((item) => item.tempId !== session.tempId) }))} className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs text-rose-600 transition hover:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</label>
                          <Input value={session.title} onChange={(e) => setSessionField(session.tempId, 'title', e.target.value)} className="h-10 rounded-xl bg-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</label>
                          <Input type="date" value={session.sessionDate} onChange={(e) => setSessionField(session.tempId, 'sessionDate', e.target.value)} className="h-10 rounded-xl bg-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Start Time</label>
                          <Input type="time" value={session.startTime} onChange={(e) => setSessionField(session.tempId, 'startTime', e.target.value)} className="h-10 rounded-xl bg-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration (Minutes)</label>
                          <Input type="number" min={15} step={15} value={session.duration} onChange={(e) => setSessionField(session.tempId, 'duration', Number(e.target.value) || 60)} className="h-10 rounded-xl bg-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</label>
                          <select value={session.sessionType} onChange={(e) => setSessionField(session.tempId, 'sessionType', e.target.value)} className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200">
                            <option value="reading">Reading</option><option value="revision">Revision</option><option value="assignment_work">Assignment Work</option><option value="exam_prep">Exam Prep</option><option value="project_work">Project Work</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</label>
                          <Textarea rows={3} value={session.notes ?? ''} onChange={(e) => setSessionField(session.tempId, 'notes', e.target.value)} className="bg-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-4 w-4 text-sky-600" />
                Study reminders will be created 1 hour before every saved session.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="cursor-pointer rounded-xl">Cancel</Button>
                <Button type="button" onClick={savePlan} disabled={saving} className="cursor-pointer rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-[0_20px_45px_-22px_rgba(37,99,235,0.95)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600 hover:shadow-[0_24px_50px_-20px_rgba(14,165,233,0.85)]">
                  {saving ? 'Saving Plan...' : editingPlanId ? 'Save Changes' : 'Accept and Save'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
