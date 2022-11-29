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

  async deleteNotification(notificationId: number) {
    await DB.query(
      `
        DELETE FROM notification
        WHERE notification_id = ?;
      `,
      [notificationId]
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
