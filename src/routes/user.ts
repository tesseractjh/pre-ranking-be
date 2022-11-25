import dotenv from 'dotenv';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '@middlewares/handleError';
import handleSignupToken from '@middlewares/handleSignupToken';
import UserController from '@controllers/UserController';
import AuthController from '@controllers/AuthController';
import cookieOption from '@config/cookie';
import jwtOption from '@config/jwt';

dotenv.config();
const { JWT_SECRET, DOMAIN } = process.env;

const router = Router();

router.get('/login', async (req, res) => {
  const { auth } = req.signedCookies;
  const token = jwt.verify(auth, JWT_SECRET, jwtOption.AUTH_VERIFY);
  if (!token || typeof token === 'string' || 'payload' in token) {
    res.clearCookie('auth');
    res.redirect(DOMAIN);
    return;
  }
  const { userId } = token;
  const accessToken = AuthController.createAccessToken(userId);
  const refreshToken = AuthController.createRefreshToken(userId);
  res.cookie('auth', refreshToken, cookieOption.REFRESH_TOKEN);
  res.send(accessToken);
});

router.post('/logout', async (req, res) => {
  res.clearCookie('auth');
});

router.get('/user_name', async (req, res) => {
  const { value } = req.query;
  if (typeof value !== 'string') {
    throw new CustomError(400, '올바르지 않은 쿼리 파라미터');
  }
  const user = await UserController.findByUserName(value);
  res.send(!user);
});

router.get('/email', async (req, res) => {
  const { value } = req.query;
  if (typeof value !== 'string') {
    throw new CustomError(400, '올바르지 않은 쿼리 파라미터');
  }
  const user = await UserController.findByEmail(value);
  res.send(!user);
});

router.patch('/signup', handleSignupToken, async (req, res) => {
  const {
    signup: { userId }
  } = req;
  const { userName, email } = req.body;

  if (!userName || !email) {
    throw new CustomError(400, '닉네임 또는 이메일을 입력해주세요!');
  }

  const user = await UserController.findById(userId);

  if (!user) {
    throw new CustomError(404, '임시 회원 정보가 존재하지 않음', {
      redirect: '/login'
    });
  }

  const refreshToken = AuthController.createRefreshToken(userId);

  await UserController.updateById(userId, {
    user_name: userName,
    email,
    refresh_token: refreshToken
  });

  res.clearCookie('signup');
  res.cookie('auth', refreshToken, cookieOption.REFRESH_TOKEN);
  res.send(true);
});

export default router;
