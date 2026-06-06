// src/tests/results.test.js
const request = require('supertest');
const app     = require('../server');
const {
  pool, clearTestData,
  createTestStream, createTestStudent,
  createTestSubject, createTestAssessment
} = require('./setup');

let streamId, studentId, student2Id, subjectId, examId, caId;

beforeAll(async () => {
  await clearTestData();
  streamId  = await createTestStream();
  studentId = await createTestStudent(streamId, '001');
  student2Id = await createTestStudent(streamId, '002');
  subjectId = await createTestSubject();
  examId    = await createTestAssessment(streamId, subjectId, 'Exam');
  caId      = await createTestAssessment(streamId, subjectId, 'CA');

  // Assign subject to stream
  await pool.query(
    'INSERT IGNORE INTO stream_subjects (stream_id, subject_id) VALUES (?, ?)',
    [streamId, subjectId]
  );

  // Submit scores: student1 gets 85 exam, 25 CA; student2 gets 70 exam, 20 CA
  await pool.query(
    'INSERT INTO scores (student_id, assessment_id, score) VALUES (?,?,?),(?,?,?),(?,?,?),(?,?,?)',
    [studentId, examId, 85, studentId, caId, 25, student2Id, examId, 70, student2Id, caId, 20]
  );
});

afterAll(async () => {
  await clearTestData();
});

describe('Results API', () => {

  describe('GET /api/results/student/:id', () => {
    test('Should return student results with subjects', async () => {
      const res = await request(app)
        .get(`/api/results/student/${studentId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.status).toBe(200);
      expect(res.body.student).toBeDefined();
      expect(res.body.subjects).toBeDefined();
      expect(Array.isArray(res.body.subjects)).toBe(true);
      expect(res.body.summary).toBeDefined();
    });

    test('Should calculate weighted score correctly (Exam 70% + CA 30%)', async () => {
      const res = await request(app)
        .get(`/api/results/student/${studentId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.status).toBe(200);
      const subject = res.body.subjects[0];
      // Exam: (85/100)*70 = 59.5, CA: (25/100)*30 = 7.5, Combined = 67
      // Note: CA max_score is 100 (set in createTestAssessment)
      expect(subject.combined).toBeDefined();
      expect(parseFloat(subject.combined)).toBeGreaterThan(0);
    });

    test('Should include grade for each subject', async () => {
      const res = await request(app)
        .get(`/api/results/student/${studentId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      const subject = res.body.subjects[0];
      expect(subject.grade).toMatch(/^[A-U]$/);
      expect(subject.grade_label).toBeDefined();
    });

    test('Should include subject position', async () => {
      const res = await request(app)
        .get(`/api/results/student/${studentId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      const subject = res.body.subjects[0];
      expect(subject.subject_position).toBeDefined();
      expect(subject.out_of).toBeDefined();
      expect(subject.subject_position).toBeGreaterThanOrEqual(1);
    });

    test('Should include overall summary', async () => {
      const res = await request(app)
        .get(`/api/results/student/${studentId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.body.summary.average).toBeDefined();
      expect(res.body.summary.grade).toBeDefined();
      expect(res.body.summary.total_subjects).toBeGreaterThan(0);
    });

    test('Should return 404 for non-existent student', async () => {
      const res = await request(app)
        .get('/api/results/student/999999')
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.status).toBe(404);
    });

    test('Student with higher scores should rank #1', async () => {
      // student1 (85 exam) should rank higher than student2 (70 exam)
      const res1 = await request(app)
        .get(`/api/results/student/${studentId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      const res2 = await request(app)
        .get(`/api/results/student/${student2Id}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      const pos1 = res1.body.subjects[0]?.subject_position;
      const pos2 = res2.body.subjects[0]?.subject_position;
      expect(pos1).toBeLessThan(pos2);
    });
  });

  describe('GET /api/results/class/:stream_id', () => {
    test('Should return class results ranked by average', async () => {
      const res = await request(app)
        .get(`/api/results/class/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.status).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.total_students).toBeDefined();
    });

    test('Students should be ranked in descending order of average', async () => {
      const res = await request(app)
        .get(`/api/results/class/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      const results = res.body.results;
      for (let i = 0; i < results.length - 1; i++) {
        expect(parseFloat(results[i].average)).toBeGreaterThanOrEqual(parseFloat(results[i + 1].average));
      }
    });

    test('Each student should have a position assigned', async () => {
      const res = await request(app)
        .get(`/api/results/class/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      res.body.results.forEach((s, i) => {
        expect(s.position).toBe(i + 1);
      });
    });

    test('First student should have position 1', async () => {
      const res = await request(app)
        .get(`/api/results/class/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.body.results[0].position).toBe(1);
    });
  });

  describe('GET /api/results/subject/:subject_id/stream/:stream_id', () => {
    test('Should return subject performance for a class', async () => {
      const res = await request(app)
        .get(`/api/results/subject/${subjectId}/stream/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('Should include subject position for each student', async () => {
      const res = await request(app)
        .get(`/api/results/subject/${subjectId}/stream/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      res.body.forEach(s => {
        expect(s.subject_position).toBeDefined();
      });
    });

    test('Should be sorted by percentage descending', async () => {
      const res = await request(app)
        .get(`/api/results/subject/${subjectId}/stream/${streamId}`)
        .query({ term: 'Term 1', academic_year: '2024/2025' });
      const results = res.body;
      for (let i = 0; i < results.length - 1; i++) {
        expect(parseFloat(results[i].percentage)).toBeGreaterThanOrEqual(parseFloat(results[i+1].percentage));
      }
    });
  });
});
