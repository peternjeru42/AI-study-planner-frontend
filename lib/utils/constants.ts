// Assessment types
export const ASSESSMENT_TYPES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'cat', label: 'CAT' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'presentation', label: 'Presentation' },
] as const;

// Assessment statuses
export const ASSESSMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
] as const;

// Priority levels
export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

// Subject colors
export const SUBJECT_COLORS = [
  { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#10B981', label: 'Green', class: 'bg-green-500' },
  { value: '#F59E0B', label: 'Amber', class: 'bg-amber-500' },
  { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#F97316', label: 'Orange', class: 'bg-orange-500' },
] as const;

// Study session statuses
export const SESSION_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'skipped', label: 'Skipped' },
] as const;

// Notification types
export const NOTIFICATION_TYPES = [
  { value: 'deadline-reminder', label: 'Deadline Reminder' },
  { value: 'session-reminder', label: 'Session Reminder' },
  { value: 'overdue-alert', label: 'Overdue Alert' },
  { value: 'daily-plan', label: 'Daily Plan' },
  { value: 'weekly-summary', label: 'Weekly Summary' },
] as const;

// Notification channels
export const NOTIFICATION_CHANNELS = [
  { value: 'in-app', label: 'In-App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
] as const;

// Dashboard demo accounts
export const DEMO_ACCOUNTS = [
  {
    email: 'student@example.com',
    password: 'demo123',
    role: 'student',
    name: 'Alex Johnson',
  },
  {
    email: 'admin@example.com',
    password: 'demo123',
    role: 'admin',
    name: 'Dr. Sarah Mitchell',
  },
] as const;
