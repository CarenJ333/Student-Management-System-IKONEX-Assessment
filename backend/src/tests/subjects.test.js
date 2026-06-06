// src/tests/subjects.test.js
const request = require('supertest');
const app     = require('../server');
const { pool, clearTestData, createTestStream } = require('./setup');

let streamId;

beforeAll(async () => {
  await clearTestData();
  streamId = await createTestStream();
});
afterAll(async () => {
  await clearTestData();
});

describe('Subjects API', () => {

  describe('GET /api/subjects', () => {
    test('Should return an array of subjects', async () => {
      const res = await request(app).get('/api/subjects');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/subjects', () => {
    test('Should create a new subject', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .send({ name: 'TEST Subject', code: 'TEST101', description: 'Test subject' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('TEST Subject');
      expect(res.body.code).toBe('TEST101');
    });

    test('Should fail when name is missing', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .send({ code: 'TEST102' });
      expect(res.status).toBe(400);
    });

    test('Should fail when code is missing', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .send({ name: 'Another Subject' });
      expect(res.status).toBe(400);
    });

    test('Should fail on duplicate subject code', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .send({ name: 'Different Name', code: 'TEST101' });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });
  });

  describe('PUT /api/subjects/:id', () => {
    let subjectId;
    beforeAll(async () => {
      const [rows] = await pool.query("SELECT id FROM subjects WHERE code = 'TEST101' LIMIT 1");
      subjectId = rows[0]?.id;
    });

    test('Should update a subject', async () => {
      const res = await request(app)
        .put(`/api/subjects/${subjectId}`)
        .send({ name: 'TEST Subject Updated', code: 'TEST101', description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('TEST Subject Updated');
    });
  });

  describe('Assign subjects to streams', () => {
    let subjectId;
    beforeAll(async () => {
      const [rows] = await pool.query("SELECT id FROM subjects WHERE code = 'TEST101' LIMIT 1");
      subjectId = rows[0]?.id;
    });

    test('Should assign a subject to a stream', async () => {
      const res = await request(app)
        .post('/api/subjects/assign')
        .send({ stream_id: streamId, subject_id: subjectId });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('assigned');
    });

    test('Should get subjects for a stream', async () => {
      const res = await request(app).get(`/api/streams/${streamId}/subjects`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const codes = res.body.map(s => s.code);
      expect(codes).toContain('TEST101');
    });

    test('Should remove a subject from a stream', async () => {
      const res = await request(app)
        .delete(`/api/subjects/assign/${streamId}/${subjectId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removed');
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    test('Should delete a subject', async () => {
      const create = await request(app)
        .post('/api/subjects')
        .send({ name: 'TEST Delete Subject', code: 'TEST_DEL' });
      const id = create.body.id;
      const res = await request(app).delete(`/api/subjects/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});
