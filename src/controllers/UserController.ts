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

  async findUserNameAndCoinById(userId: number) {
    const user = await DB.query<Model.User[]>(
      `
        SELECT user_name, coin
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
  }
};

export default UserController;
