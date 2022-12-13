import PredictionController from '@controllers/PredictionController';
import StockController from '@controllers/StockController';
import { scheduleJob } from 'node-schedule';
import random from './utils/random';
import stockDate from './utils/stockDate';

const MINIMUM_MARKET_CAPITALIZATION = 500_000_000_000;
const MINIMUM_TRANSACTION_PRICE = 1_000_000_000;

// 시총 5000억 이상
const PARAMS_HIGH_MARKET_CAPITALIZATION = {
  numOfRows: 500,
  beginMrktTotAmt: MINIMUM_MARKET_CAPITALIZATION
};

// 시총 5000억 미만 거래대금 10억 이상
const PARAMS_HIGH_TRANSACTION_PRICE = {
  numOfRows: 1000,
  endMrktTotAmt: MINIMUM_MARKET_CAPITALIZATION,
  beginTrPrc: MINIMUM_TRANSACTION_PRICE
};

export const createStockFluctuationInfo = scheduleJob(
  '50 59 12-23,0-8 * * *',
  async () => {
    try {
      const lastDate = stockDate.getLastDate();
      const params = random.selectOneFromArray([
        PARAMS_HIGH_MARKET_CAPITALIZATION,
        PARAMS_HIGH_TRANSACTION_PRICE
      ]);

      const {
        response: {
          body: {
            items: { item }
          }
        }
      } = await StockController.getStockInfo({
        ...params,
        basDt: stockDate.formatDate(lastDate)
      });
      const info = item[Math.floor(Math.random() * item.length)];
      const id = await StockController.createStockFluctuationInfo(info);

      if (!id) {
        throw new Error('info_stock_fluctuation 레코드 생성 실패!');
      }

      const resultDate = stockDate.getRandomNextDate(lastDate);
      await PredictionController.createPrediction(
        'info_stock_fluctuation',
        id,
        resultDate
      );
    } catch (error) {
      console.log(error);
    }
  }
);
