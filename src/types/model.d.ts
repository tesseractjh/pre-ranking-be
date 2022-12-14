declare namespace Model {
  interface User {
    user_id: number;
    auth_id: string;
    auth_provider: string;
    email: string;
    user_name: string;
    exp: number;
    coin: number;
    refresh_token: string;
    created_time: Date;
  }

  interface Notification {
    notification_id: number;
    user_id: number;
    notification_title: string;
    notification_text: string;
    notification_link: string;
    created_at: Date;
  }

  interface Prediction {
    prediction_id: number;
    prediction_category: string;
    prediction_info_id: number;
    result_value: string;
    result_date: Date;
    created_at: Date;
  }

  interface UserPrediction {
    user_id: number;
    prediction_id: number;
    prediction_value: string;
    prediction_result: number;
    created_at: Date;
  }

  interface StockFluctuation {
    info_id: number;
    stock_name: string;
    last_price: number;
    last_date: string;
    code: string;
    short_code: string;
    market_category: string;
    vs: number;
    fluctuation_rate: number;
    created_at: Date;
  }
}
