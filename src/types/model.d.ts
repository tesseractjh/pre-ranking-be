declare namespace Model {
  interface User {
    user_id: number;
    auth_id: string;
    auth_provider: string;
    email: string;
    user_name: string;
    refresh_token: string;
    created_time: Date;
  }

  interface Notification {
    notification_id: number;
    user_id: number;
    predict_id: number;
    notification_text: string;
    notification_link: string;
    created_at: Date;
  }
}
