jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    schedule: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { GET, POST } from '../route';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockPrisma = prisma as any;

describe('/api/schedules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return schedules for authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSchedules = [{ id: 1, day: 'Monday', userId: 'user-1', studies: [] }];

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.schedule.findMany as jest.Mock).mockResolvedValue(mockSchedules);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSchedules);
      expect(mockPrisma.schedule.findMany as jest.Mock).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { studies: true },
        orderBy: { day: 'asc' },
      });
    });
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/schedules', {
        method: 'POST',
        body: JSON.stringify({
          day: 'Monday',
          timeStart: '09:00',
          repeats: 'Weekly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when required fields are missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/schedules', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should create schedule successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSchedule = {
        id: 1,
        day: 'Monday',
        timeStart: '09:00',
        repeats: 'Weekly',
        userId: 'user-1',
        studies: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.schedule.create as jest.Mock).mockResolvedValue(mockSchedule);

      const request = new Request('http://localhost/api/schedules', {
        method: 'POST',
        body: JSON.stringify({
          day: 'Monday',
          timeStart: '09:00',
          repeats: 'Weekly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockSchedule);
      expect(mockPrisma.schedule.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          day: 'Monday',
          userId: 'user-1',
          timeStart: '09:00',
          repeats: 'Weekly',
          starts: null,
          ends: null,
          excludeDayOfWeek: null,
          excludeDate: null,
        },
        include: { studies: true },
      });
    });
  });
});
