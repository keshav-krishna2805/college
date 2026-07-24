import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export const generateAccessAndRefreshTokens = (userId, role) => {
  const payload = { _id: userId, role };
  
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  
  return { accessToken, refreshToken };
};
