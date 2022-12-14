import DB from '@config/database';

const MAX_INT_VALUE = 4294967295;

const findUnsubmitted = (sql: string, unsubmitted: boolean) =>
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
    AND TIMESTAMPDIFF(HOUR, created_at, NOW()) < 24
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

  async findPredictionInfoById(predictionId: number, userId: number) {
    const result = await DB.query<Model.Prediction[]>(
      `
        SELECT prediction_category
        FROM prediction
        WHERE prediction_id = ?;
      `,
      [predictionId]
    );

    const category = result?.[0]?.prediction_category;

    const prediction = await DB.query<
      (Model.Prediction & {
        prediction_created_at: Date;
        participant_count: number;
        prediction_value: string;
        user_prediction_data: {
          prediction_value: string;
          count: number;
        }[];
      })[]
    >(
      `
        SELECT
          prediction_id,
          prediction_category,
          result_value,
          result_date,
          P.created_at AS prediction_created_at,
          I.*,
          (
            SELECT COUNT(*)
            FROM user_prediction U
            WHERE U.prediction_id = P.prediction_id
          ) AS participant_count,
          (
            SELECT prediction_value
            FROM user_prediction U
            WHERE U.user_id = ? AND U.prediction_id = P.prediction_id
          ) AS prediction_value,
          IF (
            TIMESTAMPDIFF(HOUR, P.created_at, NOW()) < 24,
            NULL,
            (
              SELECT JSON_ARRAYAGG(data)
              FROM (
                SELECT JSON_OBJECT('prediction_value', prediction_value, 'count', COUNT(*)) AS data
                FROM user_prediction
                WHERE prediction_id = ?
                GROUP BY prediction_value
              ) O
            )
          ) AS user_prediction_data
        FROM prediction P
        JOIN ?? I
        ON P.prediction_info_id = I.info_id
        WHERE prediction_id = ?;
    `,
      [userId, predictionId, category, predictionId]
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
      (Model.Prediction & {
        participant_count: number;
        prediction_value: string;
      })[]
    >(
      findUnsubmitted(
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
      findUnsubmitted(
        `
          SELECT *
          FROM (
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
            WHERE prediction_category = 'info_stock_fluctuation' AND prediction_id < ?
            UNION ALL
            SELECT 
              P.*,
              ISP.stock_name,
              ISP.last_price,
              ISP.last_date,
              ISP.short_code,
              ISP.market_category,
              ISP.vs,
              ISP.fluctuation_rate,
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
            JOIN info_stock_price ISP
            ON P.prediction_info_id = ISP.info_id
            WHERE prediction_category = 'info_stock_price' AND prediction_id < ?
          ) P
          ORDER BY created_at DESC
          LIMIT 10;
        `,
        unsubmitted
      ),
      [
        userId,
        predictionId || MAX_INT_VALUE,
        userId,
        predictionId || MAX_INT_VALUE
      ]
    );

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

  async findAllUserPredictions(userId: number, page: number) {
    const predictions = await DB.query<
      (Model.UserPrediction & Model.Prediction)[]
    >(
      `
        SELECT *
        FROM (
          SELECT
            U.user_id,
            U.prediction_id,
            U.created_at AS user_prediction_created_at,
            SUBSTRING(prediction_category, 6) AS category,
            prediction_value,
            prediction_result,
            result_date,
            ISF.*,
            score,
            coin
          FROM user_prediction U
          JOIN (
            SELECT *
            FROM prediction
            WHERE prediction_category = 'info_stock_fluctuation'
          ) P
          ON U.prediction_id = P.prediction_id
          JOIN info_stock_fluctuation ISF
          ON P.prediction_info_id = ISF.info_id
          LEFT JOIN user_stock_fluctuation USF
          ON U.user_id = USF.user_id AND ISF.info_id = USF.info_id
          UNION ALL
          SELECT
            U.user_id,
            U.prediction_id,
            U.created_at AS user_prediction_created_at,
            SUBSTRING(prediction_category, 6) AS category,
            prediction_value,
            prediction_result,
            result_date,
            ISP.*,
            score,
            coin
          FROM user_prediction U
          JOIN (
            SELECT *
            FROM prediction
            WHERE prediction_category = 'info_stock_price'
          ) P
          ON U.prediction_id = P.prediction_id
          JOIN info_stock_price ISP
          ON P.prediction_info_id = ISP.info_id
          LEFT JOIN user_stock_price USP
          ON U.user_id = USP.user_id AND ISP.info_id = USP.info_id
        ) A
        WHERE user_id = ?
        ORDER BY user_prediction_created_at DESC
        LIMIT ?, 20
      `,
      [userId, (page - 1) * 20]
    );

    return predictions;
  },

  async findUserPredictionByCategory(
    userId: number,
    page: number,
    category: string
  ) {
    const predictions = await DB.query<
      (Model.UserPrediction & Model.Prediction)[]
    >(
      `
        SELECT
          U.user_id,
          U.prediction_id,
          SUBSTRING(prediction_category, 6) AS category,
          prediction_value,
          prediction_result,
          result_date,
          I.*,
          score,
          coin
        FROM user_prediction U
        JOIN (
          SELECT *
          FROM prediction
          WHERE prediction_category = ?
        ) P
        ON U.prediction_id = P.prediction_id
        JOIN ?? I
        ON P.prediction_info_id = I.info_id
        LEFT JOIN ?? S
        ON U.user_id = S.user_id AND I.info_id = S.info_id
        WHERE U.user_id = ?
        ORDER BY U.created_at DESC
        LIMIT ?, 20
      `,
      [
        `info_${category}`,
        `info_${category}`,
        `user_${category}`,
        userId,
        (page - 1) * 20
      ]
    );

    return predictions;
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
  },

  async findPredictionsWithResult<T>(category: string) {
    const predictions = await DB.query<(Model.Prediction & T)[]>(
      `
        SELECT P.*, stock_name, last_date, last_price, code
        FROM prediction P
        JOIN ?? I
        ON P.prediction_info_id = I.info_id
        WHERE result_value IS NULL AND TIMESTAMPDIFF(HOUR, result_date, NOW()) >= 24
        LIMIT 10;
      `,
      [category]
    );

    return predictions;
  },

  async findPredictionTotalCount(userId: number, containAll?: boolean) {
    const count = await DB.query<Model.PredictionCount[]>(
      `
        SELECT
          COUNT(*) AS total_count,
          COUNT(
            CASE WHEN prediction_result = 1
            THEN 1
            END
          ) AS right_count
        FROM user_prediction
        WHERE user_id = ? ${
          containAll ? '' : 'AND prediction_result IS NOT NULL'
        };
      `,
      [userId]
    );

    return count?.[0] || null;
  },

  async findPredictionCount(
    userId: number,
    category: string,
    containAll?: boolean
  ) {
    const count = await DB.query<Model.PredictionCount[]>(
      `
        SELECT
          COUNT(*) AS total_count,
          COUNT(
            CASE WHEN prediction_result = 1
            THEN 1
            END
          ) AS right_count
        FROM user_prediction U
        JOIN prediction P
        ON U.prediction_id = P.prediction_id
        WHERE user_id = ? AND prediction_category = ? ${
          containAll ? '' : 'AND prediction_result IS NOT NULL'
        };
      `,
      [userId, category]
    );

    return count?.[0] || null;
  }
};

export default PredictionController;
