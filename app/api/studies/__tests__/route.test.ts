jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      findMany: jest.fn(),
      create: jest.fn(),
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

describe('/api/studies', () => {
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

    it('should return studies for authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockStudies = [{ id: 1, name: 'Study 1', userId: 'user-1' }];

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.study.findMany as jest.Mock).mockResolvedValue(mockStudies);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStudies);
    });
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(undefined);
      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Study' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when name is missing', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should validate resourceId belongs to user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Study', resourceId: '999' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
    });

    it('should validate scheduleId belongs to user and is valid number', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Study', scheduleId: 'invalid' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid Schedule ID');
    });

    it('should validate guideId belongs to user and is valid number', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser as any);

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Study', guideId: 'invalid' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid Guide ID');
    });

    it('should create study successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockResource = { id: 1, userId: 'user-1' };
      const mockStudy = {
        id: 1,
        name: 'New Study',
        userId: 'user-1',
        resourceId: 1,
        scheduleId: null,
        guideId: null,
      };

      mockGetCurrentUser.mockResolvedValue(mockUser as any);
      (mockPrisma.resource.findFirst as jest.Mock).mockResolvedValue(mockResource);
      (mockPrisma.study.create as jest.Mock).mockResolvedValue(mockStudy);

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Study', resourceId: '1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockStudy);
    });
  });
});
