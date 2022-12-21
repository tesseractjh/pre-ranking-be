declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PORT: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    GOOGLE_AUTH_ID: string;
    GOOGLE_AUTH_SECRET: string;
    GOOGLE_AUTH_CALLBACK: string;
    KAKAO_AUTH_ID: string;
    KAKAO_AUTH_SECRET: string;
    KAKAO_AUTH_CALLBACK: string;
    JWT_SECRET: string;
    DOMAIN: string;
    STOCK_API_URL: string;
    STOCK_API_SECRET: string;
  }
}
