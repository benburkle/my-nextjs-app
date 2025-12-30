import { api } from './api';

interface Resource {
  id: number;
  name: string;
  series: string | null;
  type: string;
  chapters: any[];
  studies: any[];
}

class ResourcesService {
  async getResources(): Promise<Resource[]> {
    return api.get<Resource[]>('/api/resources');
  }

  async getResource(id: number): Promise<Resource> {
    return api.get<Resource>(`/api/resources/${id}`);
  }

  async createResource(data: Partial<Resource>): Promise<Resource> {
    return api.post<Resource>('/api/resources', data);
  }

  async updateResource(id: number, data: Partial<Resource>): Promise<Resource> {
    return api.put<Resource>(`/api/resources/${id}`, data);
  }

  async deleteResource(id: number): Promise<void> {
    return api.delete(`/api/resources/${id}`);
  }
}

export const resourcesService = new ResourcesService();




