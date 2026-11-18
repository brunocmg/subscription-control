import Fastify, { type FastifyInstance } from 'fastify';

// Builds the app without listening on a port, so tests can use app.inject().
export function buildApp(): FastifyInstance {
  const app = Fastify();
  return app;
}
