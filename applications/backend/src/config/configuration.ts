import 'dotenv/config';

export const CONFIG = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 15 * 60 * 1000, // 15 минут
  refreshTokenSecret: process.env.REFRESH_SECRET,
  refreshTokenExpiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 30 * 24 * 60 * 60 * 1000, // 30 дней
};
