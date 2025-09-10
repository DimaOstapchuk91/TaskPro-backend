export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export type LoginPayload = Pick<RegisterPayload, 'email' | 'password'>;

export type ResponseUser = Pick<RegisterPayload, 'name' | 'email'>;

export interface ResponseLogin {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  id: string;
  access_token: string;
  refresh_token: string;
}
