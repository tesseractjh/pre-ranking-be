import dotenv from 'dotenv';
import type { RequestHandler } from 'express';
import jwtOption from '@config/jwt';
import { verifyTokenWithoutError } from '@utils/verifyToken';

dotenv.config();
const { JWT_SECRET } = process.env;

const handleRefreshToken: RequestHandler = async (req, res, next) => {
  const { ignoreRefreshToken } = req;
  if (ignoreRefreshToken) {
    return next();
  }

  const { auth } = req.signedCookies;
  const result = verifyTokenWithoutError(
    auth,
    JWT_SECRET,
    jwtOption.AUTH_VERIFY
  );

  if (result) {
    req.refreshToken = { token: auth, userId: result.userId };
    req.userId = result.userId;
  }

  next();
};

export default handleRefreshToken;
