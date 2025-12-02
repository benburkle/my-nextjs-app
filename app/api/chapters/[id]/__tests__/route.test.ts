jest.mock('@/lib/prisma', () => ({
  prisma: {
    chapter: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/chapters/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return chapter when found', async () => {
      const mockChapter = { id: 1, resourceId: 1, number: 1 };
      (mockPrisma.chapter.findUnique as jest.Mock).mockResolvedValue(mockChapter);

      const params = Promise.resolve({ id: '1' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockChapter);
    });

    it('should return 404 when chapter not found', async () => {
      (mockPrisma.chapter.findUnique as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: '999' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Chapter not found');
    });
  });

  describe('PUT', () => {
    it('should update chapter successfully', async () => {
      const mockChapter = { id: 1, resourceId: 1, number: 2, name: 'Updated' };
      (mockPrisma.chapter.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.chapter.update as jest.Mock).mockResolvedValue(mockChapter);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/chapters/1', {
        method: 'PUT',
        body: JSON.stringify({ number: 2, name: 'Updated' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockChapter);
    });
  });

  describe('DELETE', () => {
    it('should delete chapter successfully', async () => {
      (mockPrisma.chapter.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.chapter.delete as jest.Mock).mockResolvedValue({});

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
