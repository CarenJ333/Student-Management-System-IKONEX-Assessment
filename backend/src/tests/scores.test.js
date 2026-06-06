// src/tests/scores.test.js
const request = require('supertest');
const app     = require('../server');
const {
  pool, clearTestData,
  createTestStream, createTestStudent,
  createTestSubject, createTestAssessment
} = require('./setup');

let streamId, studentId, subjectId, assessmentId, student2Id, caAssessmentId;

beforeAll(async () => {
  await clearTestData();
  streamId     = await createTestStream();
  studentId    = await createTestStudent(streamId, '001');
  student2Id   = await createTestStudent(streamId, '002');
  subjectId    = await createTestSubject();
  assessmentId = await createTestAssessment(streamId, subjectId, 'Exam');
  caAssessmentId = await createTestAssessment(streamId, subjectId, 'CA');
});

afterAll(async () => {
  await clearTestData();
});

describe('Scores API', () => {

  describe('POST /api/scores — Submit score', () => {
    test('Should submit a valid score', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: studentId, assessment_id: assessmentId, score: 75 });
      expect(res.status).toBe(201);
      expect(res.body.score).toBe('75.00');
    });

    test('Should reject a negative score', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: student2Id, assessment_id: assessmentId, score: -5 });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('negative');
    });

    test('Should reject a score exceeding maximum', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: student2Id, assessment_id: assessmentId, score: 150 });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('maximum');
    });

    test('Should reject missing student_id', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ assessment_id: assessmentId, score: 80 });
      expect(res.status).toBe(400);
    });

    test('Should reject missing score', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: studentId, assessment_id: assessmentId });
      expect(res.status).toBe(400);
    });

    test('Should accept score of 0 as valid', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: student2Id, assessment_id: caAssessmentId, score: 0 });
      expect(res.status).toBe(201);
    });

    test('Should accept decimal scores', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: student2Id, assessment_id: assessmentId, score: 85.5 });
      expect(res.status).toBe(201);
      expect(parseFloat(res.body.score)).toBe(85.5);
    });
  });

  describe('DUPLICATE PREVENTION — Critical requirement', () => {
    test('Should reject duplicate score submission for same student + assessment', async () => {
      // studentId already has a score for assessmentId from above
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: studentId, assessment_id: assessmentId, score: 90 });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    test('Should allow same student to have scores for different assessments', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ student_id: studentId, assessment_id: caAssessmentId, score: 25 });
      expect(res.status).toBe(201);
    });

    test('Should allow different students to have scores for same assessment', async () => {
      // student2Id submitting for assessmentId — already done above (85.5)
      // Just verify it exists
      const res = await request(app)
        .get('/api/scores')
        .query({ assessment_id: assessmentId });
      expect(res.status).toBe(200);
      const studentIds = res.body.map(s => s.student_id);
      expect(studentIds).toContain(studentId);
      expect(studentIds).toContain(student2Id);
    });
  });

  describe('PUT /api/scores/:id — Update score', () => {
    let scoreId;
    beforeAll(async () => {
      const [rows] = await pool.query(
        'SELECT id FROM scores WHERE student_id = ? AND assessment_id = ?',
        [studentId, assessmentId]
      );
      scoreId = rows[0]?.id;
    });

    test('Should update an existing score', async () => {
      const res = await request(app)
        .put(`/api/scores/${scoreId}`)
        .send({ score: 88 });
      expect(res.status).toBe(200);
      expect(parseFloat(res.body.score)).toBe(88);
    });

    test('Should reject updating score above maximum', async () => {
      const res = await request(app)
        .put(`/api/scores/${scoreId}`)
        .send({ score: 200 });
      expect(res.status).toBe(400);
    });

    test('Should reject updating score to negative', async () => {
      const res = await request(app)
        .put(`/api/scores/${scoreId}`)
        .send({ score: -10 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/scores', () => {
    test('Should return scores filtered by assessment_id', async () => {
      const res = await request(app)
        .get('/api/scores')
        .query({ assessment_id: assessmentId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      res.body.forEach(s => {
        expect(s.assessment_id).toBe(assessmentId);
      });
    });

    test('Should return scores filtered by student_id', async () => {
      const res = await request(app)
        .get('/api/scores')
        .query({ student_id: studentId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(s => {
        expect(s.student_id).toBe(studentId);
      });
    });
  });

  describe('POST /api/scores/bulk — Bulk score submission', () => {
    let newAssessmentId;
    beforeAll(async () => {
      newAssessmentId = await createTestAssessment(streamId, subjectId, 'Quiz');
    });

    test('Should submit multiple scores at once', async () => {
      const res = await request(app)
        .post('/api/scores/bulk')
        .send({
          assessment_id: newAssessmentId,
          scores: [
            { student_id: studentId,  score: 70 },
            { student_id: student2Id, score: 80 },
          ]
        });
      expect(res.status).toBe(200);
      expect(res.body.inserted).toBe(2);
      expect(res.body.errors.length).toBe(0);
    });

    test('Should report errors for invalid scores in bulk', async () => {
      const anotherAssessmentId = await createTestAssessment(streamId, subjectId, 'Assignment');
      const res = await request(app)
        .post('/api/scores/bulk')
        .send({
          assessment_id: anotherAssessmentId,
          scores: [
            { student_id: studentId,  score: 200 }, // exceeds max
            { student_id: student2Id, score: 80  }, // valid
          ]
        });
      expect(res.status).toBe(200);
      expect(res.body.inserted).toBe(1);
      expect(res.body.errors.length).toBe(1);
    });
  });

  describe('DELETE /api/scores/:id', () => {
    test('Should delete a score', async () => {
      // Create a score to delete
      const create = await request(app)
        .post('/api/scores')
        .send({ student_id: studentId, assessment_id: await createTestAssessment(streamId, subjectId, 'Quiz'), score: 60 });
      const id = create.body.id;
      const res = await request(app).delete(`/api/scores/${id}`);
      expect(res.status).toBe(200);
    });
  });
});
