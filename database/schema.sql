-- ============================================================
-- Ikonex Academy Student Management System
-- MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS ikonex_academy;
USE ikonex_academy;

-- Class Streams (e.g. Form 1A, Form 2B)
CREATE TABLE class_streams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  form_level INT NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  email VARCHAR(150),
  phone VARCHAR(20),
  address TEXT,
  stream_id INT NOT NULL,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('Active', 'Inactive', 'Transferred') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES class_streams(id) ON DELETE RESTRICT
);

-- Subjects
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Assign subjects to class streams
CREATE TABLE stream_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stream_id INT NOT NULL,
  subject_id INT NOT NULL,
  UNIQUE KEY unique_stream_subject (stream_id, subject_id),
  FOREIGN KEY (stream_id) REFERENCES class_streams(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Grading Scales (configurable)
CREATE TABLE grading_scales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grade VARCHAR(5) NOT NULL,
  min_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  label VARCHAR(50) NOT NULL,
  points DECIMAL(3,1) NOT NULL
);

-- Exams / Assessment Types
CREATE TABLE assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('Exam', 'CA', 'Quiz', 'Assignment') NOT NULL,
  stream_id INT NOT NULL,
  subject_id INT NOT NULL,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  weight DECIMAL(5,2) NOT NULL DEFAULT 100,
  academic_year VARCHAR(9) NOT NULL,
  term ENUM('Term 1', 'Term 2', 'Term 3') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES class_streams(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Student Scores
CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  assessment_id INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_assessment (student_id, assessment_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  CONSTRAINT chk_score CHECK (score >= 0)
);

-- ============================================================
-- Default Grading Scale (Zimbabwean / common scale)
-- ============================================================
INSERT INTO grading_scales (grade, min_score, max_score, label, points) VALUES
  ('A', 75.00, 100.00, 'Distinction', 4.0),
  ('B', 65.00, 74.99, 'Merit',       3.0),
  ('C', 55.00, 64.99, 'Credit',      2.0),
  ('D', 45.00, 54.99, 'Pass',        1.0),
  ('E', 35.00, 44.99, 'Near Miss',   0.5),
  ('U', 0.00,  34.99, 'Fail',        0.0);

-- ============================================================
-- Sample Data
-- ============================================================
INSERT INTO class_streams (name, form_level, academic_year) VALUES
  ('Form 1A', 1, '2024/2025'),
  ('Form 1B', 1, '2024/2025'),
  ('Form 2A', 2, '2024/2025');

INSERT INTO subjects (name, code, description) VALUES
  ('Mathematics',       'MATH101', 'Core mathematics'),
  ('English Language',  'ENG101',  'English language and comprehension'),
  ('Science',           'SCI101',  'General science'),
  ('History',           'HIST101', 'World and local history'),
  ('Geography',         'GEO101',  'Physical and human geography');

INSERT INTO stream_subjects (stream_id, subject_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
  (3, 1), (3, 2), (3, 3), (3, 4), (3, 5);
