import { Router } from 'express';
import passport from 'passport';
import handleAuth from '@middlewares/handleAuth';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  handleAuth
);

router.get('/kakao', passport.authenticate('kakao'));

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', { session: false }),
  handleAuth
);

router.post('/logout', async (req, res) => {
  res.clearCookie('auth');
});

export default router;
