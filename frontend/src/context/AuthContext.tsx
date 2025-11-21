import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState
} from "react";
import { authApi, AuthUser, LoginRequest, RegisterRequest } from "../api/authApi";
import {
  StoredTokens,
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens
} from "./tokenStorage";

interface AuthContextValue {
  user: AuthUser | null;
  tokens: StoredTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<StoredTokens | null>(
    getStoredTokens()
  );
  const [isLoading, setIsLoading] = useState(true);

  const bootstrapUser = useCallback(async () => {
    const stored = getStoredTokens();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setTokens(stored);
    } catch {
      clearStoredTokens();
      setUser(null);
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrapUser();
  }, [bootstrapUser]);

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await authApi.login(payload);
    const newTokens: StoredTokens = {
      access: res.access,
      refresh: res.refresh
    };
    setStoredTokens(newTokens);
    setTokens(newTokens);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const res = await authApi.register(payload);
    const newTokens: StoredTokens = {
      access: res.access,
      refresh: res.refresh
    };
    setStoredTokens(newTokens);
    setTokens(newTokens);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredTokens();
    setTokens(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


