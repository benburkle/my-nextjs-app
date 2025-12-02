jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    guide: {
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

describe('/api/guides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset prisma mock structure
    if (mockPrisma.guide) {
      (mockPrisma.guide.findMany as jest.Mock).mockClear();
      (mockPrisma.guide.create as jest.Mock).mockClear();
    }
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return guides for authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockGuides = [
        { id: 1, name: 'Guide 1', userId: 'user-1', guideSteps: [] },
        { id: 2, name: 'Guide 2', userId: 'user-1', guideSteps: [] },
      ];

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.guide.findMany as jest.Mock).mockResolvedValue(mockGuides);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockGuides);
      expect(mockPrisma.guide.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          guideSteps: {
            orderBy: { index: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should return 500 when prisma client is not initialized', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      // Temporarily remove guide from prisma
      const originalGuide = mockPrisma.guide;
      delete mockPrisma.guide;

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection error');

      // Restore guide for other tests
      mockPrisma.guide = originalGuide;
    });

    it('should handle errors gracefully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.guide.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch guides');
    });
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/guides', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Guide' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when name is missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/guides', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should create guide successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockGuide = {
        id: 1,
        name: 'New Guide',
        userId: 'user-1',
        levelOfResource: 'Beginner',
        amtOfResource: '10',
        guideSteps: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.guide.create as jest.Mock).mockResolvedValue(mockGuide);

      const request = new Request('http://localhost/api/guides', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Guide',
          levelOfResource: 'Beginner',
          amtOfResource: '10',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockGuide);
      expect(mockPrisma.guide.create).toHaveBeenCalledWith({
        data: {
          name: 'New Guide',
          userId: 'user-1',
          levelOfResource: 'Beginner',
          amtOfResource: '10',
        },
        include: {
          guideSteps: true,
        },
      });
    });

    it('should handle null optional fields', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockGuide = {
        id: 1,
        name: 'New Guide',
        userId: 'user-1',
        levelOfResource: null,
        amtOfResource: null,
        guideSteps: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.guide.create as jest.Mock).mockResolvedValue(mockGuide);

      const request = new Request('http://localhost/api/guides', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Guide' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockPrisma.guide.create).toHaveBeenCalledWith({
        data: {
          name: 'New Guide',
          userId: 'user-1',
          levelOfResource: null,
          amtOfResource: null,
        },
        include: {
          guideSteps: true,
        },
      });
    });
  });
});
