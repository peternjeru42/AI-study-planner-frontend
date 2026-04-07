import {
  Assessment,
  Notification,
  Progress,
  ScheduledTask,
  StudyPlan,
  StudyPreferences,
  StudySession,
  Subject,
  TaskRun,
  User,
} from '@/lib/types';

const toDate = (value?: string | null) => (value ? new Date(value) : undefined);

export const mapUser = (payload: any): User => ({
  id: payload.id,
  name: payload.name,
  email: payload.email,
  role: payload.role,
  username: payload.username,
  isActive: payload.isActive,
  isVerified: payload.isVerified,
  enrollmentDate: new Date(payload.enrollmentDate ?? payload.createdAt),
});

export const mapStudyPreferences = (payload: any): StudyPreferences => ({
  userId: payload.userId,
  courseName: payload.courseName,
  yearOfStudy: payload.yearOfStudy,
  institutionName: payload.institutionName,
  timezone: payload.timezone,
  startTime: payload.startTime,
  endTime: payload.endTime,
  sessionLength: payload.sessionLength,
  breakLength: payload.breakLength,
  maxSessionsPerDay: payload.maxSessionsPerDay,
  weekendAvailable: payload.weekendAvailable,
  enableInAppNotifications: payload.enableInAppNotifications,
  enableEmailNotificationsSimulated: payload.enableEmailNotificationsSimulated,
  darkMode: payload.darkMode,
});

export const mapSubject = (payload: any): Subject => ({
  id: payload.id,
  name: payload.name,
  code: payload.code,
  instructor: payload.instructor,
  color: payload.color,
  semester: payload.semester,
  description: payload.description,
  userId: payload.userId,
  isActive: payload.isActive,
});

export const mapAssessment = (payload: any): Assessment => ({
  id: payload.id,
  title: payload.title,
  subjectId: payload.subjectId,
  type: payload.type,
  dueDate: new Date(payload.dueDate),
  dueTime: payload.dueTime ?? undefined,
  weight: Number(payload.weight),
  estimatedHours: Number(payload.estimatedHours),
  priority: (payload.priority ?? '') as Assessment['priority'],
  notes: payload.notes ?? '',
  status: payload.status,
  userId: payload.userId,
  calculatedPriorityScore: payload.calculatedPriorityScore,
  lockedAfterCompletion: payload.lockedAfterCompletion,
});

export const mapStudySession = (payload: any): StudySession => ({
  id: payload.id,
  assessmentId: payload.assessmentId ?? undefined,
  subjectId: payload.subjectId ?? undefined,
  title: payload.title,
  startTime: new Date(payload.startTime),
  endTime: new Date(payload.endTime),
  duration: payload.duration,
  status: payload.status,
  isFavorite: payload.isFavorite ?? false,
  isPinned: payload.isPinned ?? false,
  userId: payload.userId,
  sessionDate: payload.sessionDate,
  priorityScore: payload.priorityScore,
  sessionType: payload.sessionType,
});

export const mapStudyPlan = (payload: any): StudyPlan => ({
  id: payload.id,
  title: payload.title,
  generatedForStartDate: payload.generatedForStartDate,
  generatedForEndDate: payload.generatedForEndDate,
  generationTrigger: payload.generationTrigger,
  status: payload.status,
  createdAt: new Date(payload.createdAt),
  updatedAt: new Date(payload.updatedAt),
  sessions: (payload.sessions ?? []).map(mapStudySession),
  aiDraft: payload.aiDraft ?? null,
});

export const mapNotification = (payload: any): Notification => ({
  id: payload.id,
  userId: payload.userId,
  title: payload.title,
  type: payload.type,
  channel: payload.channel,
  message: payload.message,
  status: payload.status,
  createdAt: new Date(payload.createdAt),
  sentAt: toDate(payload.sentAt),
  read: Boolean(payload.read),
  readAt: toDate(payload.readAt),
  relatedAssessmentId: payload.relatedAssessmentId ?? undefined,
  isSimulated: payload.isSimulated,
});

export const mapProgress = (payload: any): Progress => ({
  userId: payload.userId,
  subjectId: payload.subjectId,
  completedAssignments: payload.completedAssignments,
  totalAssignments: payload.totalAssignments,
  completionRate: payload.completionRate,
  studyHours: payload.studyHours,
  lastUpdated: new Date(payload.lastUpdated),
});

export const mapTaskRun = (payload: any): TaskRun => ({
  id: payload.id,
  taskId: payload.taskId,
  startTime: new Date(payload.startTime),
  endTime: toDate(payload.endTime),
  status: payload.status,
  result: payload.result,
});

export const mapScheduledTask = (payload: any): ScheduledTask => ({
  id: payload.id,
  name: payload.name,
  status: payload.status,
  lastRunTime: toDate(payload.lastRunTime),
  nextRunTime: new Date(payload.nextRunTime),
  runHistory: (payload.runHistory ?? []).map(mapTaskRun),
});

export const toAssessmentPayload = (assessment: Partial<Assessment>) => ({
  ...assessment,
  dueDate:
    assessment.dueDate instanceof Date
      ? assessment.dueDate.toISOString().split('T')[0]
      : assessment.dueDate,
  estimatedHours:
    typeof assessment.estimatedHours === 'number'
      ? assessment.estimatedHours
      : Number(assessment.estimatedHours ?? 0),
  weight: typeof assessment.weight === 'number' ? assessment.weight : Number(assessment.weight ?? 0),
});
