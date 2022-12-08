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

  async createStockFluctuationInfo({
    basDt,
    isinCd,
    srtnCd,
    clpr,
    fltRt,
    itmsNm,
    mrktCtg,
    vs
  }: StockInfo) {
    const result = await DB.query(
      `
        INSERT INTO info_stock_fluctuation (
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
  }
};

export default StockController;
