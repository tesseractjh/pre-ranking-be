import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import cookieOption from '@config/cookie';
import AuthController from '@controllers/AuthController';
import UserController from '@controllers/UserController';
import { CustomError } from './handleError';

dotenv.config();
const { DOMAIN } = process.env;

const handleAuth: RequestHandler = async (req, res) => {
  const { id, provider, email } = req.user;

  if (!id || !provider) {
    throw new CustomError(500, 'OAuth profile이 유효하지 않음');
  }

  const user = await UserController.findByOAuth(id, provider);

  if (user) {
    // 이미 가입된 회원 -> 로그인 성공 -> refresh 토큰 발급
    if (user.user_name) {
      const refreshToken = AuthController.createRefreshToken(user.user_id);
      await UserController.updateById(user.user_id, {
        refresh_token: refreshToken
      });
      res.clearCookie('signup');
      res.cookie('auth', refreshToken, cookieOption.REFRESH_TOKEN);
      res.redirect(DOMAIN);
    } else {
      // Oauth로 가입을 시도한 적이 있으나, 닉네임과 이메일 입력 등 가입 절차를 완료하지 않은 경우 -> userId와 임시 이메일을 쿠키로 전달
      const token = AuthController.createSignupToken(user.user_id);
      res.clearCookie('auth');
      res.cookie('signup', token, cookieOption.SIGNUP);
      res.redirect(`${DOMAIN}/signup${email ? `?email=${email}` : ''}`);
    }
  } else {
    // 최초 Oauth 로그인 -> DB에 임시 닉네임으로 유저 정보 생성 -> userId와 임시 이메일을 쿠키로 전달
    const userId = await UserController.create(id, provider);
    const token = AuthController.createSignupToken(Number(userId));
    res.clearCookie('auth');
    res.cookie('signup', token, cookieOption.SIGNUP);
    res.redirect(`${DOMAIN}/signup${email ? `?email=${email}` : ''}`);
  }
};

export default handleAuth;
