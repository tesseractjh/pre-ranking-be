import dotenv from 'dotenv';
import PredictionController from '@controllers/PredictionController';
import StockController from '@controllers/StockController';
import { scheduleJob } from 'node-schedule';
import random from './utils/random';
import stockDate from './utils/stockDate';

dotenv.config();
const { PREDICT_RULE_STOCK_FLUCTUATION, PREDICT_RULE_STOCK_PRICE } =
  process.env;
const MARKET_CAPITALIZATION_01 = 500_000_000_000;
const MARKET_CAPITALIZATION_02 = 50_000_000_000;
const MINIMUM_TRANSACTION_PRICE = 1_000_000_000;
const MINIMUM_CLOSING_PRICE = 5_000;

// 시총 5000억 이상
const PARAMS_HIGH_MARKET_CAPITALIZATION = {
  numOfRows: 500,
  beginMrktTotAmt: MARKET_CAPITALIZATION_01
};

// 시총 5000억 미만 거래대금 10억 이상
const PARAMS_HIGH_TRANSACTION_PRICE = {
  numOfRows: 1000,
  endMrktTotAmt: MARKET_CAPITALIZATION_01,
  beginTrPrc: MINIMUM_TRANSACTION_PRICE
};

// 시총 500억 이상
const PARAMS_MARKET_CAPITALIZATION = {
  numOfRows: 3000,
  beginMrktTotAmt: MARKET_CAPITALIZATION_02
};

export const createStockFluctuationInfo = scheduleJob(
  PREDICT_RULE_STOCK_FLUCTUATION,
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
      const id = await StockController.createStockInfo(
        'stock_fluctuation',
        info
      );

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

export const createStockPriceInfo = scheduleJob(
  PREDICT_RULE_STOCK_PRICE,
  async () => {
    try {
      const lastDate = stockDate.getLastDate();

      const {
        response: {
          body: {
            items: { item }
          }
        }
      } = await StockController.getStockInfo({
        ...PARAMS_MARKET_CAPITALIZATION,
        basDt: stockDate.formatDate(lastDate)
      });

      const filteredItem = item.filter(
        ({ clpr }) => Number(clpr) >= MINIMUM_CLOSING_PRICE
      );
      const info =
        filteredItem[Math.floor(Math.random() * filteredItem.length)];
      const id = await StockController.createStockInfo('stock_price', info);

      if (!id) {
        throw new Error('info_stock_price 레코드 생성 실패!');
      }

      const resultDate = stockDate.getRandomNextDate(lastDate);
      await PredictionController.createPrediction(
        'info_stock_price',
        id,
        resultDate
      );
    } catch (error) {
      console.log(error);
    }
  }
);
