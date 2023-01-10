import dotenv from 'dotenv';
import PredictionController from '@controllers/PredictionController';
import StockController from '@controllers/StockController';
import { scheduleJob } from 'node-schedule';
import { REWARDS } from './constants';
import stockDate from './utils/stockDate';

dotenv.config();
const { RESULT_RULE_STOCK_FLUCTUATION, RESULT_RULE_STOCK_PRICE } = process.env;

export const confirmStockFluctuationResult = scheduleJob(
  RESULT_RULE_STOCK_FLUCTUATION,
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
            coinReward: REWARDS.stock_fluctuation.coin,
            scoreReward: REWARDS.stock_fluctuation.reward,
            scorePanelty: REWARDS.stock_fluctuation.penalty,
            resultValue:
              Number(res.response?.body?.items?.item[0]?.clpr) < lastPrice
                ? '1'
                : '0',
            resultPrice: Number(res.response?.body?.items?.item[0]?.clpr),
            coinMultiple: stockDate.getDateDiff(lastDate, resultDate)
          };
        });

      if (!results.length) {
        return;
      }

      await Promise.all(
        results.map((result) =>
          StockController.confirmStockInfo('stock_fluctuation', result)
        )
      );
    } catch (error) {
      console.log(error);
    }
  }
);

export const confirmStockPriceResult = scheduleJob(
  RESULT_RULE_STOCK_PRICE,
  async () => {
    try {
      const predictions = await PredictionController.findPredictionsWithResult<
        Pick<
          Model.StockPrice,
          'stock_name' | 'last_price' | 'last_date' | 'code'
        >
      >('info_stock_price');

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
            last_date: lastDate,
            result_date: resultDate
          } = predictions[index];
          const resultPrice = res.response?.body?.items?.item[0]?.clpr;

          return {
            predictionId,
            infoId,
            stockName,
            coinReward: REWARDS.stock_price.coin,
            scoreReward: REWARDS.stock_price.reward,
            scorePanelty: REWARDS.stock_price.penalty,
            resultValue: resultPrice,
            resultPrice: Number(resultPrice),
            coinMultiple: stockDate.getDateDiff(lastDate, resultDate),
            bonusCoinReward: REWARDS.stock_price.bonusCoin,
            bonusScoreReward: REWARDS.stock_price.bonusReward
          };
        });

      if (!results.length) {
        return;
      }

      await Promise.all(
        results.map((result) =>
          StockController.confirmStockInfo('stock_price', result)
        )
      );
    } catch (error) {
      console.log(error);
    }
  }
);
