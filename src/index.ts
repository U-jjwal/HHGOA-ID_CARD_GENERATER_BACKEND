import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from '@config/env';
import { logger } from '@utils/logger';
import { apiRateLimiter } from '@middleware/rateLimiter';
import { notFoundHandler, errorHandler } from '@middleware/errorHandler';
import { cardApiRouter, cardPageRouter } from '@features/cards/card.routes';
import { uploadRouter } from '@features/upload/upload.routes';
import { healthRouter } from '@features/health.routes';
import { connectToDatabase } from './db/db';

export function createApp(): Express {
  const app = express();

  // Ensure DB connection for every request (Serverless safe)
  app.use(async (_req, _res, next) => {
    try {
      await connectToDatabase();
    } catch (error) {
      logger.error('Database connection error in middleware');
    }
    next();
  });

  app.set('trust proxy', 1);

  app.use(
    helmet({
      // Allow the OG page's inline redirect <script> to run.
      contentSecurityPolicy: env.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'https:', 'data:'],
            },
          }
        : false,
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser tools (curl, health checks) with no Origin header,
        // and any origin present in the allowlist.
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:5174',
          'https://hhgoa-id-card-generater-frontend-9xgxz420p.vercel.app'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

  app.use('/api', apiRateLimiter);
  app.use('/api/cards', cardApiRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/health', healthRouter);

  // Server-rendered share page - this is the URL that goes out in tweets.
  app.use('/card', cardPageRouter);

  app.get('/', (_req, res) => {
    res.send('working');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
