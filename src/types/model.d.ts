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
}
