import DB from '@config/database';

const RankController = {
  async findTotalScoreRank(userId: number) {
    const rank = await DB.query<Model.Rank[]>(
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

    const result = await DB.query<Model.Rank[]>(
      `
        SELECT COUNT(*) AS total_count
        FROM user;
      `
    );

    const totalCount = result?.[0].total_count ?? 0;

    return {
      user_id: userId,
      score: 0,
      ranking: totalCount,
      total_count: totalCount
    };
  },

  async findScoreRank(userId: number, category: string) {
    const rank = await DB.query<Model.Rank[]>(
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

    const result = await DB.query<Model.Rank[]>(
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
  }
};

export default RankController;
