import 'dotenv/config';
import { buildApp } from '#app/api/app.js';

const app = buildApp();
const port = Number(process.env['PORT'] ?? 3000);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
