export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  fullName: string;
}

export interface AuthResponse {
  access_token: string;
}
