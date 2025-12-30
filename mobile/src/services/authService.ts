import { api } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
}

class AuthService {
  async signIn(email: string, password: string): Promise<User> {
    const response = await api.post<{ user: User }>('/api/auth/signin', {
      email,
      password,
    });
    return response.user;
  }

  async signUp(email: string, password: string, name?: string): Promise<User> {
    const response = await api.post<{ user: User }>('/api/auth/register', {
      email,
      password,
      name,
    });
    return response.user;
  }

  async signOut(): Promise<void> {
    await api.post('/api/auth/signout');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/api/auth/session');
      return response.user;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();




