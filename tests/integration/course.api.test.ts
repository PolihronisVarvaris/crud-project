/**
 * Integration tests — require a running PostgreSQL test database.
 * Set NODE_ENV=test and TEST_DB_NAME in your .env
 *
 * Run: npm run test:integration
 */
import request from 'supertest';
import app     from '../../app';
import { pool } from '../../src/config/database';
import fs       from 'fs';
import path     from 'path';

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  process.env['NODE_ENV'] = 'test';
  // Apply migration
  const sql = fs.readFileSync(
    path.join(__dirname, '../../database/migrations/001_create_courses_table.sql'),
    'utf-8'
  );
  await pool.query(sql);
});

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS courses CASCADE');
  await pool.query('DROP TYPE IF EXISTS course_status CASCADE');
  await pool.end();
});

beforeEach(async () => {
  await pool.query('DELETE FROM courses');
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const validPayload = {
  title:       'TypeScript Basics',
  description: 'Learn TypeScript',
  status:      'Pending',
  is_premium:  false,
};

async function createCourse(overrides = {}) {
  return request(app)
    .post('/api/v1/courses')
    .send({ ...validPayload, ...overrides });
}

// ── POST /courses ─────────────────────────────────────────────────────────────
describe('POST /api/v1/courses', () => {
  it('creates a course and returns 201', async () => {
    const res = await createCourse();
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('TypeScript Basics');
    expect(res.body.status).toBe('Pending');
    expect(res.body).not.toHaveProperty('deleted_at');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/v1/courses').send({ status: 'Pending', is_premium: false });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid status', async () => {
    const res = await createCourse({ status: 'Draft' });
    expect(res.status).toBe(400);
  });
});

// ── GET /courses ──────────────────────────────────────────────────────────────
describe('GET /api/v1/courses', () => {
  it('returns empty list when no courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns paginated courses', async () => {
    await createCourse({ title: 'Course A' });
    await createCourse({ title: 'Course B' });

    const res = await request(app).get('/api/v1/courses?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 2 });
  });

  it('returns 400 for invalid pagination params', async () => {
    const res = await request(app).get('/api/v1/courses?limit=500');
    expect(res.status).toBe(400);
  });
});

// ── GET /courses/:id ──────────────────────────────────────────────────────────
describe('GET /api/v1/courses/:id', () => {
  it('returns a course by ID', async () => {
    const created = await createCourse();
    const id      = created.body.id;

    const res = await request(app).get(`/api/v1/courses/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('returns 404 for unknown ID', async () => {
    const res = await request(app).get('/api/v1/courses/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ── PUT /courses/:id ──────────────────────────────────────────────────────────
describe('PUT /api/v1/courses/:id', () => {
  it('updates a course', async () => {
    const created = await createCourse();
    const id      = created.body.id;

    const res = await request(app).put(`/api/v1/courses/${id}`).send({ title: 'Updated', status: 'Published' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.status).toBe('Published');
  });

  it('returns 404 for unknown ID', async () => {
    const res = await request(app).put('/api/v1/courses/00000000-0000-0000-0000-000000000000').send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  it('returns 422 when no fields provided', async () => {
    const created = await createCourse();
    const res     = await request(app).put(`/api/v1/courses/${created.body.id}`).send({});
    expect(res.status).toBe(422);
  });
});

// ── DELETE /courses/:id ───────────────────────────────────────────────────────
describe('DELETE /api/v1/courses/:id', () => {
  it('soft-deletes a course and returns 204', async () => {
    const created = await createCourse();
    const id      = created.body.id;

    const deleteRes = await request(app).delete(`/api/v1/courses/${id}`);
    expect(deleteRes.status).toBe(204);
  });

  it('returns 404 after course is deleted', async () => {
    const created = await createCourse();
    const id      = created.body.id;

    await request(app).delete(`/api/v1/courses/${id}`);
    const getRes = await request(app).get(`/api/v1/courses/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 when trying to delete already-deleted course', async () => {
    const created = await createCourse();
    const id      = created.body.id;

    await request(app).delete(`/api/v1/courses/${id}`);
    const secondDelete = await request(app).delete(`/api/v1/courses/${id}`);
    expect(secondDelete.status).toBe(404);
  });

  it('returns 404 for unknown ID', async () => {
    const res = await request(app).delete('/api/v1/courses/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});
