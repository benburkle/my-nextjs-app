jest.mock('@/lib/prisma', () => ({
  prisma: {
    guideStep: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    guide: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

import { GET, PUT, DELETE } from '../route';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

const mockPrisma = prisma as any;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('/api/guide-steps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user1' } as any);
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

    it('should return guide step when found', async () => {
      const mockGuideStep = {
        id: 1,
        guideId: 1,
        index: 1,
        name: 'Step 1',
        guide: { userId: 'user1' },
      };
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue(mockGuideStep);

      const params = Promise.resolve({ id: '1' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockGuideStep);
    });

    it('should return 404 when guide step not found', async () => {
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: '999' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Guide step not found');
    });

    it('should return 403 when guide does not belong to user', async () => {
      const mockGuideStep = {
        id: 1,
        guideId: 1,
        index: 1,
        name: 'Step 1',
        guide: { userId: 'other-user' },
      };
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue(mockGuideStep);

      const params = Promise.resolve({ id: '1' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PUT', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/guide-steps/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should update guide step successfully', async () => {
      const mockGuideStep = { id: 1, guideId: 1, index: 2, name: 'Updated' };
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        guide: { userId: 'user1' },
      });
      (mockPrisma.guideStep.update as jest.Mock).mockResolvedValue(mockGuideStep);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/guide-steps/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockGuideStep);
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

    it('should delete guide step successfully', async () => {
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        guide: { userId: 'user1' },
      });
      (mockPrisma.guideStep.delete as jest.Mock).mockResolvedValue({});

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
