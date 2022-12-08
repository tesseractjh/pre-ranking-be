import { Router } from 'express';
import PredictionController from '@controllers/PredictionController';
import updateJson from '@utils/updateJson';
import tokenHandlers, { preventRedirect } from '@middlewares/tokenHandlers';

const router = Router();

router.get('/', preventRedirect, ...tokenHandlers, async (req, res) => {
  const {
    userId,
    query: { category, lastId }
  } = req;
  const predictions = await PredictionController.getPredictions(
    Number.isNaN(Number(lastId)) ? 0 : Number(lastId),
    userId ?? 0,
    category && String(category)
  );
  updateJson(req, { predictions });
  res.json(req.json);
});

export default router;
