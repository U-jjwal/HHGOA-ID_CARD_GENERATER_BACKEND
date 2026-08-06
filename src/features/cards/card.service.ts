import { nanoid } from 'nanoid';
import { Card, ICard } from './card.model';
import { CreateCardInput } from './card.validation';
import { buildFramedImageUrl } from '@config/cloudinary';
import { safeRedisGet, safeRedisSet, redis } from '@config/redis';
import { env } from '@config/env';
import { AppError } from '@utils/AppError';
import { logger } from '@utils/logger';

const CARD_ID_LENGTH = 10;
const CACHE_KEY_PREFIX = 'card:';

interface CardSummary {
  cardId: string;
  format: ICard['format'];
  imageUrl: string;
  name?: string;
  teamName?: string;
  role?: string;
  builderTitle?: string;
  createdAt: string;
}

function toSummary(card: ICard): CardSummary {
  return {
    cardId: card.cardId,
    format: card.format,
    imageUrl: card.imageUrl,
    name: card.name,
    teamName: card.teamName,
    role: card.role,
    builderTitle: card.builderTitle,
    createdAt: card.createdAt.toISOString(),
  };
}

export async function createCard(input: CreateCardInput): Promise<CardSummary> {
  // Retry on the astronomically unlikely nanoid collision rather than trusting
  // uniqueness blindly - the unique index on cardId is the real backstop.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const cardId = nanoid(CARD_ID_LENGTH);
    const imageUrl = buildFramedImageUrl(input.cloudinaryPublicId);

    try {
      const card = await Card.create({
        cardId,
        format: input.format,
        imageUrl,
        cloudinaryPublicId: input.cloudinaryPublicId,
        name: input.name,
        teamName: input.teamName,
        role: input.role,
        builderTitle: input.builderTitle,
      });

      const summary = toSummary(card);
      await safeRedisSet(`${CACHE_KEY_PREFIX}${cardId}`, JSON.stringify(summary), env.CARD_CACHE_TTL_SECONDS);
      return summary;
    } catch (error) {
      const isDuplicateKey =
        typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
      if (!isDuplicateKey) throw error;
      logger.warn({ cardId, attempt }, 'cardId collision, retrying');
    }
  }

  throw AppError.internal('Could not generate a unique card id, please try again');
}

export async function getCardById(cardId: string): Promise<CardSummary> {
  const cacheKey = `${CACHE_KEY_PREFIX}${cardId}`;
  const cached = await safeRedisGet(cacheKey);

  if (cached) {
    // Fire-and-forget view count increment - never let analytics block the read path.
    incrementViewCount(cardId).catch((error) => logger.warn({ error, cardId }, 'view count increment failed'));
    return JSON.parse(cached) as CardSummary;
  }

  const card = await Card.findOne({ cardId });
  if (!card) {
    throw AppError.notFound('This card does not exist or may have expired');
  }

  const summary = toSummary(card);
  await safeRedisSet(cacheKey, JSON.stringify(summary), env.CARD_CACHE_TTL_SECONDS);
  incrementViewCount(cardId).catch((error) => logger.warn({ error, cardId }, 'view count increment failed'));

  return summary;
}

async function incrementViewCount(cardId: string): Promise<void> {
  await Card.updateOne({ cardId }, { $inc: { viewCount: 1 } });
}

/** Simple liveness check used by the health route. */
export async function pingDependencies(): Promise<{ mongo: boolean; redis: boolean }> {
  const mongoOk = await Card.db.db?.admin().ping().then(() => true).catch(() => false) ?? false;
  const redisOk = await redis.ping().then((res) => res === 'PONG').catch(() => false);
  return { mongo: mongoOk, redis: redisOk };
}
