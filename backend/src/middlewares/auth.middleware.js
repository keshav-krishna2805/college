import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { config } from '../config/env.config.js';
import { ROLES } from '../constants/index.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Unauthorized request. Token missing.');
    }

    const decodedToken = jwt.verify(token, config.jwtSecret);

    req.user = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || 'Invalid Access Token');
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden. You do not have permission to access this resource.');
    }
    next();
  };
};

export const isStudent = authorizeRoles(ROLES.STUDENT);
export const isOrganizer = authorizeRoles(ROLES.ORGANIZER);
export const isAdmin = authorizeRoles(ROLES.ADMIN);
