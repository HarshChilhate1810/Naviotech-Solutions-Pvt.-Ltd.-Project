// Centralized Fetch API Client with JWT authorization and token refreshing

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getStoredAccessToken = () => localStorage.getItem('athenaeum_access_token');
export const getStoredRefreshToken = () => localStorage.getItem('athenaeum_refresh_token');

export const setStoredTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('athenaeum_access_token', accessToken);
  if (refreshToken) localStorage.setItem('athenaeum_refresh_token', refreshToken);
};

export const clearStoredTokens = () => {
  localStorage.removeItem('athenaeum_access_token');
  localStorage.removeItem('athenaeum_refresh_token');
  localStorage.removeItem('athenaeum_user');
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized and we have a refresh token, attempt token rotation
    if (response.status === 401 && getStoredRefreshToken() && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newAccessToken) => {
          config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return fetch(url, config).then(res => res.json());
        });
      }

      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: getStoredRefreshToken() }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setStoredTokens(data.access_token, data.refresh_token);
          processQueue(null, data.access_token);
          isRefreshing = false;

          // Retry original request with newly issued access token
          config.headers['Authorization'] = `Bearer ${data.access_token}`;
          response = await fetch(url, config);
        } else {
          clearStoredTokens();
          processQueue(new Error('Session expired'), null);
          isRefreshing = false;
          window.dispatchEvent(new Event('auth:expired'));
          throw new Error('Your session has expired. Please log in again.');
        }
      } catch (err) {
        clearStoredTokens();
        processQueue(err, null);
        isRefreshing = false;
        window.dispatchEvent(new Event('auth:expired'));
        throw err;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
