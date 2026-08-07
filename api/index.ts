import { createApp } from '../src/app';

const app = createApp();

// Vercel serverless functions require the express app to be exported!
export default app;
