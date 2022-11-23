import dotenv from 'dotenv';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '@middlewares/handleError';
import verifySignupToken from '@middlewares/verifySignupToken';
import UserController from '@controllers/UserController';
import AuthController from '@controllers/AuthController';
import cookieOption from '@config/cookie';
import jwtOption from '@config/jwt';

dotenv.config();
const { JWT_SECRET, DOMAIN } = process.env;

const router = Router();

router.get('/login', async (req, res) => {
  const { auth } = req.signedCookies;
  const token = jwt.verify(auth, JWT_SECRET, jwtOption.SIGNUP_VERIFY);
  if (!token || typeof token === 'string' || 'payload' in token) {
    res.clearCookie('auth');
    res.redirect(DOMAIN);
    return;
  }
  const { userId } = token;
  const accessToken = AuthController.createAccessToken(userId);
  const refreshToken = AuthController.createRefreshToken(userId);
  res.cookie('auth', refreshToken, cookieOption.REFRESH_TOKEN);
  res.json({ accessToken });
});

router.patch('/signup', verifySignupToken, async (req, res) => {
  const { signup } = req;
  const userId = Number(signup.userId);
  const { user_name: userName, email } = req.body;

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
});

export default router;
