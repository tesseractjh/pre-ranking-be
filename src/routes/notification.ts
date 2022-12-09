import NotificationController from '@controllers/NotificationController';
import tokenHandlers from '@middlewares/tokenHandlers';
import updateJson from '@utils/updateJson';
import { Router } from 'express';

const router = Router();

router.get('/', ...tokenHandlers, async (req, res) => {
  const {
    userId,
    query: { start }
  } = req;
  const notifications = await NotificationController.getNotification(
    userId,
    Number(start)
  );
  updateJson(req, { notifications });
  res.json(req.json);
});

router.delete('/:id', ...tokenHandlers, async (req, res) => {
  const {
    userId,
    params: { id }
  } = req;
  await NotificationController.deleteNotification(userId, Number(id));
  updateJson(req, { isSuccess: true });
  res.json(req.json);
});

router.delete('/', ...tokenHandlers, async (req, res) => {
  const { userId } = req;
  await NotificationController.deleteAllNotifications(Number(userId));
  updateJson(req, { isSuccess: true });
  res.json(req.json);
});

export default router;
