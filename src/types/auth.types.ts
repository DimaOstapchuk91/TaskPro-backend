export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export type LoginPayload = Pick<RegisterPayload, 'email' | 'password'>;

export type ResponseUser = Pick<RegisterPayload, 'name' | 'email'>;

export interface ResponseLoginSession {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export interface SessionPart {
  id: string;
  access_token: string;
  refresh_token: string;
}

export interface AllSessionData {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  access_token_valid_until: Date;
  refresh_token_valid_until: Date;
}

export interface RefreshCookies {
  sessionId: string;
  refreshToken: string;
}

export interface AllUserData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  theme: 'light' | 'dark' | 'violet';
}
