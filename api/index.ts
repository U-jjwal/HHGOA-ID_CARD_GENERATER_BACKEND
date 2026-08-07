import { createApp } from '../src/app';
import { connectToDatabase } from '../src/config/db';

const app = createApp();

let isDbConnected = false;

// Ensure database is connected before handling the request
app.use(async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectToDatabase();
      isDbConnected = true;
    } catch (error) {
      console.error('Vercel DB connection error:', error);
    }
  }
  next();
});

// Vercel serverless functions require the express app to be exported!
export default app;
