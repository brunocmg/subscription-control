import { describe, expect, it } from 'vitest';
import { buildApp } from '#app/api/app.js';

describe('buildApp', () => {
  it('responds 404 for an unknown route', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/does-not-exist',
    });

    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
