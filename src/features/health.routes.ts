import { Router } from 'express';
import { pingDependencies } from '@features/cards/card.service';
import { asyncHandler } from '@utils/asyncHandler';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const deps = await pingDependencies();
    const healthy = deps.mongo && deps.redis;

    res.status(healthy ? 200 : 503).json({
      success: healthy,
      dependencies: deps,
      timestamp: new Date().toISOString(),
    });
  }),
);
