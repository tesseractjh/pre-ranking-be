import { Router } from 'express';
import cookieOption from '@config/cookie';
import { CustomError } from '@middlewares/handleError';
import handleRefreshToken from '@middlewares/handleRefreshToken';
import UserController from '@controllers/UserController';
import AuthController from '@controllers/AuthController';
import updateRefreshToken from '@utils/updateRefreshToken';
import updateJson from '@utils/updateJson';
import tokenHandlers from '@middlewares/tokenHandlers';

const router = Router();

router.get('/signin', handleRefreshToken, async (req, res) => {
  const { refreshToken } = req;

  // refresh token이 없는 경우
  if (!refreshToken) {
    res.clearCookie('auth', cookieOption.DEFAULT);
    return res.end();
  }

  const { token, userId } = refreshToken;
  const user = await UserController.findById(userId);

  // token 내용물이 없거나 해당 user가 존재하지 않을 경우
  if (!token || !user) {
    res.clearCookie('auth', cookieOption.DEFAULT);
    return res.end();
  }

  const { refresh_token: prevRefreshToken } = user;

  // DB의 refresh token과 일치하지 않는 경우
  if (prevRefreshToken !== token) {
    res.clearCookie('auth', cookieOption.DEFAULT);
    return res.end();
  }

  const accessToken = AuthController.createAccessToken(userId);
  const newRefreshToken = await updateRefreshToken(userId);

  // refresh token 발급 과정에서 에러가 발생한 경우
  if (!newRefreshToken) {
    res.clearCookie('auth', cookieOption.DEFAULT);
    return res.end();
  }

  res.cookie('auth', newRefreshToken, cookieOption.REFRESH_TOKEN);
  updateJson(req, { accessToken });
  res.json(req.json);
});

router.post('/signin/redirect', async (req, res) => {
  const {
    body: { token }
  } = req;

  const user = await UserController.findBySigninToken(String(token));

  if (!user) {
    throw new CustomError(400, '잘못된 요청입니다!');
  }

  const { user_id: userId } = user;
  const refreshToken = AuthController.createRefreshToken(userId);
  await UserController.updateById(userId, {
    signin_token: '',
    refresh_token: refreshToken
  });

  res.cookie('auth', refreshToken, cookieOption.REFRESH_TOKEN);
  updateJson(req, { isSuccess: true });
  res.json(req.json);
});

router.post('/signout', handleRefreshToken, async (req, res) => {
  const { refreshToken } = req;
  if (refreshToken?.userId) {
    await UserController.updateById(refreshToken.userId, {
      refresh_token: ''
    });
  }
  res.clearCookie('auth', cookieOption.DEFAULT);
  res.end();
});

router.get('/user_name', async (req, res) => {
  const { value } = req.query;
  if (typeof value !== 'string') {
    throw new CustomError(400, '올바르지 않은 쿼리 파라미터');
  }
  const user = await UserController.findByUserName(value);
  updateJson(req, { hasDuplicate: !!user });
  res.json(req.json);
});

router.get('/email', async (req, res) => {
  const { value } = req.query;
  if (typeof value !== 'string') {
    throw new CustomError(400, '올바르지 않은 쿼리 파라미터');
  }
  const user = await UserController.findByEmail(value);
  updateJson(req, { hasDuplicate: !!user });
  res.json(req.json);
});

router.patch('/signup', async (req, res) => {
  const { userName, id, provider, email } = req.body;

  if (!userName || !email) {
    throw new CustomError(400, '닉네임 또는 이메일을 입력해주세요!');
  }

  if (!id || !provider) {
    throw new CustomError(400, '올바르지 않은 가입 요청입니다!');
  }

  const user = await UserController.findByAuthInfo(id, provider);

  if (!user) {
    throw new CustomError(404, '임시 회원 정보가 존재하지 않음', {
      redirect: '/login'
    });
  }

  const refreshToken = AuthController.createRefreshToken(user.user_id);

  await UserController.updateById(user.user_id, {
    user_name: userName,
    email,
    refresh_token: refreshToken
  });

  res.cookie('auth', refreshToken, cookieOption.REFRESH_TOKEN);
  res.end();
});

router.get('/', ...tokenHandlers, async (req, res) => {
  const { userId } = req;
  const user = await UserController.findUserInfoById(userId);
  updateJson(req, { user });
  res.json(req.json);
});

export default router;
