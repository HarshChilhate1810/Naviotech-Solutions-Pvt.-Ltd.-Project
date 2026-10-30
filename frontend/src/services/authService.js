import { apiRequest, setStoredTokens, clearStoredTokens } from './api';

export const authService = {
  async register(name, email, password, phone_number = null) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone_number: phone_number || null }),
    });
    setStoredTokens(data.access_token, data.refresh_token);
    localStorage.setItem('bibliobox_user', JSON.stringify(data.user));
    return data;
  },

  async login(identifier, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, password }),
    });
    setStoredTokens(data.access_token, data.refresh_token);
    localStorage.setItem('bibliobox_user', JSON.stringify(data.user));
    return data;
  },

  async requestMobileOtp(phone_number) {
    return await apiRequest('/auth/mobile-otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone_number }),
    });
  },

  async verifyMobileOtp(phone_number, otp, name = null) {
    const data = await apiRequest('/auth/mobile-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone_number, otp, name }),
    });
    setStoredTokens(data.access_token, data.refresh_token);
    localStorage.setItem('bibliobox_user', JSON.stringify(data.user));
    return data;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearStoredTokens();
      localStorage.removeItem('bibliobox_user');
      localStorage.removeItem('athenaeum_user');
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
