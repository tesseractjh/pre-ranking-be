declare namespace Express {
  interface Request {
    user: {
      id: string;
      provider: string;
      email: string;
    };
    signup: {
      userId: number;
    };
    accessToken: {
      token: string;
      userId: number;
    };
    refreshToken: {
      token: string;
      userId: number;
    };
    ignoreRefreshToken: boolean;
    json: { [key: string]: unknown; accessToken?: string };
    userId: number;
  }
}
