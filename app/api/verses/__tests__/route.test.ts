jest.mock('@/lib/prisma', () => ({
  prisma: {
    verse: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/verses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return verses for a chapter', async () => {
      const mockVerses = [{ id: 1, chapterId: 1, number: 1 }];
      (mockPrisma.verse.findMany as jest.Mock).mockResolvedValue(mockVerses);

      const request = new Request('http://localhost/api/verses?chapterId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVerses);
    });

    it('should return all verses when no chapterId', async () => {
      const mockVerses = [{ id: 1, chapterId: 1, number: 1 }];
      (mockPrisma.verse.findMany as jest.Mock).mockResolvedValue(mockVerses);

      const request = new Request('http://localhost/api/verses');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVerses);
    });
  });

  describe('POST', () => {
    it('should return 400 when chapterId is missing', async () => {
      const request = new Request('http://localhost/api/verses', {
        method: 'POST',
        body: JSON.stringify({ number: 1 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('chapterId and number are required');
    });

    it('should create verse successfully', async () => {
      const mockVerse = { id: 1, chapterId: 1, number: 1, text: 'Verse text' };
      (mockPrisma.verse.create as jest.Mock).mockResolvedValue(mockVerse);

      const request = new Request('http://localhost/api/verses', {
        method: 'POST',
        body: JSON.stringify({ chapterId: 1, number: 1, text: 'Verse text' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockVerse);
    });
  });
});
