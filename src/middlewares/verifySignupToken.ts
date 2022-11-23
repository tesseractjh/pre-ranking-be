import { RequestHandler } from 'express';
import { CustomError } from '@middlewares/handleError';

const verifySignupToken: RequestHandler = async (req, res, next) => {
  const { signup } = req.signedCookies;

  if (!signup || !signup.userId) {
    throw new CustomError(400, '회원가입을 위한 임시 토큰이 유효하지 않음', {
      redirect: '/login'
    });
  }

  req.signup = signup;
  next();
};

export default verifySignupToken;
