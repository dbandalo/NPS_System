export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isLocked: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  hasVoted: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  user?: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}
