jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return posts', async () => {
      const mockPosts = [{ id: 1, title: 'Post 1', content: 'Content' }];
      (mockPrisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPosts);
    });
  });

  describe('POST', () => {
    it('should create post successfully', async () => {
      const mockPost = { id: 1, title: 'New Post', content: 'Content', published: false };
      (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Post', content: 'Content' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockPost);
    });
  });
});
