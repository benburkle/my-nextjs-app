jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { DELETE, PATCH } from '../route';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('/api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {
    it('should update post successfully', async () => {
      const mockPost = { id: 1, title: 'Updated', content: 'Updated content' };
      (mockPrisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      const params = Promise.resolve({ id: '1' });
      const request = new Request('http://localhost/api/posts/1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
      });

      const response = await PATCH(request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPost);
    });
  });

  describe('DELETE', () => {
    it('should delete post successfully', async () => {
      (mockPrisma.post.delete as jest.Mock).mockResolvedValue({});

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE({} as Request, { params } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
