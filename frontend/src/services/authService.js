import { apiRequest, setStoredTokens, clearStoredTokens } from './api';

export const authService = {
  async register(name, email, password) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredTokens(data.access_token, data.refresh_token);
    localStorage.setItem('athenaeum_user', JSON.stringify(data.user));
    return data;
  },

  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredTokens(data.access_token, data.refresh_token);
    localStorage.setItem('athenaeum_user', JSON.stringify(data.user));
    return data;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearStoredTokens();
    }
  },

  async getMe() {
    return await apiRequest('/auth/me');
  },

  async forgotPassword(email) {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email, token, new_password) {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, new_password }),
    });
  },
};
