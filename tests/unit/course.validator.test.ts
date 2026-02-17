import express, { Request, Response } from 'express';
import request from 'supertest';
import { validate } from '../../src/middleware/validate.middleware';
import { createCourseRules, updateCourseRules, paginationRules } from '../../src/validators/course.validator';
import { errorMiddleware } from '../../src/middleware/error.middleware';

// Small test app to exercise validators
function buildApp(rules: Parameters<typeof validate>[0]) {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(rules), (_req: Request, res: Response) => res.status(200).json({ ok: true }));
  app.use(errorMiddleware);
  return app;
}

// ── createCourseRules ─────────────────────────────────────────────────────────
describe('createCourseRules', () => {
  const app = buildApp(createCourseRules);

  it('passes with valid body', async () => {
    const res = await request(app).post('/test').send({
      title: 'TypeScript 101', status: 'Published', is_premium: false,
    });
    expect(res.status).toBe(200);
  });

  it('fails when title is missing', async () => {
    const res = await request(app).post('/test').send({ status: 'Published', is_premium: false });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'title' })])
    );
  });

  it('fails when status is invalid', async () => {
    const res = await request(app).post('/test').send({
      title: 'Course', status: 'Draft', is_premium: false,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'status' })])
    );
  });

  it('fails when is_premium is not boolean', async () => {
    const res = await request(app).post('/test').send({
      title: 'Course', status: 'Pending', is_premium: 'yes',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'is_premium' })])
    );
  });

  it('fails when title exceeds 255 characters', async () => {
    const res = await request(app).post('/test').send({
      title: 'A'.repeat(256), status: 'Pending', is_premium: false,
    });
    expect(res.status).toBe(400);
  });

  it('passes with optional description', async () => {
    const res = await request(app).post('/test').send({
      title: 'Course', description: 'A description', status: 'Pending', is_premium: true,
    });
    expect(res.status).toBe(200);
  });
});

// ── updateCourseRules ─────────────────────────────────────────────────────────
describe('updateCourseRules', () => {
  const app = buildApp(updateCourseRules);

  it('passes with partial valid body', async () => {
    const res = await request(app).post('/test').send({ title: 'New Title' });
    expect(res.status).toBe(200);
  });

  it('passes with empty body (no fields)', async () => {
    const res = await request(app).post('/test').send({});
    expect(res.status).toBe(200); // Validator passes; service rejects empty update
  });

  it('fails when status is invalid', async () => {
    const res = await request(app).post('/test').send({ status: 'Archived' });
    expect(res.status).toBe(400);
  });
});

// ── paginationRules ───────────────────────────────────────────────────────────
describe('paginationRules', () => {
  const paginationApp = express();
  paginationApp.use(express.json());
  paginationApp.get('/test', validate(paginationRules), (_req, res) => res.json({ ok: true }));
  paginationApp.use(errorMiddleware);

  it('passes without query params', async () => {
    const res = await request(paginationApp).get('/test');
    expect(res.status).toBe(200);
  });

  it('fails when limit exceeds 100', async () => {
    const res = await request(paginationApp).get('/test?limit=200');
    expect(res.status).toBe(400);
  });

  it('fails when page is 0', async () => {
    const res = await request(paginationApp).get('/test?page=0');
    expect(res.status).toBe(400);
  });
});
