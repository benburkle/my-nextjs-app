jest.mock('../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { getSession, getCurrentUser } from '../get-session';
import { auth } from '../auth';

describe('get-session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('should call auth and return session', async () => {
      const mockSession = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getSession();

      expect(auth).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSession);
    });

    it('should return null when auth returns null', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getSession();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when session exists', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      const mockSession = { user: mockUser };
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return undefined when session is null', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeUndefined();
    });

    it('should return undefined when session has no user', async () => {
      (auth as jest.Mock).mockResolvedValue({});

      const result = await getCurrentUser();

      expect(result).toBeUndefined();
    });
  });
});
