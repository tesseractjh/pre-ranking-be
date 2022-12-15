import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import notificationRouter from './notification';
import predictRouter from './predict';
import rankRouter from './rank';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/notification', notificationRouter);
router.use('/prediction', predictRouter);
router.use('/rank', rankRouter);

export default router;
