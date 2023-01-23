import { Router } from 'express';
import updateJson from '@utils/updateJson';
import RankController from '@controllers/RankController';
import tokenHandlers from '@middlewares/tokenHandlers';
import UserController from '@controllers/UserController';

const router = Router();

router.get('/', async (req, res) => {
  const {
    query: { category, page }
  } = req;

  const ranks =
    category === 'all'
      ? await RankController.findAllTotalScoreRanks(Number(page))
      : await RankController.findAllScoreRanks(
          String(category),
          Number(page)
        );

  const totalUserCount = await UserController.findUserCount();

  updateJson(req, { ranks, total_user_count: totalUserCount });
  res.json(req.json);
});

router.get('/mypage', ...tokenHandlers, async (req, res) => {
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
