import axios from "axios";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../context/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const httpClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

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

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getStoredTokens()?.refresh
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(httpClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = getStoredTokens();
        const refreshToken = tokens?.refresh;
        const res = await axios.post(
          `${baseURL}/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        const newAccess = res.data.access as string;
        setStoredTokens({ access: newAccess, refresh: refreshToken || "" });
        httpClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        onRefreshed(newAccess);
        return httpClient(originalRequest);
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


