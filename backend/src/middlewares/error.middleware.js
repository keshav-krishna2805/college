import ApiError from '../utils/ApiError.js';
import { config } from '../config/env.config.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? error.statusCode : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }
  const response = {
    success: false,
    message: error.message,
    data: null,
    error: {
      code: error.statusCode,
      details: error.errors,
      ...(config.env === 'development' && { stack: error.stack }),
    },
  };

  res.status(error.statusCode).json(response);
};