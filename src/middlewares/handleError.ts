import type { ErrorRequestHandler } from 'express';
import cookieOption from '@config/cookie';

export class CustomError extends Error {
  status: number;

  options?: {
    redirect?: string;
    clearAccessToken?: boolean;
    clearRefreshToken?: boolean;
  };

  constructor(
    status: number,
    message: string,
    options?: {
      redirect?: string;
      clearRefreshToken?: boolean;
    }
  ) {
    super(message);
    this.status = status;
    this.options = options ?? {};
  }
}

const handleError: ErrorRequestHandler = (error, req, res, next) => {
  console.log(error);
  if (error instanceof CustomError) {
    const { status, message, options } = error;
    const { redirect, clearRefreshToken } = options ?? {};
    if (clearRefreshToken) {
      res.clearCookie('auth', cookieOption.DEFAULT);
    }
    res.status(status).json({
      error: {
        message,
        redirect
      }
    });
  } else {
    res.status(500).json({ error: { message: '알 수 없는 오류 발생!' } });
  }
};

export default handleError;
