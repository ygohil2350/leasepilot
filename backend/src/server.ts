import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
const start = async () => {
  await connectDatabase();
  app.listen(env.PORT, () => console.log(`LeasePilot API listening on ${env.PORT}`));
};
start().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
