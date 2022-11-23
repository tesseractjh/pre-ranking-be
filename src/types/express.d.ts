declare namespace Express {
  interface Request {
    user: {
      id: string;
      provider: string;
      email: string;
    };
    signup: {
      userId: string;
      email?: string;
    };
  }
}
