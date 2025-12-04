jest.mock('@/lib/prisma', () => ({
  prisma: {
    guideStep: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    guide: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@/lib/get-session', () => ({
  getCurrentUser: jest.fn(),
}));

import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

const mockPrisma = prisma as any;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

describe('/api/guide-steps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new Request('http://localhost/api/guide-steps', {
        method: 'POST',
        body: JSON.stringify({ guideId: 1, name: 'Step 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when required fields are missing', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user1' } as any);

      const request = new Request('http://localhost/api/guide-steps', {
        method: 'POST',
        body: JSON.stringify({ name: 'Step 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('guideId and name are required');
    });

    it('should return 404 when guide is not found', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user1' } as any);
      (mockPrisma.guide.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/guide-steps', {
        method: 'POST',
        body: JSON.stringify({ guideId: 1, name: 'Step 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Guide not found');
    });

    it('should create guide step successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user1' } as any);
      (mockPrisma.guide.findFirst as jest.Mock).mockResolvedValue({ id: 1, userId: 'user1' });
      (mockPrisma.guideStep.findFirst as jest.Mock).mockResolvedValue(null); // No existing steps
      const mockGuideStep = { id: 1, guideId: 1, index: 1, name: 'Step 1' };
      (mockPrisma.guideStep.create as jest.Mock).mockResolvedValue(mockGuideStep);

      const request = new Request('http://localhost/api/guide-steps', {
        method: 'POST',
        body: JSON.stringify({ guideId: 1, name: 'Step 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockGuideStep);
      expect(mockPrisma.guideStep.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          guideId: 1,
          index: 1,
          name: 'Step 1',
        }),
      });
    });
  });
});
