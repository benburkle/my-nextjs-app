import { api } from './api';

interface GuideStep {
  id: number;
  index: number;
  name: string;
  instructions: string | null;
  example: string | null;
  amtOfResourcePerStep: string | null;
}

interface Guide {
  id: number;
  name: string;
  levelOfResource: string | null;
  amtOfResource: string | null;
  guideSteps: GuideStep[];
}

class GuidesService {
  async getGuides(): Promise<Guide[]> {
    return api.get<Guide[]>('/api/guides');
  }

  async getGuide(id: number): Promise<Guide> {
    return api.get<Guide>(`/api/guides/${id}`);
  }

  async createGuide(data: Partial<Guide>): Promise<Guide> {
    return api.post<Guide>('/api/guides', data);
  }

  async updateGuide(id: number, data: Partial<Guide>): Promise<Guide> {
    return api.put<Guide>(`/api/guides/${id}`, data);
  }

  async deleteGuide(id: number): Promise<void> {
    return api.delete(`/api/guides/${id}`);
  }
}

export const guidesService = new GuidesService();




