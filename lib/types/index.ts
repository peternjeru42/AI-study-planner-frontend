export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrollmentDate: Date;
  username?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  color: string;
  semester?: string;
  description?: string;
  userId: string;
  isActive?: boolean;
}

export type AssessmentType = 'assignment' | 'cat' | 'quiz' | 'exam' | 'project' | 'presentation';
export type AssessmentStatus = 'pending' | 'in-progress' | 'completed' | 'missed' | 'overdue';

export interface Assessment {
  id: string;
  title: string;
  subjectId: string;
  type: AssessmentType;
  dueDate: Date;
  dueTime?: string;
  weight: number;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | '';
  notes?: string;
  status: AssessmentStatus;
  userId: string;
  calculatedPriorityScore?: number;
  lockedAfterCompletion?: boolean;
}

export type StudySessionStatus = 'planned' | 'completed' | 'missed' | 'skipped' | 'rescheduled';

export interface StudySession {
  id: string;
  assessmentId?: string;
  subjectId?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: StudySessionStatus;
  isFavorite: boolean;
  isPinned: boolean;
  userId: string;
  sessionDate?: string;
  priorityScore?: number;
  sessionType?: string;
}

export interface StudyPreferences {
  userId: string;
  courseName?: string;
  yearOfStudy?: number;
  institutionName?: string;
  timezone?: string;
  startTime: string;
  endTime: string;
  sessionLength: number;
  breakLength: number;
  maxSessionsPerDay: number;
  weekendAvailable: boolean;
  enableInAppNotifications?: boolean;
  enableEmailNotificationsSimulated?: boolean;
  darkMode?: boolean;
}

export type NotificationType = 'deadline-reminder' | 'session-reminder' | 'overdue-alert' | 'daily-plan' | 'weekly-summary';
export type NotificationChannel = 'in-app' | 'email';
export type NotificationStatus = 'queued' | 'sent' | 'read' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  title?: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
  sentAt?: Date;
  read: boolean;
  readAt?: Date;
  relatedAssessmentId?: string;
  isSimulated?: boolean;
}

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface TaskRun {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  status: TaskStatus;
  result?: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  status: TaskStatus;
  lastRunTime?: Date;
  nextRunTime: Date;
  runHistory: TaskRun[];
}

export interface Progress {
  userId: string;
  subjectId: string;
  completedAssignments: number;
  totalAssignments: number;
  completionRate: number;
  studyHours: number;
  lastUpdated: Date;
}
