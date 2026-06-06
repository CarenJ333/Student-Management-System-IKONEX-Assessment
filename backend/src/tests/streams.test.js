// src/tests/streams.test.js
const request = require('supertest');
const app     = require('../server');
const { pool, clearTestData } = require('./setup');

beforeAll(async () => { await clearTestData(); });
afterAll(async () => { await clearTestData(); });

describe('Class Streams API', () => {

  describe('GET /api/streams', () => {
    test('Should return an array of streams', async () => {
      const res = await request(app).get('/api/streams');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/streams', () => {
    test('Should create a new stream successfully', async () => {
      const res = await request(app)
        .post('/api/streams')
        .send({ name: 'TEST-Stream-1A', form_level: 1, academic_year: '2024/2025' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('TEST-Stream-1A');
      expect(res.body.id).toBeDefined();
    });

    test('Should fail when name is missing', async () => {
      const res = await request(app)
        .post('/api/streams')
        .send({ form_level: 1, academic_year: '2024/2025' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('Should fail when form_level is missing', async () => {
      const res = await request(app)
        .post('/api/streams')
        .send({ name: 'TEST-Stream-1B', academic_year: '2024/2025' });
      expect(res.status).toBe(400);
    });

    test('Should fail on duplicate stream name', async () => {
      const res = await request(app)
        .post('/api/streams')
        .send({ name: 'TEST-Stream-1A', form_level: 1, academic_year: '2024/2025' });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });
  });

  describe('GET /api/streams/:id', () => {
    let streamId;
    beforeAll(async () => {
      const [rows] = await pool.query("SELECT id FROM class_streams WHERE name = 'TEST-Stream-1A' LIMIT 1");
      streamId = rows[0]?.id;
    });

    test('Should return a single stream by id', async () => {
      const res = await request(app).get(`/api/streams/${streamId}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('TEST-Stream-1A');
    });

    test('Should return 404 for non-existent stream', async () => {
      const res = await request(app).get('/api/streams/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/streams/:id', () => {
    let streamId;
    beforeAll(async () => {
      const [rows] = await pool.query("SELECT id FROM class_streams WHERE name = 'TEST-Stream-1A' LIMIT 1");
      streamId = rows[0]?.id;
    });

    test('Should update a stream successfully', async () => {
      const res = await request(app)
        .put(`/api/streams/${streamId}`)
        .send({ name: 'TEST-Stream-1A', form_level: 2, academic_year: '2024/2025' });
      expect(res.status).toBe(200);
      expect(res.body.form_level).toBe(2);
    });
  });

  describe('DELETE /api/streams/:id', () => {
    test('Should delete a stream with no students', async () => {
      const create = await request(app)
        .post('/api/streams')
        .send({ name: 'TEST-Stream-DELETE', form_level: 1, academic_year: '2024/2025' });
      const id = create.body.id;
      const res = await request(app).delete(`/api/streams/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});
