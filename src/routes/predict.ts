import { Router } from 'express';
import PredictionController from '@controllers/PredictionController';
import updateJson from '@utils/updateJson';

const router = Router();

router.get('/', async (req, res) => {
  const {
    query: { category, lastId }
  } = req;
  const predictions = await PredictionController.getPredictions(
    Number.isNaN(Number(lastId)) ? 0 : Number(lastId),
    category && String(category)
  );
  updateJson(req, { predictions });
  res.json(req.json);
});

export default router;
