import dotenv from 'dotenv';
import axios from 'axios';
import { Agent } from 'https';
import DB from '@config/database';
import type {
  StockAPIRequestParams,
  StockAPIResponse,
  StockInfo
} from '@schedules/stock/types/stockInfo';

dotenv.config();
const { STOCK_API_URL, STOCK_API_KEY } = process.env;
const DEFAULT_PARAMS = {
  serviceKey: STOCK_API_KEY,
  resultType: 'json'
};

const instance = axios.create({
  baseURL: STOCK_API_URL,
  httpsAgent: new Agent({ rejectUnauthorized: false })
});

const StockController = {
  async getStockInfo(params: Partial<StockAPIRequestParams>) {
    const { data } = await instance.get<StockAPIResponse>('', {
      params: { ...DEFAULT_PARAMS, ...params },
      httpsAgent: new Agent({ rejectUnauthorized: false })
    });

    return data;
  },

  async createStockInfo(
    category: string,
    { basDt, isinCd, srtnCd, clpr, fltRt, itmsNm, mrktCtg, vs }: StockInfo
  ) {
    const result = await DB.query(
      `
        INSERT INTO info_${category} (
          stock_name,
          last_price,
          last_date,
          code,
          short_code,
          market_category,
          vs,
          fluctuation_rate,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW());
      `,
      [itmsNm, clpr, basDt, isinCd, srtnCd, mrktCtg, vs, fltRt]
    );

    return result?.insertId;
  },

  async confirmStockInfo(
    category: string,
    {
      predictionId,
      infoId,
      stockName,
      coinReward,
      scoreReward,
      scorePanelty,
      resultValue,
      resultPrice,
      coinMultiple = 1,
      scoreMultiple = 1,
      bonusCoinReward = 0,
      bonusScoreReward = 0
    }: {
      predictionId: number;
      infoId: number;
      stockName: string;
      scoreReward: number;
      scorePanelty: number;
      coinReward: number;
      resultValue: string;
      resultPrice: number;
      coinMultiple?: number;
      scoreMultiple?: number;
      bonusCoinReward?: number;
      bonusScoreReward?: number;
    }
  ) {
    const result = await DB.query(
      `
        CALL confirm_${category}_result(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        predictionId,
        infoId,
        stockName,
        coinReward,
        scoreReward,
        scorePanelty,
        resultValue,
        resultPrice,
        coinMultiple,
        scoreMultiple,
        bonusCoinReward,
        bonusScoreReward
      ]
    );

    return result;
  }
};

export default StockController;
