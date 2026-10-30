import { apiRequest } from './api';

export const preferencesService = {
  async getPreferences() {
    return await apiRequest('/preferences');
  },

  async updatePreferences(theme, page_turn_sound_enabled) {
    const payload = {};
    if (theme !== undefined) payload.theme = theme;
    if (page_turn_sound_enabled !== undefined) payload.page_turn_sound_enabled = page_turn_sound_enabled;
    return await apiRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
