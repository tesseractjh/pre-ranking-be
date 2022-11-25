import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import jwtOption from '@config/jwt';
import verifyToken from '@utils/verifyToken';

dotenv.config();
const { JWT_SECRET } = process.env;

const verifySignupToken: RequestHandler = async (req, res, next) => {
  const { signup } = req.signedCookies;
  const verify = verifyToken(400, '회원가입을 위한 임시 토큰이 유효하지 않음', {
    redirect: '/login'
  });

  const { userId } = verify(signup, JWT_SECRET, jwtOption.SIGNUP_VERIFY);
  req.signup = { userId };

  next();
};

export default verifySignupToken;
