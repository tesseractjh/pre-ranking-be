import DB from '@config/database';
import UserController from './UserController';

const RankController = {
  async findTotalScoreRank(userId: number) {
    const rank = await DB.query<Model.UserRank[]>(
      `
        SELECT
          *,
          (
            SELECT COUNT(*)
            FROM user
          ) AS total_count
        FROM (
          SELECT
            user_id,
            SUM(score) AS score,
            RANK() OVER (ORDER BY SUM(score) DESC) AS ranking
          FROM (
            SELECT *
            FROM user_stock_fluctuation
            UNION ALL
            SELECT *
            FROM user_stock_price
          ) S
          GROUP BY user_id
        ) R
        WHERE user_id = ?;
      `,
      [userId]
    );

    if (rank?.[0]) {
      return rank[0];
    }

    const totalCount = await UserController.findUserCount();

    return {
      user_id: userId,
      score: 0,
      ranking: totalCount,
      total_count: totalCount
    };
  },

  async findScoreRank(userId: number, category: string) {
    const rank = await DB.query<Model.UserRank[]>(
      `
        SELECT
        *,
        (
          SELECT COUNT(DISTINCT user_id)
          FROM ??
        ) AS total_count
        FROM (
          SELECT
            user_id,
            SUM(score) AS score,
            RANK() OVER (ORDER BY SUM(score) DESC) AS ranking
          FROM ??
          GROUP BY user_id
        ) R
        WHERE user_id = ?;
      `,
      [category, category, userId]
    );

    if (rank?.[0]) {
      return rank[0];
    }

    const result = await DB.query<Model.UserRank[]>(
      `
        SELECT COUNT(DISTINCT user_id) AS total_count
        FROM ??;
      `,
      [category]
    );

    const totalCount = result?.[0].total_count ?? 0;

    return {
      user_id: userId,
      score: 0,
      ranking: totalCount,
      total_count: totalCount
    };
  },

  async findAllTotalScoreRanks(page: number) {
    const ranks = await DB.query<Model.Rank[]>(
      `
        SELECT
          user_name,
          CAST(SUM(score) AS SIGNED) AS score,
          COUNT(*) AS total_count,
          right_count,
          RANK() OVER (ORDER BY SUM(score) DESC) AS ranking
        FROM (
          SELECT *
          FROM user_stock_fluctuation
          UNION ALL
          SELECT *
          FROM user_stock_price
        ) S
        JOIN (
          SELECT
            U.*,
            COUNT(CASE WHEN prediction_result = 1 THEN 1 END) AS right_count
          FROM user U
          JOIN user_prediction P
          ON U.user_id = P.user_id
          GROUP BY U.user_id
        ) U
        ON S.user_id = U.user_id
        GROUP BY S.user_id
        LIMIT ?, 20;
      `,
      [(page - 1) * 20]
    );

    return ranks;
  },

  async findAllScoreRanks(category: string, page: number) {
    const ranks = await DB.query<Model.Rank[]>(
      `
        SELECT
          user_name,
          score,
          total_count,
          right_count,
          ranking
        FROM (
          SELECT
            user_id,
            CAST(SUM(score) AS SIGNED) AS score,
            COUNT(*) AS total_count,
            RANK() OVER (ORDER BY SUM(score) DESC) AS ranking
          FROM ??
          GROUP BY user_id
        ) R
        JOIN (
          SELECT
            U.*,
            COUNT(CASE WHEN prediction_result = 1 THEN 1 END) AS right_count
          FROM user U
          JOIN user_prediction UP
          ON U.user_id = UP.user_id
          JOIN prediction P
          ON UP.prediction_id = P.prediction_id
          WHERE P.prediction_category = ?
          GROUP BY U.user_id
        ) U
        ON R.user_id = U.user_id
        ORDER BY ranking
        LIMIT ?, 20;
      `,
      [`user_${category}`, `info_${category}`, (page - 1) * 20]
    );
    return ranks;
  }
};

export default RankController;
