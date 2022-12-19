import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import { nanoid } from 'nanoid';
import cookieOption from '@config/cookie';
import UserController from '@controllers/UserController';
import queryString from '@utils/queryString';
import { CustomError } from './handleError';

dotenv.config();
const { DOMAIN } = process.env;

const handleAuth: RequestHandler = async (req, res) => {
  const { id, provider, email } = req.user;

  if (!id || !provider) {
    throw new CustomError(500, 'OAuth profile이 유효하지 않음');
  }

  const user = await UserController.findByOAuth(id, provider);

  // 이미 가입된 회원 -> 로그인 성공 -> refresh 토큰 발급
  if (user?.user_name) {
    const signinToken = nanoid();
    await UserController.updateById(user.user_id, {
      signin_token: signinToken
    });
    return res.redirect(
      `${DOMAIN}/login/redirect${queryString({ token: signinToken })}`
    );
  }

  // 회원 생성
  if (!user) {
    await UserController.create(id, provider);
  }

  // 회원가입 페이지로 리디렉트
  res.clearCookie('auth', cookieOption.DEFAULT);
  res.redirect(`${DOMAIN}/signup${queryString({ id, provider, email })}`);
};

export default handleAuth;
