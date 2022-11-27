import dotenv from 'dotenv';
import type { RequestHandler } from 'express';
import jwtOption from '@config/jwt';
import { verifyTokenWithoutError } from '@utils/verifyToken';

dotenv.config();
const { JWT_SECRET } = process.env;

const handleAccessToken: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1] ?? '';

  const result = verifyTokenWithoutError(
    token,
    JWT_SECRET,
    jwtOption.AUTH_VERIFY
  );

  if (!result) {
    return next();
  }

  req.accessToken = { token, userId: result.userId };
  req.ignoreRefreshToken = true;
  next();
};

export default handleAccessToken;
