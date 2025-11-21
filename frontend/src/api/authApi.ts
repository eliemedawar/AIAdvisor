import { httpClient } from "./httpClient";

export interface AuthUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: AuthUser;
  access: string;
  refresh: string;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>("/auth/login/", payload);
    return data;
  },
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>("/auth/register/", payload);
    return data;
  },
  async me(): Promise<AuthUser> {
    const { data } = await httpClient.get<AuthUser>("/auth/me/");
    return data;
  }
};


