import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './src/config/database';

const PORT = process.env['PORT'] || 3000;

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
