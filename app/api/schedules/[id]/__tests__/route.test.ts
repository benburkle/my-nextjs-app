jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    schedule: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from '../route';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockPrisma = prisma as any;

describe('/api/schedules/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const params = Promise.resolve({ id: '1' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return schedule when found', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      const mockSchedule = { id: 1, day: 'Monday', studies: [] };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(mockSchedule);

      const params = Promise.resolve({ id: '1' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSchedule);
      expect(mockPrisma.schedule.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user1' },
        include: {
          studies: {
            include: {
              resource: true,
            },
          },
        },
      });
    });

    it('should return 404 when schedule not found', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: '999' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Schedule not found');
    });
  });

  describe('PUT', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/schedules/1', {
        method: 'PUT',
        body: JSON.stringify({ day: 'Monday', timeStart: '10:00', repeats: 'Weekly' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when day is missing', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/schedules/1', {
        method: 'PUT',
        body: JSON.stringify({ timeStart: '10:00' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Day is required');
    });

    it('should return 404 when schedule not found', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: '999' });
      const request = new Request('http://localhost/api/schedules/999', {
        method: 'PUT',
        body: JSON.stringify({ day: 'Tuesday', timeStart: '10:00', repeats: 'Weekly' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Schedule not found');
    });

    it('should update schedule successfully', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      const mockSchedule = { id: 1, day: 'Tuesday', studies: [] };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(mockSchedule);
      (mockPrisma.schedule.update as jest.Mock).mockResolvedValue(mockSchedule);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/schedules/1', {
        method: 'PUT',
        body: JSON.stringify({ day: 'Tuesday', timeStart: '10:00', repeats: 'Weekly' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSchedule);
      expect(mockPrisma.schedule.update).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user1' },
        data: expect.objectContaining({
          day: 'Tuesday',
          timeStart: '10:00',
          repeats: 'Weekly',
        }),
        include: {
          studies: {
            include: {
              resource: true,
            },
          },
        },
      });
    });
  });

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when schedule not found', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: '999' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Schedule not found');
    });

    it('should delete schedule successfully', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      const mockSchedule = { id: 1, day: 'Monday' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(mockSchedule);
      (mockPrisma.schedule.delete as jest.Mock).mockResolvedValue({});

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.schedule.delete).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user1' },
      });
    });

    it('should handle delete errors', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' };
      const mockSchedule = { id: 1, day: 'Monday' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      (mockPrisma.schedule.findFirst as jest.Mock).mockResolvedValue(mockSchedule);
      (mockPrisma.schedule.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete schedule');
    });
  });
});
