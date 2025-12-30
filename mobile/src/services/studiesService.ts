import { api } from './api';

interface Study {
  id: number;
  name: string;
  guide?: {
    name: string;
  };
}

class StudiesService {
  async getStudies(): Promise<Study[]> {
    return api.get<Study[]>('/api/studies');
  }

  async getStudy(id: number): Promise<Study> {
    return api.get<Study>(`/api/studies/${id}`);
  }

  async createStudy(data: { name: string; guideId?: number }): Promise<Study> {
    return api.post<Study>('/api/studies', data);
  }

  async updateStudy(id: number, data: Partial<Study>): Promise<Study> {
    return api.put<Study>(`/api/studies/${id}`, data);
  }

  async deleteStudy(id: number): Promise<void> {
    return api.delete(`/api/studies/${id}`);
  }
}

export const studiesService = new StudiesService();




