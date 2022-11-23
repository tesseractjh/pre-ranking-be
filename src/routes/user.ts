import { Router } from 'express';
import { CustomError } from '@middlewares/handleError';
import verifySignupToken from '@middlewares/verifySignupToken';
import UserController from '@controllers/UserController';
import AuthController from '@controllers/AuthController';
import cookieOption from '@config/cookie';

const router = Router();

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
