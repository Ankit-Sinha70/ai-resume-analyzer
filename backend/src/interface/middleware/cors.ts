import cors from 'cors';
import { env } from '../../config';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map((url) => url.trim());

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
});
