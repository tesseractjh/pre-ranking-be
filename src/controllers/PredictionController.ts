import DB from '@config/database';

const MAX_INT_VALUE = 4294967295;

const findUnSubmitted = (sql: string, unsubmitted: boolean) =>
  unsubmitted
    ? `
  SELECT *
  FROM (
    ${sql
      .replace(';', '')
      .replace('LIMIT 10', '')
      .replace('AND prediction_id < ?', '')
      .replace('WHERE prediction_id < ?', '')}
  ) P
  WHERE
    prediction_value IS NULL
    AND prediction_id < ?
    AND TIMEDIFF(NOW(), created_at) < '24:00:00'
  LIMIT 10;
`
    : sql;

const PredictionController = {
  async findPredictionById(id: number, category: string) {
    const prediction = await DB.query<
      (Model.Prediction & Pick<Model.StockFluctuation, 'last_date'>)[]
    >(
      `
        SELECT P.*, I.last_date
        FROM prediction P
        JOIN ?? I
        ON P.prediction_info_id = I.info_id
        WHERE prediction_id = ?;
      `,
      [category, id]
    );

    return prediction?.[0] || null;
  },

  async findPredictions(
    predictionId: number,
    userId: number,
    category: string,
    unsubmitted: boolean
  ) {
    const predictions = await DB.query<
      (Model.Prediction &
        Model.StockFluctuation & {
          participant_count: number;
          prediction_value: string;
        })[]
    >(
      findUnSubmitted(
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
            ) AS participant_count,
            (
              SELECT prediction_value
              FROM user_prediction U
              WHERE U.user_id = ? AND U.prediction_id = P.prediction_id
            ) AS prediction_value
          FROM prediction P
          JOIN ?? I
          ON P.prediction_info_id = I.info_id
          WHERE prediction_category = ? AND prediction_id < ?
          ORDER BY created_at DESC
          LIMIT 10;
        `,
        unsubmitted
      ),
      [userId, category, category, predictionId || MAX_INT_VALUE]
    );

    return predictions;
  },

  async findAllPredictions(
    predictionId: number,
    userId: number,
    unsubmitted: boolean
  ) {
    const predictions = await DB.query<
      (Model.Prediction &
        Model.StockFluctuation & {
          participant_count: number;
          prediction_value: string;
        })[]
    >(
      findUnSubmitted(
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
            ) AS participant_count,
            (
              SELECT prediction_value
              FROM user_prediction U
              WHERE U.user_id = ? AND U.prediction_id = P.prediction_id
            ) AS prediction_value
          FROM prediction P
          JOIN info_stock_fluctuation ISF
          ON P.prediction_info_id = ISF.info_id
          WHERE prediction_id < ?
          ORDER BY created_at DESC
          LIMIT 10;
        `,
        unsubmitted
      ),
      [userId, predictionId || MAX_INT_VALUE]
    );
    // TODO: 전체 예측 페이지에서는 prediction을 모든 예측 info 테이블과 join 후 union해서 가져와야 할 것 같음(또는 case문으로  join?)

    return predictions;
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
  },

  async findUserPrediciton(userId: number, predictionId: number) {
    const userPrediction = await DB.query<
      (Model.UserPrediction & Model.Prediction['prediction_category'])[]
    >(
      `
        SELECT U.*, P.prediction_category
        FROM user_prediction U
        JOIN prediction P
        ON U.prediction_id = P.prediction_id
        WHERE user_id = ? AND P.prediction_id = ?;
      `,
      [userId, predictionId]
    );

    return userPrediction?.[0] || null;
  },

  async createUserPrediction(
    userId: number,
    predictionId: number,
    predictionValue: string
  ) {
    const result = await DB.query(
      `
        INSERT INTO user_prediction (
          user_id,
          prediction_id,
          prediction_value,
          created_at
        )
        VALUES (?, ?, ?, NOW());
      `,
      [userId, predictionId, predictionValue]
    );

    return result;
  }
};

export default PredictionController;
