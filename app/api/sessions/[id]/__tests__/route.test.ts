jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    guideStep: {
      findUnique: jest.fn(),
    },
    selection: {
      findFirst: jest.fn(),
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

describe('/api/sessions/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/sessions/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return session when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSession = {
        id: 1,
        userId: 'user-1',
        studyId: 1,
        sessionSteps: [],
        study: { guide: null },
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/sessions/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSession);
    });

    it('should return 404 when session not found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.session.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/sessions/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });
  });

  describe('PUT', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/sessions/1', {
        method: 'PUT',
        body: JSON.stringify({ insights: 'Test insights' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when session does not belong to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.session.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/sessions/1', {
        method: 'PUT',
        body: JSON.stringify({ insights: 'Test insights' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });

    it('should validate selectionId belongs to user resource', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingSession = { id: 1, userId: 'user-1' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.session.findFirst.mockResolvedValue(existingSession);
      (mockPrisma.selection.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/sessions/1', {
        method: 'PUT',
        body: JSON.stringify({ selectionId: '999' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Selection not found');
    });

    it('should update session successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingSession = { id: 1, userId: 'user-1' };
      const updatedSession = {
        id: 1,
        userId: 'user-1',
        insights: 'Updated insights',
        sessionSteps: [],
        study: { guide: null },
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.session.findFirst.mockResolvedValue(existingSession);
      (mockPrisma.session.update as jest.Mock).mockResolvedValue(updatedSession);

      const request = new Request('http://localhost/api/sessions/1', {
        method: 'PUT',
        body: JSON.stringify({ insights: 'Updated insights' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedSession);
      expect(mockPrisma.session.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
        data: {
          insights: 'Updated insights',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/sessions/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should delete session successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingSession = { id: 1, userId: 'user-1' };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.session.findFirst.mockResolvedValue(existingSession);
      (mockPrisma.session.delete as jest.Mock).mockResolvedValue(existingSession);

      const request = new Request('http://localhost/api/sessions/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.session.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
      });
    });
  });
});
