import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import { CustomError } from './handleError';

dotenv.config();
const { DOMAIN } = process.env;

const validateReferer: RequestHandler = async (req, res, next) => {
  const {
    originalUrl,
    headers: { referer }
  } = req;
  if (
    !originalUrl.startsWith('/auth') &&
    (typeof referer !== 'string' || !referer.startsWith(DOMAIN))
  ) {
    throw new CustomError(400, '잘못된 Referer');
  } else {
    next();
  }
};

export default validateReferer;
