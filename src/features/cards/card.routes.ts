import { Router } from 'express';
import { createCardHandler, getCardJsonHandler, getCardOgPageHandler } from './card.controller';
import { validateBody, validateParams } from '@middleware/validateRequest';
import { createCardSchema, cardIdParamSchema } from './card.validation';
import { createCardRateLimiter } from '@middleware/rateLimiter';

// JSON API, mounted at /api/cards
export const cardApiRouter = Router();
cardApiRouter.post('/', createCardRateLimiter, validateBody(createCardSchema), createCardHandler);
cardApiRouter.get('/:cardId', validateParams(cardIdParamSchema), getCardJsonHandler);

// Server-rendered share page, mounted at /card
export const cardPageRouter = Router();
cardPageRouter.get('/:cardId', validateParams(cardIdParamSchema), getCardOgPageHandler);
