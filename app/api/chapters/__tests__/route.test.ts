jest.mock('@/lib/prisma', () => ({
  prisma: {
    chapter: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/chapters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return chapters for a resource', async () => {
      const mockChapters = [{ id: 1, resourceId: 1, number: 1 }];
      (mockPrisma.chapter.findMany as jest.Mock).mockResolvedValue(mockChapters);

      const request = new Request('http://localhost/api/chapters?resourceId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockChapters);
    });

    it('should return all chapters when no resourceId', async () => {
      const mockChapters = [{ id: 1, resourceId: 1, number: 1 }];
      (mockPrisma.chapter.findMany as jest.Mock).mockResolvedValue(mockChapters);

      const request = new Request('http://localhost/api/chapters');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockChapters);
    });
  });

  describe('POST', () => {
    it('should return 400 when resourceId is missing', async () => {
      const request = new Request('http://localhost/api/chapters', {
        method: 'POST',
        body: JSON.stringify({ number: 1 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('resourceId and number are required');
    });

    it('should create chapter successfully', async () => {
      const mockChapter = { id: 1, resourceId: 1, number: 1, name: 'Chapter 1' };
      (mockPrisma.chapter.create as jest.Mock).mockResolvedValue(mockChapter);

      const request = new Request('http://localhost/api/chapters', {
        method: 'POST',
        body: JSON.stringify({ resourceId: 1, number: 1, name: 'Chapter 1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockChapter);
    });
  });
});
