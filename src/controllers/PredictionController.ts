import DB from '@config/database';

const MAX_INT_VALUE = 4294967295;

const PredictionController = {
  async getPredictions(id: number, category?: string) {
    const predictions = category
      ? await DB.query<
          (Model.Prediction &
            Model.StockFluctuation & { participant_count: number })[]
        >(
          `
            SELECT
              P.*,
              I.stock_name,
              I.last_price,
              I.last_date,
              I.short_code,
              I.market_category,
              I.vs,
              I.fluctuation_rate,
              (
                SELECT COUNT(*)
                FROM user_prediction U
                WHERE U.prediction_id = P.prediction_id
              ) AS participant_count
            FROM prediction P
            JOIN ?? I
            ON P.prediction_info_id = I.info_id
            WHERE prediction_category = ? AND prediction_id < ?
            ORDER BY created_at DESC
            LIMIT 10;
          `,
          [category, category, id || MAX_INT_VALUE]
        )
      : await DB.query<Model.Prediction & Model.StockFluctuation[]>(
          `
            SELECT 
              P.*,
              ISF.stock_name,
              ISF.last_price,
              ISF.last_date,
              ISF.short_code,
              ISF.market_category,
              ISF.vs,
              ISF.fluctuation_rate,
              (
                SELECT COUNT(*)
                FROM user_prediction U
                WHERE U.prediction_id = P.prediction_id
              ) AS participant_count
            FROM prediction P
            JOIN info_stock_fluctuation ISF
            ON P.prediction_info_id = ISF.info_id
            WHERE prediction_id < ?
            ORDER BY created_at DESC
            LIMIT 10;
          `,
          [id || MAX_INT_VALUE]
        ); // TODO: 전체 예측 페이지에서는 prediction을 모든 예측 info 테이블과 join 후 union해서 가져와야 할 것 같음(또는 case문으로  join?)
    return predictions;
    // TODO: prediction_id를 같이 받아와서 해당 id보다 낮은 것 내에서 찾기! 이렇게 해야 도중에 데이터가 추가되어도 중복이 생기지 않음!
  },
  async createPrediction(
    tableName: string,
    infoId: number,
    resultDate: string
  ) {
    const result = await DB.query(
      `
        INSERT INTO prediction (
          prediction_category,
          prediction_info_id,
          result_date,
          created_at
        )
        VALUES (?, ?, ?, NOW());
      `,
      [tableName, infoId, resultDate]
    );

    return result;
  }
};

export default PredictionController;
