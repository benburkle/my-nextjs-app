import { api } from './api';

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
  starts: string | null;
  ends: string | null;
  excludeDayOfWeek: string | null;
  excludeDate: string | null;
  studies: any[];
}

class SchedulesService {
  async getSchedules(): Promise<Schedule[]> {
    return api.get<Schedule[]>('/api/schedules');
  }

  async getSchedule(id: number): Promise<Schedule> {
    return api.get<Schedule>(`/api/schedules/${id}`);
  }

  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    return api.post<Schedule>('/api/schedules', data);
  }

  async updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
    return api.put<Schedule>(`/api/schedules/${id}`, data);
  }

  async deleteSchedule(id: number): Promise<void> {
    return api.delete(`/api/schedules/${id}`);
  }
}

export const schedulesService = new SchedulesService();




