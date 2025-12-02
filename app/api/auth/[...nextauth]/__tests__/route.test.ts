jest.mock('@/lib/auth', () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

import { GET, POST } from '../route';
import { handlers } from '@/lib/auth';

const mockHandlers = handlers as jest.Mocked<typeof handlers>;

describe('/api/auth/[...nextauth]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export GET handler', () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
  });

  it('should export POST handler', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });

  it('should delegate GET to handlers.GET', async () => {
    const mockResponse = new Response(null, { status: 200 });
    mockHandlers.GET.mockResolvedValue(mockResponse);

    const request = new Request('http://localhost/api/auth/signin');
    const response = await GET(request);

    expect(mockHandlers.GET).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });

  it('should delegate POST to handlers.POST', async () => {
    const mockResponse = new Response(null, { status: 200 });
    mockHandlers.POST.mockResolvedValue(mockResponse);

    const request = new Request('http://localhost/api/auth/signin', { method: 'POST' });
    const response = await POST(request);

    expect(mockHandlers.POST).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });
});
