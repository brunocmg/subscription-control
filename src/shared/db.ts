import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '#app/generated/prisma/client.js';

// Shared by the API and the worker. DATABASE_URL validation arrives with the env item.
const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });

export const prisma = new PrismaClient({ adapter });
