import { CustomError } from '@middlewares/handleError';
import jwt from 'jsonwebtoken';

const verifyToken =
  (...args: ConstructorParameters<typeof CustomError>) =>
  (token: string, secret: jwt.Secret, options: jwt.VerifyOptions) => {
    try {
      const payload = jwt.verify(token, secret, options);
      if (typeof payload === 'string' || 'payload' in payload) {
        throw new Error();
      }
      return payload;
    } catch {
      throw new CustomError(...args);
    }
  };

export const verifyTokenWithoutError = (
  token: string,
  secret: jwt.Secret,
  options: jwt.VerifyOptions
) => {
  try {
    const payload = jwt.verify(token, secret, options);
    if (typeof payload === 'string' || 'payload' in payload) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export default verifyToken;
