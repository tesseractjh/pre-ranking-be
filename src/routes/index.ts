import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import notificationRouter from './notification';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/notification', notificationRouter);

export default router;
