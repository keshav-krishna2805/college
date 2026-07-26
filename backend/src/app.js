import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import authRoutes from './routes/auth.routes.js';
import clubRoutes from './routes/club.routes.js';
import eventRoutes from './routes/event.routes.js';



const app = express();



app.use(helmet());

app.use(cors({ 
  origin: '*', 
  credentials: true 
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', globalLimiter);


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clubs', clubRoutes);
app.use('/api/v1/events', eventRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
    data: null,
    error: 'Not Found'
  });
});

app.use(errorHandler);

export default app;
