jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
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

describe('/api/resources', () => {
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

    it('should return resources for authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockResources = [{ id: 1, name: 'Resource 1', userId: 'user-1', chapters: [] }];

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResources);
      expect(mockPrisma.resource.findMany as jest.Mock).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          chapters: {
            orderBy: { number: 'asc' },
          },
          studies: true,
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/resources', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Resource', type: 'Book' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when name is missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/resources', {
        method: 'POST',
        body: JSON.stringify({ type: 'Book' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should return 400 when type is missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/resources', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Resource' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Type is required');
    });

    it('should create resource successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockResource = {
        id: 1,
        name: 'New Resource',
        type: 'Book',
        userId: 'user-1',
        series: 'Series 1',
        chapters: [],
        studies: [],
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.create as jest.Mock).mockResolvedValue(mockResource);

      const request = new Request('http://localhost/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Resource',
          type: 'Book',
          series: 'Series 1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockResource);
    });
  });
});
