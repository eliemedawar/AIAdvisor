export interface StoredTokens {
  access: string;
  refresh: string;
}

const ACCESS_KEY = "aaa_access_token";
const REFRESH_KEY = "aaa_refresh_token";

export const getStoredTokens = (): StoredTokens | null => {
  if (typeof window === "undefined") return null;
  const access = window.localStorage.getItem(ACCESS_KEY);
  const refresh = window.localStorage.getItem(REFRESH_KEY);
  if (!access || !refresh) return null;
  return { access, refresh };
};

export const setStoredTokens = (tokens: StoredTokens) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
};

export const clearStoredTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
};


