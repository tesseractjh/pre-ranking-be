import type { Request } from 'express';
import { Router } from 'express';
import PredictionController from '@controllers/PredictionController';
import updateJson from '@utils/updateJson';
import tokenHandlers, { preventRedirect } from '@middlewares/tokenHandlers';
import { CustomError } from '@middlewares/handleError';
import UserController from '@controllers/UserController';
import stockDate from '@schedules/stock/utils/stockDate';

const PREDICTION_PERIOD = 24 * 60 * 60 * 1000;

const COIN_REQUIREMENTS: Record<string, number> = {
  stock_fluctuation: 10
};

const validatePredicitonValue = (category: string, value: string) => {
  switch (category) {
    case 'stock_fluctuation':
      return value === '0' || value === '1';
    default:
      return false;
  }
};

const router = Router();

router.get('/', preventRedirect, ...tokenHandlers, async (req, res) => {
  const {
    userId,
    query: { category, lastId, unsubmitted }
  } = req;

  const predictions =
    category === 'all'
      ? await PredictionController.findAllPredictions(
          Number.isNaN(Number(lastId)) ? 0 : Number(lastId),
          userId ?? 0,
          unsubmitted === 'true'
        )
      : await PredictionController.findPredictions(
          Number.isNaN(Number(lastId)) ? 0 : Number(lastId),
          userId ?? 0,
          `info_${category}`,
          unsubmitted === 'true'
        );

  updateJson(req, { predictions });
  res.json(req.json);
});

router.post(
  '/',
  ...tokenHandlers,
  async (req: Request<unknown, unknown, Express.Body>, res) => {
    const {
      userId,
      body: { category, predictionId, predictionValue }
    } = req;

    const prediction = await PredictionController.findPredictionById(
      predictionId,
      `info_${category}`
    );

    if (!prediction || prediction.prediction_category !== `info_${category}`) {
      throw new CustomError(404, '존재하지 않는 예측입니다!');
    }

    if (prediction.created_at.getTime() + PREDICTION_PERIOD < Date.now()) {
      throw new CustomError(403, '예측 마감 기한이 지났습니다!');
    }

    const userPrediction = await PredictionController.findUserPrediciton(
      userId,
      predictionId
    );

    if (userPrediction) {
      throw new CustomError(403, '이미 참여한 예측입니다!');
    }

    if (!validatePredicitonValue(category, predictionValue)) {
      throw new CustomError(400, '올바르지 않은 입력입니다!');
    }

    const user = await UserController.findById(userId);

    if (!user) {
      throw new CustomError(404, '존재하지 않는 사용자입니다!', {
        redirect: '/login'
      });
    }

    const { coin } = user;
    const requiredCoin =
      stockDate.getDateDiff(prediction.last_date, prediction.result_date) *
      COIN_REQUIREMENTS[category];

    if (coin < requiredCoin) {
      throw new CustomError(403, '코인이 부족합니다!');
    }

    await PredictionController.createUserPrediction(
      userId,
      predictionId,
      predictionValue
    );

    await UserController.updateById(userId, { coin: coin - requiredCoin });

    res.json(req.json);
  }
);

export default router;
