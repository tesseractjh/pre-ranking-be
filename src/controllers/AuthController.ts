import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const { JWT_SECRET } = process.env;

const AuthController = {
  createAccessToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'preRanking',
      algorithm: 'HS256'
    });
  },

  createRefreshToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'preRanking',
      algorithm: 'HS256'
    });
  }
};

export default AuthController;
