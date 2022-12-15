import PredictionController from '@controllers/PredictionController';
import StockController from '@controllers/StockController';
import { scheduleJob } from 'node-schedule';
import { REWARDS } from './constants';
import stockDate from './utils/stockDate';

export const confirmStockFluctuationResult = scheduleJob(
  '0 0/10 * * * 1-5',
  async () => {
    try {
      const predictions = await PredictionController.findPredictionsWithResult<
        Pick<
          Model.StockFluctuation,
          'stock_name' | 'last_price' | 'last_date' | 'code'
        >
      >('info_stock_fluctuation');

      if (!predictions || !predictions.length) {
        return;
      }

      const results = (
        await Promise.all(
          predictions.map(({ result_date: resultDate, code }) =>
            StockController.getStockInfo({
              basDt: stockDate.formatDate(resultDate),
              isinCd: code
            })
          )
        )
      )
        .map((res, index) => ({ res, index }))
        .filter(
          ({ res }) =>
            typeof res !== 'string' && res?.response?.body?.items?.item.length
        )
        .map(({ res, index }) => {
          const {
            prediction_id: predictionId,
            prediction_info_id: infoId,
            stock_name: stockName,
            last_price: lastPrice,
            last_date: lastDate,
            result_date: resultDate
          } = predictions[index];

          return {
            predictionId,
            infoId,
            stockName,
            coinReward:
              stockDate.getDateDiff(lastDate, resultDate) *
              REWARDS.stock_fluctuation.coin,
            scoreReward: REWARDS.stock_fluctuation.reward,
            scorePanelty: REWARDS.stock_fluctuation.penalty,
            resultValue:
              Number(res.response?.body?.items?.item[0]?.clpr) < lastPrice
                ? '1'
                : '0',
            resultPrice: Number(res.response?.body?.items?.item[0]?.clpr)
          };
        });

      if (!results.length) {
        return;
      }

      await Promise.all(
        results.map((result) => StockController.confirmStockFluctuation(result))
      );
    } catch (error) {
      console.log(error);
    }
  }
);
