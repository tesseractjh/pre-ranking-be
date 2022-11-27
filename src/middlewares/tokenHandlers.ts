import type { Request, RequestHandler } from 'express';
import cookieOption from '@config/cookie';
import AuthController from '@controllers/AuthController';
import UserController from '@controllers/UserController';
import updateJson from '@utils/updateJson';
import handleAccessToken from './handleAccessToken';
import handleRefreshToken from './handleRefreshToken';
import { CustomError } from './handleError';

const handleIssueToken: RequestHandler = async (req, res, next) => {
  const { accessToken, refreshToken } = req;
  if (accessToken) {
    return next();
  }

  if (refreshToken) {
    const { userId } = refreshToken;
    const newAccessToken = AuthController.createAccessToken(userId);
    const newRefreshToken = AuthController.createRefreshToken(userId);
    await UserController.updateById(userId, { refresh_token: newRefreshToken });
    updateJson(req, { accessToken: newAccessToken });
    res.cookie('auth', newRefreshToken, cookieOption.REFRESH_TOKEN);
    req.accessToken = {} as Request['accessToken'];
    return next();
  }

  res.clearCookie('auth');
  throw new CustomError(401, '로그인이 필요합니다', {
    redirect: '/login'
  });
};

const tokenHandlers = [handleAccessToken, handleRefreshToken, handleIssueToken];

export default tokenHandlers;
