import { apiRequest } from './api';

export const dashboardService = {
  async getStats() {
    return await apiRequest('/dashboard/stats');
  },
};
