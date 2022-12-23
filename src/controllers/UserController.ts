import DB from '@config/database';

const UserController = {
  async findById(userId: number) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT *
        FROM user
        WHERE user_id = ?;
      `,
      [userId]
    );
    return user?.[0] || null;
  },

  async findUserInfoById(userId: number) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT user_name, coin, exp
        FROM user
        WHERE user_id = ?;
      `,
      [userId]
    );
    return user?.[0] || null;
  },

  async findByUserName(userName: string) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT *
        FROM user
        WHERE user_name = ?;
      `,
      [userName]
    );
    return user?.[0] || null;
  },

  async findByAuthInfo(id: number, provider: string) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT *
        FROM user
        WHERE auth_id = ? AND auth_provider = ?;
      `,
      [id, provider]
    );
    return user?.[0] || null;
  },

  async findBySigninToken(token: string) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT *
        FROM user
        WHERE signin_token = ?;
      `,
      [token]
    );
    return user?.[0] || null;
  },

  async findByEmail(email: string) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT *
        FROM user
        WHERE email = ?;
      `,
      [email]
    );
    return user?.[0] || null;
  },

  async findByOAuth(authId: string, authProvider: string) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT *
        FROM user
        WHERE auth_id = ? AND auth_provider = ?;
      `,
      [authId, authProvider]
    );
    return user?.[0] || null;
  },

  async create(authId: string, authProvider: string) {
    const result = await DB.query(
      `
        INSERT INTO user (auth_id, auth_provider, created_at)
        VALUES (?, ?, NOW());
      `,
      [authId, authProvider]
    );

    return result?.insertId;
  },

  async updateById(userId: number, column: Partial<Model.User>) {
    const columnEntries = Object.entries(column).filter(
      ([, value]) => value !== undefined && value !== null
    );

    await DB.query(
      `
        UPDATE user
        SET ${Array(columnEntries.length).fill('?? = ?').join(', ')}
        WHERE user_id = ?;
      `,
      [...columnEntries.flat(), userId]
    );
  },

  async findUserCount() {
    const user = await DB.query<{ total_count: number }[]>(`
      SELECT COUNT(*) AS total_count
      FROM user;
    `);
    return user?.[0].total_count;
  }
};

export default UserController;
