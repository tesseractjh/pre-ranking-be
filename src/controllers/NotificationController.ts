import DB from '@config/database';

const NotificationController = {
  async getNotification(userId: number, start: number) {
    const notifications = await DB.query<Model.Notification[]>(
      `
        SELECT *
        FROM notification
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?, 10;
      `,
      [userId, Number.isNaN(start) ? 0 : start]
    );
    return notifications;
  },

  async deleteNotification(userId: number, notificationId: number) {
    await DB.query(
      `
        DELETE FROM notification
        WHERE user_id = ? AND notification_id = ?;
      `,
      [userId, notificationId]
    );
  },

  async deleteAllNotifications(userId: number) {
    await DB.query(
      `
        DELETE FROM notification
        WHERE user_id = ?;
      `,
      [userId]
    );
  }
};

export default NotificationController;
