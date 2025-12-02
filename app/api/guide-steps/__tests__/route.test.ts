jest.mock('@/lib/prisma', () => ({
  prisma: {
    guideStep: {
      create: jest.fn(),
    },
  },
}));

import { POST } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/guide-steps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 400 when required fields are missing', async () => {
      const request = new Request('http://localhost/api/guide-steps', {
        method: 'POST',
        body: JSON.stringify({ name: 'Step 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('guideId, index, and name are required');
    });

    it('should create guide step successfully', async () => {
      const mockGuideStep = { id: 1, guideId: 1, index: 1, name: 'Step 1' };
      (mockPrisma.guideStep.create as jest.Mock).mockResolvedValue(mockGuideStep);

      const request = new Request('http://localhost/api/guide-steps', {
        method: 'POST',
        body: JSON.stringify({ guideId: 1, index: 1, name: 'Step 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockGuideStep);
    });
  });
});
