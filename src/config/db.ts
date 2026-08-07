import mongoose from 'mongoose';
import { env } from '@config/env';
import { logger } from '@utils/logger';



mongoose.set('strictQuery', true);

export async function connectToDatabase(): Promise<typeof mongoose> {
  // If already connected or connecting, reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    logger.info('MongoDB connected');
    return conn;
  } catch (error) {
    logger.error({ error }, 'MongoDB connection failed');
    throw error;
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
