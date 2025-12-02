jest.mock('@/lib/prisma', () => ({
  prisma: {
    verse: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/verses/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return verse when found', async () => {
      const mockVerse = { id: 1, chapterId: 1, number: 1 };
      (mockPrisma.verse.findUnique as jest.Mock).mockResolvedValue(mockVerse);

      const params = Promise.resolve({ id: '1' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVerse);
    });

    it('should return 404 when verse not found', async () => {
      (mockPrisma.verse.findUnique as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: '999' });
      const response = await GET({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Verse not found');
    });
  });

  describe('PUT', () => {
    it('should update verse successfully', async () => {
      const mockVerse = { id: 1, chapterId: 1, number: 2, text: 'Updated' };
      (mockPrisma.verse.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.verse.update as jest.Mock).mockResolvedValue(mockVerse);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/verses/1', {
        method: 'PUT',
        body: JSON.stringify({ number: 2, text: 'Updated' }),
      });

      const response = await PUT(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVerse);
    });
  });

  describe('DELETE', () => {
    it('should delete verse successfully', async () => {
      (mockPrisma.verse.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.verse.delete as jest.Mock).mockResolvedValue({});

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
