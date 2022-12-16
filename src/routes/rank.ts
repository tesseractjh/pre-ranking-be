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

  const rank =
    category === 'all'
      ? await RankController.findTotalScoreRank(userId)
      : await RankController.findScoreRank(userId, `user_${category}`);
  updateJson(req, { rank });
  res.json(req.json);
});

export default router;
