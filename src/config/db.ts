import mongoose from 'mongoose';
import { env } from '@config/env';
import { logger } from '@utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

mongoose.set('strictQuery', true);

export async function connectToDatabase(retryCount = 0): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 20,
    });
    logger.info('MongoDB connected');
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      logger.error({ error }, 'MongoDB connection failed after max retries, exiting');
      process.exit(1);
    }
    logger.warn(
      { attempt: retryCount + 1, maxRetries: MAX_RETRIES },
      `MongoDB connection failed, retrying in ${RETRY_DELAY_MS}ms`,
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectToDatabase(retryCount + 1);
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error({ error }, 'MongoDB connection error');
});

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}
