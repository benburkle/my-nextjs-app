jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
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

describe('/api/resources/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/resources/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return resource when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockResource = {
        id: 1,
        name: 'Resource 1',
        userId: 'user-1',
        chapters: [],
        studies: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(mockResource);

      const request = new Request('http://localhost/api/resources/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResource);
    });

    it('should return 404 when resource not found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/resources/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
    });
  });

  describe('PUT', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/resources/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Resource', type: 'Book' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when resource does not belong to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/resources/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Resource', type: 'Book' }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
    });

    it('should update resource successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingResource = { id: 1, name: 'Resource 1', userId: 'user-1' };
      const updatedResource = {
        id: 1,
        name: 'Updated Resource',
        type: 'Book',
        userId: 'user-1',
        chapters: [],
        studies: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(existingResource);
      (mockPrisma.resource.update as jest.Mock).mockResolvedValue(updatedResource);

      const request = new Request('http://localhost/api/resources/1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Resource',
          type: 'Book',
        }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedResource);
      expect(mockPrisma.resource.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
        data: {
          name: 'Updated Resource',
          series: null,
          type: 'Book',
        },
        include: {
          chapters: {
            orderBy: { number: 'asc' },
          },
          studies: true,
        },
      });
    });
  });

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/resources/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should delete resource successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const existingResource = { id: 1, name: 'Resource 1', userId: 'user-1' };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(existingResource);
      (mockPrisma.resource.delete as jest.Mock).mockResolvedValue(existingResource);

      const request = new Request('http://localhost/api/resources/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.resource.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: 1, userId: 'user-1' },
      });
    });
  });
});
