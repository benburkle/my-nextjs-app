import { api } from './api';

interface GuideStep {
  id: number;
  name: string;
  instructions: string | null;
  example: string | null;
  index: number;
}

interface SessionStep {
  id: number;
  guideStepId: number;
  insights: string | null;
  guideStep: GuideStep;
}

interface Session {
  id: number;
  date: string | null;
  time: string | null;
  insights: string | null;
  reference: string | null;
  stepId?: number | null;
  selectionId?: number | null;
  sessionSteps?: SessionStep[];
  study?: {
    id: number;
    name: string;
    guide?: {
      name: string;
    };
  };
}

class SessionsService {
  async getSession(id: number): Promise<Session> {
    return api.get<Session>(`/api/sessions/${id}`);
  }

  async createSession(studyId: number, data: Partial<Session>): Promise<Session> {
    return api.post<Session>('/api/sessions', { studyId, ...data });
  }

  async updateSession(id: number, data: Partial<Session>): Promise<Session> {
    return api.put<Session>(`/api/sessions/${id}`, data);
  }

  async deleteSession(id: number): Promise<void> {
    return api.delete(`/api/sessions/${id}`);
  }

  async updateSessionStep(id: number, insights: string | null): Promise<void> {
    return api.put(`/api/session-steps/${id}`, { insights });
  }
}

export const sessionsService = new SessionsService();




