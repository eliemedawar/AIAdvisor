import axios from 'axios';
import { getStoredTokens, setStoredTokens, clearStoredTokens } from '../context/tokenStorage';
import { handleMockRequest } from '../mocks/mockHandlers';

// Mock mode: active when VITE_MOCK_API=true OR no real API URL is configured
const MOCK_MODE =
  import.meta.env.VITE_MOCK_API === 'true' ||
  !import.meta.env.VITE_API_BASE_URL;

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const httpClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Custom adapter: short-circuits all requests to the mock handler
if (MOCK_MODE) {
  httpClient.defaults.adapter = async (config: any) => {
    // Attach auth header from stored tokens if present
    const tokens = getStoredTokens();
    if (tokens?.access) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return handleMockRequest(config);
  };
}

// Real-network interceptors (only active when NOT in mock mode)
if (!MOCK_MODE) {
  httpClient.interceptors.request.use((config) => {
    const tokens = getStoredTokens();
    if (tokens?.access) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  });

  let isRefreshing = false;
  let refreshSubscribers: ((token: string | null) => void)[] = [];
  const subscribeTokenRefresh = (cb: (t: string | null) => void) => refreshSubscribers.push(cb);
  const onRefreshed = (token: string | null) => { refreshSubscribers.forEach(cb => cb(token)); refreshSubscribers = []; };

  httpClient.interceptors.response.use(
    res => res,
    async (error) => {
      const orig = error.config;
      if (error.response?.status === 401 && !orig._retry && getStoredTokens()?.refresh) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh(token => {
              if (!token) { reject(error); return; }
              orig.headers.Authorization = `Bearer ${token}`;
              resolve(httpClient(orig));
            });
          });
        }
        orig._retry = true;
        isRefreshing = true;
        try {
          const tokens = getStoredTokens();
          const res = await axios.post(`${baseURL}/auth/refresh/`, { refresh: tokens?.refresh }, { headers: { 'Content-Type': 'application/json' } });
          const newAccess = res.data.access as string;
          setStoredTokens({ access: newAccess, refresh: tokens?.refresh || '' });
          httpClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          onRefreshed(newAccess);
          return httpClient(orig);
        } catch (refreshError) {
          clearStoredTokens();
          onRefreshed(null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
}
