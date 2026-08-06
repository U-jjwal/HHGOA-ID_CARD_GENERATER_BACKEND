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

export function createApp(): Express {
  const app = express();

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
        if (!origin || env.corsOrigins.includes(origin)) {
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

  app.get('/', (req, res) => {
    res.send('working');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
