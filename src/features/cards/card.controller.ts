import { Request, Response } from 'express';
import { createCard, getCardById } from './card.service';
import { CreateCardInput } from './card.validation';
import { renderOgPage } from '@utils/ogTemplate';
import { env } from '@config/env';
import { asyncHandler } from '@utils/asyncHandler';

export const createCardHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateCardInput;
  const card = await createCard(input);

  res.status(201).json({
    success: true,
    data: {
      ...card,
      shareUrl: `${env.BASE_URL}/card/${card.cardId}`,
    },
  });
});

export const getCardJsonHandler = asyncHandler(async (req: Request, res: Response) => {
  const { cardId } = req.params as { cardId: string };
  const card = await getCardById(cardId);

  res.status(200).json({
    success: true,
    data: {
      ...card,
      shareUrl: `${env.BASE_URL}/card/${card.cardId}`,
    },
  });
});

/**
 * Server-rendered page for /card/:cardId - this is the URL that gets shared
 * on X. See renderOgPage for why this can't just be the SPA route.
 */
export const getCardOgPageHandler = asyncHandler(async (req: Request, res: Response) => {
  const { cardId } = req.params as { cardId: string };
  const card = await getCardById(cardId);

  const title =
    card.format === 'builder-id' && card.name
      ? `${card.name}'s HH Goa 2026 Builder ID`
      : 'My HH Goa 2026 frame';

  const html = renderOgPage({
    title,
    description: 'Generated with the HH Goa 2026 Frame / ID Card Generator. #FrameInGoa',
    imageUrl: card.imageUrl,
    pageUrl: `${env.BASE_URL}/card/${card.cardId}`,
    redirectUrl: `${env.FRONTEND_URL}/card/${card.cardId}`,
  });

  res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(html);
});
