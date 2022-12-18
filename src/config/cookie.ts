import type { CookieOptions } from 'express';

const DEFAULT: CookieOptions = {
  httpOnly: true,
  signed: true,
  secure: true,
  sameSite: 'none'
};

const cookieOption = {
  DEFAULT,
  REFRESH_TOKEN: {
    ...DEFAULT,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

export default cookieOption;
