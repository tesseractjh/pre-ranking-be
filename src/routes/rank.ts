import { Router } from 'express';
import updateJson from '@utils/updateJson';
import RankController from '@controllers/RankController';
import tokenHandlers from '@middlewares/tokenHandlers';

const router = Router();

router.get('/', ...tokenHandlers, async (req, res) => {
  const {
    userId,
    query: { category }
  } = req;

  const rank = category
    ? await RankController.findScoreRank(userId, `user_${category}`)
    : await RankController.findTotalScoreRank(userId);
  updateJson(req, { rank });
  res.json(req.json);
});

export default router;
