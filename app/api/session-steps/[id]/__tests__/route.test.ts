jest.mock('@/lib/prisma', () => ({
  prisma: {
    sessionStep: {
      update: jest.fn(),
    },
  },
}));

import { PUT } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/session-steps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    it('should update session step successfully', async () => {
      const mockSessionStep = { id: 1, insights: 'Test insights', guideStep: {}, session: {} };
      (mockPrisma.sessionStep.update as jest.Mock).mockResolvedValue(mockSessionStep);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/session-steps/1', {
        method: 'PUT',
        body: JSON.stringify({ insights: 'Test insights' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSessionStep);
    });
  });
});
