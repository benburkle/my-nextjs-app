jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    resource: {
      findFirst: jest.fn(),
    },
    schedule: {
      findFirst: jest.fn(),
    },
    guide: {
      findFirst: jest.fn(),
    },
    session: {
      findMany: jest.fn(),
    },
    sessionStep: {
      createMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { GET, PUT, DELETE } from '../route';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockPrisma = prisma as any;

describe('/api/studies/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/studies/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return study when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockStudy = {
        id: 1,
        name: 'Study 1',
        userId: 'user-1',
        sessions: [],
        guide: null,
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findFirst as jest.Mock).mockResolvedValue(mockStudy);

      const request = new Request('http://localhost/api/studies/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStudy);
    });
  });

  describe('PUT', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/studies/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Study' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when study does not belong to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.study.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/studies/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Study' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Study not found');
    });

    it('should update study successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingStudy = { id: 1, name: 'Study 1', userId: 'user-1' };
      const updatedStudy = {
        id: 1,
        name: 'Updated Study',
        userId: 'user-1',
        scheduleId: null,
        resourceId: null,
        guideId: null,
        sessions: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findFirst as jest.Mock).mockResolvedValue(existingStudy);
      (mockPrisma.study.update as jest.Mock).mockResolvedValue(updatedStudy);

      const request = new Request('http://localhost/api/studies/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Study' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedStudy);
      expect(mockPrisma.study.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
        data: {
          name: 'Updated Study',
          scheduleId: null,
          resourceId: null,
          guideId: null,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/studies/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should delete study successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingStudy = { id: 1, name: 'Study 1', userId: 'user-1' };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findFirst as jest.Mock).mockResolvedValue(existingStudy);
      (mockPrisma.study.delete as jest.Mock).mockResolvedValue(existingStudy);

      const request = new Request('http://localhost/api/studies/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.study.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
      });
    });
  });
});
