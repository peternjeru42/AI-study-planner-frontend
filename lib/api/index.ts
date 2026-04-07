import {
  mapAssessment,
  mapNotification,
  mapProgress,
  mapScheduledTask,
  mapStudyPreferences,
  mapStudySession,
  mapSubject,
  mapUser,
  toAssessmentPayload,
} from '@/lib/api/mappers';
import { apiRequest } from '@/lib/api/client';
import { tokenStorage } from '@/lib/api/storage';
import { Assessment, Notification, Progress, ScheduledTask, StudyPreferences, StudySession, Subject, User } from '@/lib/types';

export type PlannerAIModel = {
  id: string;
  label: string;
  description: string;
  recommended: boolean;
};

export type PlannerAIResponse = {
  model: string;
  question: string;
  answer: string;
  contextSummary: {
    subjectsCount: number;
    assessmentsCount: number;
    sessionsCount: number;
  };
};

type AuthResponse = {
  access: string;
  refresh: string;
  user: any;
  profile: any;
};

const setAuthTokens = (payload: AuthResponse) => {
  tokenStorage.setTokens({ access: payload.access, refresh: payload.refresh });
};

export const authApi = {
  async login(email: string, password: string) {
    const payload = await apiRequest<AuthResponse>('/auth/login/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    setAuthTokens(payload);
    return {
      user: mapUser(payload.user),
      profile: payload.profile ? mapStudyPreferences(payload.profile) : null,
    };
  },
  async signup(email: string, password: string, name: string) {
    const payload = await apiRequest<AuthResponse>('/auth/register/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        fullName: name,
        email,
        password,
        passwordConfirm: password,
      }),
    });
    setAuthTokens(payload);
    return {
      user: mapUser(payload.user),
      profile: payload.profile ? mapStudyPreferences(payload.profile) : null,
    };
  },
  async me() {
    const payload = await apiRequest<{ user: any; profile: any | null }>('/auth/me/');
    return {
      user: mapUser(payload.user),
      profile: payload.profile ? mapStudyPreferences(payload.profile) : null,
    };
  },
  async updateProfile(profile: Partial<StudyPreferences> & { name?: string; username?: string | null }) {
    const payload = await apiRequest<{ user: any; profile: any | null }>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return {
      user: mapUser(payload.user),
      profile: payload.profile ? mapStudyPreferences(payload.profile) : null,
    };
  },
  async logout() {
    const refresh = tokenStorage.getRefreshToken();
    if (refresh) {
      try {
        await apiRequest('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        });
      } catch {
        // Ignore logout errors and clear client tokens anyway.
      }
    }
    tokenStorage.clear();
  },
};

export const subjectsApi = {
  list: async (): Promise<Subject[]> => (await apiRequest<any[]>('/subjects/')).map(mapSubject),
  create: async (subject: Partial<Subject>): Promise<Subject> =>
    mapSubject(
      await apiRequest('/subjects/', {
        method: 'POST',
        body: JSON.stringify(subject),
      }),
    ),
  update: async (id: string, subject: Partial<Subject>): Promise<Subject> =>
    mapSubject(
      await apiRequest(`/subjects/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(subject),
      }),
    ),
  remove: async (id: string) => apiRequest(`/subjects/${id}/`, { method: 'DELETE' }),
  progress: async (id: string) => apiRequest(`/subjects/${id}/progress/`),
};

export const assessmentsApi = {
  list: async (): Promise<Assessment[]> => (await apiRequest<any[]>('/assessments/')).map(mapAssessment),
  create: async (assessment: Partial<Assessment>): Promise<Assessment> =>
    mapAssessment(
      await apiRequest('/assessments/', {
        method: 'POST',
        body: JSON.stringify(toAssessmentPayload(assessment)),
      }),
    ),
  update: async (id: string, assessment: Partial<Assessment>): Promise<Assessment> =>
    mapAssessment(
      await apiRequest(`/assessments/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(toAssessmentPayload(assessment)),
      }),
    ),
  remove: async (id: string) => apiRequest(`/assessments/${id}/`, { method: 'DELETE' }),
  setStatus: async (id: string, status: Assessment['status']) =>
    mapAssessment(
      await apiRequest(`/assessments/${id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    ),
};

export const plannerApi = {
  current: async () => apiRequest<any | null>('/planner/current/'),
  generate: async () => apiRequest<any>('/planner/generate/', { method: 'POST', body: JSON.stringify({}) }),
  regenerate: async () => apiRequest<any>('/planner/regenerate/', { method: 'POST', body: JSON.stringify({}) }),
  aiModels: async (): Promise<PlannerAIModel[]> => apiRequest<PlannerAIModel[]>('/planner/ai/models/'),
  aiAssistant: async (payload: { model: string; question: string }): Promise<PlannerAIResponse> =>
    apiRequest<PlannerAIResponse>('/planner/ai/assistant/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  today: async (): Promise<StudySession[]> => (await apiRequest<any[]>('/planner/sessions/today/')).map(mapStudySession),
  week: async (): Promise<StudySession[]> => (await apiRequest<any[]>('/planner/sessions/week/')).map(mapStudySession),
  updateStatus: async (id: string, status: StudySession['status']) =>
    mapStudySession(
      await apiRequest(`/planner/sessions/${id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    ),
  reschedule: async (id: string, payload: { sessionDate: string; startTime: string; endTime?: string }) =>
    mapStudySession(
      await apiRequest(`/planner/sessions/${id}/reschedule/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    ),
};

export const dashboardApi = {
  student: async () => apiRequest<any>('/dashboard/student/'),
  admin: async () => apiRequest<any>('/dashboard/admin/'),
};

export const progressApi = {
  overview: async () => apiRequest<any>('/progress/overview/'),
  subjects: async (): Promise<Progress[]> => (await apiRequest<any[]>('/progress/subjects/')).map(mapProgress),
  weekly: async () => apiRequest<any[]>('/progress/weekly/'),
};

export const notificationsApi = {
  list: async (): Promise<Notification[]> => (await apiRequest<any[]>('/notifications/')).map(mapNotification),
  unreadCount: async (): Promise<number> => (await apiRequest<{ count: number }>('/notifications/unread-count/')).count,
  markRead: async (id: string): Promise<Notification> =>
    mapNotification(
      await apiRequest(`/notifications/${id}/read/`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      }),
    ),
};

export const schedulerApi = {
  jobs: async (): Promise<ScheduledTask[]> => (await apiRequest<any[]>('/scheduler/jobs/')).map(mapScheduledTask),
  history: async () => apiRequest<any>('/scheduler/history/'),
  simulateCycle: async (): Promise<ScheduledTask[]> =>
    (await apiRequest<any[]>('/scheduler/simulate-cycle/', {
      method: 'POST',
      body: JSON.stringify({}),
    })).map(mapScheduledTask),
};

export const reportsApi = {
  weekly: async () => apiRequest<any>('/reports/weekly/'),
  monthly: async () => apiRequest<any>('/reports/monthly/'),
};
