import { Router } from 'express';
import { getUploadAuthHandler } from './upload.controller';
import { apiRateLimiter } from '@middleware/rateLimiter';

export const uploadRouter = Router();
uploadRouter.get('/auth', apiRateLimiter, getUploadAuthHandler);
