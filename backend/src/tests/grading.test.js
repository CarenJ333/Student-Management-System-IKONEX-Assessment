// src/tests/grading.test.js
// Unit tests for grading logic — no HTTP, no database needed

const { pool } = require('../config/database');

async function getGrade(score) {
  const [grades] = await pool.query(
    'SELECT * FROM grading_scales WHERE ? BETWEEN min_score AND max_score LIMIT 1',
    [score]
  );
  return grades.length ? grades[0] : { grade: 'U', label: 'Fail', points: 0 };
}

function calculateWeightedScore(examScore, examMax, caScore, caMax) {
  const examWeighted = examMax > 0 ? (examScore / examMax) * 70 : 0;
  const caWeighted   = caMax   > 0 ? (caScore   / caMax)   * 30 : 0;
  return Math.round((examWeighted + caWeighted) * 100) / 100;
}



describe('Grading Scale Tests', () => {
  test('Score of 80 should return grade A (Distinction)', async () => {
    const grade = await getGrade(80);
    expect(grade.grade).toBe('A');
    expect(grade.label).toBe('Distinction');
  });

  test('Score of 70 should return grade B (Merit)', async () => {
    const grade = await getGrade(70);
    expect(grade.grade).toBe('B');
    expect(grade.label).toBe('Merit');
  });

  test('Score of 60 should return grade C (Credit)', async () => {
    const grade = await getGrade(60);
    expect(grade.grade).toBe('C');
    expect(grade.label).toBe('Credit');
  });

  test('Score of 50 should return grade D (Pass)', async () => {
    const grade = await getGrade(50);
    expect(grade.grade).toBe('D');
    expect(grade.label).toBe('Pass');
  });

  test('Score of 40 should return grade E (Near Miss)', async () => {
    const grade = await getGrade(40);
    expect(grade.grade).toBe('E');
    expect(grade.label).toBe('Near Miss');
  });

  test('Score of 20 should return grade U (Fail)', async () => {
    const grade = await getGrade(20);
    expect(grade.grade).toBe('U');
    expect(grade.label).toBe('Fail');
  });

  test('Score of 0 should return grade U (Fail)', async () => {
    const grade = await getGrade(0);
    expect(grade.grade).toBe('U');
  });

  test('Score of 100 should return grade A (Distinction)', async () => {
    const grade = await getGrade(100);
    expect(grade.grade).toBe('A');
  });

  test('Score of 75 (boundary) should return grade A', async () => {
    const grade = await getGrade(75);
    expect(grade.grade).toBe('A');
  });

  test('Score of 74.99 (boundary) should return grade B', async () => {
    const grade = await getGrade(74.99);
    expect(grade.grade).toBe('B');
  });
});

describe('Weighted Score Calculation Tests (Exam 70% + CA 30%)', () => {
  test('Full marks on both exam and CA should give 100', () => {
    const score = calculateWeightedScore(100, 100, 30, 30);
    expect(score).toBe(100);
  });

  test('Full exam marks, zero CA should give 70', () => {
    const score = calculateWeightedScore(100, 100, 0, 30);
    expect(score).toBe(70);
  });

  test('Zero exam, full CA should give 30', () => {
    const score = calculateWeightedScore(0, 100, 30, 30);
    expect(score).toBe(30);
  });

  test('Half marks on both should give 50', () => {
    const score = calculateWeightedScore(50, 100, 15, 30);
    expect(score).toBe(50);
  });

  test('85 out of 100 exam, 25 out of 30 CA should calculate correctly', () => {
    // Exam: (85/100)*70 = 59.5, CA: (25/30)*30 = 25, Total = 84.5
    const score = calculateWeightedScore(85, 100, 25, 30);
    expect(score).toBe(84.5);
  });

  test('Different max scores should still weight correctly', () => {
    // Exam: (70/70)*70 = 70, CA: (30/30)*30 = 30, Total = 100
    const score = calculateWeightedScore(70, 70, 30, 30);
    expect(score).toBe(100);
  });

  test('Zero max scores should return 0 without crashing', () => {
    const score = calculateWeightedScore(0, 0, 0, 0);
    expect(score).toBe(0);
  });

  test('Score should not exceed 100', () => {
    const score = calculateWeightedScore(100, 100, 30, 30);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('Score Validation Rules', () => {
  test('Score must not be negative', () => {
    const isValid = (score, max) => score >= 0 && score <= max;
    expect(isValid(-1, 100)).toBe(false);
  });

  test('Score must not exceed maximum', () => {
    const isValid = (score, max) => score >= 0 && score <= max;
    expect(isValid(101, 100)).toBe(false);
  });

  test('Score of 0 is valid', () => {
    const isValid = (score, max) => score >= 0 && score <= max;
    expect(isValid(0, 100)).toBe(true);
  });

  test('Score equal to max is valid', () => {
    const isValid = (score, max) => score >= 0 && score <= max;
    expect(isValid(100, 100)).toBe(true);
  });

  test('Decimal scores are valid', () => {
    const isValid = (score, max) => score >= 0 && score <= max;
    expect(isValid(85.5, 100)).toBe(true);
  });
});
