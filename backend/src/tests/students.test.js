// src/tests/students.test.js
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

describe('Students API', () => {

  describe('GET /api/students', () => {
    test('Should return an array of students', async () => {
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/students', () => {
    test('Should register a new student successfully', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({
          student_number: 'TEST001',
          first_name: 'John',
          last_name: 'Doe',
          stream_id: streamId,
          gender: 'Male',
        });
      expect(res.status).toBe(201);
      expect(res.body.student_number).toBe('TEST001');
      expect(res.body.first_name).toBe('John');
      expect(res.body.stream_name).toBeDefined();
    });

    test('Should fail when student_number is missing', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ first_name: 'Jane', last_name: 'Doe', stream_id: streamId });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('Should fail when first_name is missing', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ student_number: 'TEST002', last_name: 'Doe', stream_id: streamId });
      expect(res.status).toBe(400);
    });

    test('Should fail when stream_id is missing', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ student_number: 'TEST003', first_name: 'Jane', last_name: 'Doe' });
      expect(res.status).toBe(400);
    });

    test('Should fail on duplicate student number', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ student_number: 'TEST001', first_name: 'Another', last_name: 'Student', stream_id: streamId });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });
  });

  describe('GET /api/students/:id', () => {
    let studentId;
    beforeAll(async () => {
      const [rows] = await pool.query("SELECT id FROM students WHERE student_number = 'TEST001' LIMIT 1");
      studentId = rows[0]?.id;
    });

    test('Should return a single student by id', async () => {
      const res = await request(app).get(`/api/students/${studentId}`);
      expect(res.status).toBe(200);
      expect(res.body.student_number).toBe('TEST001');
      expect(res.body.stream_name).toBeDefined();
    });

    test('Should return 404 for non-existent student', async () => {
      const res = await request(app).get('/api/students/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/students/:id', () => {
    let studentId;
    beforeAll(async () => {
      const [rows] = await pool.query("SELECT id FROM students WHERE student_number = 'TEST001' LIMIT 1");
      studentId = rows[0]?.id;
    });

    test('Should update student information', async () => {
      const res = await request(app)
        .put(`/api/students/${studentId}`)
        .send({
          student_number: 'TEST001',
          first_name: 'John',
          last_name: 'Updated',
          stream_id: streamId,
          status: 'Active',
        });
      expect(res.status).toBe(200);
      expect(res.body.last_name).toBe('Updated');
    });

    test('Should update student stream', async () => {
      const res = await request(app)
        .put(`/api/students/${studentId}`)
        .send({
          student_number: 'TEST001',
          first_name: 'John',
          last_name: 'Updated',
          stream_id: streamId,
          status: 'Inactive',
        });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Inactive');
    });
  });

  describe('DELETE /api/students/:id', () => {
    test('Should delete a student', async () => {
      const create = await request(app)
        .post('/api/students')
        .send({ student_number: 'TEST_DELETE', first_name: 'Delete', last_name: 'Me', stream_id: streamId });
      const id = create.body.id;
      const res = await request(app).delete(`/api/students/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});
