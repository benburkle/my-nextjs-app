jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    guide: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

describe('/api/guides/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/guides/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return guide when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockGuide = {
        id: 1,
        name: 'Guide 1',
        userId: 'user-1',
        guideSteps: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.guide.findFirst as jest.Mock).mockResolvedValue(mockGuide);

      const request = new Request('http://localhost/api/guides/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockGuide);
      expect(mockPrisma.guide.findFirst as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
        include: {
          guideSteps: {
            orderBy: { index: 'asc' },
          },
        },
      });
    });

    it('should return 404 when guide not found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.guide.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/guides/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Guide not found');
    });
  });

  describe('PUT', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/guides/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Guide' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when name is missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/guides/1', {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should return 404 when guide does not belong to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.guide.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/guides/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Guide' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Guide not found');
    });

    it('should update guide successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingGuide = { id: 1, name: 'Guide 1', userId: 'user-1' };
      const updatedGuide = {
        id: 1,
        name: 'Updated Guide',
        userId: 'user-1',
        levelOfResource: 'Advanced',
        amtOfResource: '20',
        guideSteps: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.guide.findFirst.mockResolvedValue(existingGuide);
      (mockPrisma.guide.update as jest.Mock).mockResolvedValue(updatedGuide);

      const request = new Request('http://localhost/api/guides/1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Guide',
          levelOfResource: 'Advanced',
          amtOfResource: '20',
        }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedGuide);
      expect(mockPrisma.guide.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
        data: {
          name: 'Updated Guide',
          levelOfResource: 'Advanced',
          amtOfResource: '20',
        },
        include: {
          guideSteps: {
            orderBy: { index: 'asc' },
          },
        },
      });
    });
  });

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/guides/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when guide does not belong to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.guide.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/guides/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Guide not found');
    });

    it('should delete guide successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingGuide = { id: 1, name: 'Guide 1', userId: 'user-1' };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      mockPrisma.guide.findFirst.mockResolvedValue(existingGuide);
      (mockPrisma.guide.delete as jest.Mock).mockResolvedValue(existingGuide);

      const request = new Request('http://localhost/api/guides/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.guide.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
      });
    });
  });
});
