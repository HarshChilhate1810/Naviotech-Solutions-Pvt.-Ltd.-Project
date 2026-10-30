import { apiRequest } from './api';

export const libraryService = {
  async getItems(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.item_type) query.append('item_type', params.item_type);
    if (params.genre) query.append('genre', params.genre);
    if (params.min_rating) query.append('min_rating', params.min_rating);
    if (params.max_rating) query.append('max_rating', params.max_rating);
    if (params.is_favorite !== undefined && params.is_favorite !== null && params.is_favorite !== '') {
      query.append('is_favorite', params.is_favorite);
    }
    if (params.reading_status) query.append('reading_status', params.reading_status);
    if (params.year) query.append('year', params.year);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size);

    const queryString = query.toString();
    const endpoint = `/library-items${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint);
  },

  async getItem(id) {
    return await apiRequest(`/library-items/${id}`);
  },

  async createItem(payload) {
    return await apiRequest('/library-items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateItem(id, payload) {
    return await apiRequest(`/library-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteItem(id) {
    return await apiRequest(`/library-items/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleFavorite(id) {
    return await apiRequest(`/library-items/${id}/favorite`, {
      method: 'PATCH',
    });
  },

  async updateReadingProgress(id, current_page, reading_status = null) {
    return await apiRequest(`/library-items/${id}/reading-progress`, {
      method: 'PATCH',
      body: JSON.stringify({ current_page, reading_status }),
    });
  },

  async seedDemoMovies() {
    return await apiRequest('/library-items/seed-demo-movies', {
      method: 'POST',
    });
  },
};
