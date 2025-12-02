jest.mock('@/lib/prisma', () => ({
  prisma: {
    guideStep: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/guide-steps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return guide step when found', async () => {
      const mockGuideStep = { id: 1, guideId: 1, index: 1, name: 'Step 1' };
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
  });

  describe('PUT', () => {
    it('should update guide step successfully', async () => {
      const mockGuideStep = { id: 1, guideId: 1, index: 2, name: 'Updated' };
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.guideStep.update as jest.Mock).mockResolvedValue(mockGuideStep);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/guide-steps/1', {
        method: 'PUT',
        body: JSON.stringify({ index: 2, name: 'Updated' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockGuideStep);
    });
  });

  describe('DELETE', () => {
    it('should delete guide step successfully', async () => {
      (mockPrisma.guideStep.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.guideStep.delete as jest.Mock).mockResolvedValue({});

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
