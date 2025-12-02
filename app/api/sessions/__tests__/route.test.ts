jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    study: {
      findFirst: jest.fn(),
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

import { GET, POST } from '../route';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockPrisma = prisma as any;

describe('/api/sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/sessions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return sessions for authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSessions = [
        {
          id: 1,
          userId: 'user-1',
          studyId: 1,
          sessionSteps: [],
          study: {
            guide: {
              guideSteps: [],
            },
          },
        },
      ];

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const mockFindMany = mockPrisma.session.findMany as jest.Mock;
      mockFindMany
        .mockResolvedValueOnce(mockSessions) // First call - initial fetch
        .mockResolvedValueOnce(mockSessions); // Second call - after creating steps
      (mockPrisma.sessionStep.createMany as jest.Mock).mockResolvedValue({ count: 0 });

      const request = new Request('http://localhost/api/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSessions);
    });

    it('should filter by studyId when provided', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSessions: any[] = [];
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const mockFindMany = mockPrisma.session.findMany as jest.Mock;
      mockFindMany.mockResolvedValueOnce(mockSessions).mockResolvedValueOnce(mockSessions);
      (mockPrisma.sessionStep.createMany as jest.Mock).mockResolvedValue({ count: 0 });

      const request = new Request('http://localhost/api/sessions?studyId=1');
      await GET(request);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', studyId: 1 },
        include: expect.any(Object),
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ studyId: '1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when studyId is missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Study ID is required');
    });

    it('should return 404 when study does not belong to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ studyId: '1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Study not found');
    });

    it('should validate selectionId belongs to user resource', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockStudy = { id: 1, userId: 'user-1', guide: null };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findFirst as jest.Mock).mockResolvedValue(mockStudy);
      (mockPrisma.selection.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ studyId: '1', selectionId: '999' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Selection not found');
      expect(mockPrisma.selection.findFirst as jest.Mock).toHaveBeenCalledWith({
        where: {
          id: 999,
          resource: {
            userId: 'user-1',
          },
        },
      });
    });

    it('should create session successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockStudy = { id: 1, userId: 'user-1', guide: null };
      const mockSession = {
        id: 1,
        userId: 'user-1',
        studyId: 1,
        date: null,
        time: null,
        insights: null,
        reference: null,
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findFirst as jest.Mock).mockResolvedValue({
        ...mockStudy,
        guide: {
          guideSteps: [],
        },
      });
      (mockPrisma.session.create as jest.Mock).mockResolvedValue(mockSession);
      (mockPrisma.sessionStep.createMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockPrisma.session.findUnique as jest.Mock).mockResolvedValue({
        ...mockSession,
        study: {},
        guideStep: null,
        selection: null,
        sessionSteps: [],
      });

      const request = new Request('http://localhost/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ studyId: '1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(mockPrisma.session.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            studyId: 1,
          }),
        })
      );
    });
  });
});
