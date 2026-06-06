# Ikonex Academy — Student Management System

A full-stack web-based Student Management System built for Ikonex Academy to manage class streams, students, subjects, assessments, scores, and academic results.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Testing | Jest, Supertest |

---

## Project Structure

```
ikonex-academy/
├── frontend/                     # React + Vite application
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Streams.jsx
│       │   ├── StreamDetail.jsx
│       │   ├── Students.jsx
│       │   ├── StudentDetail.jsx
│       │   ├── Subjects.jsx
│       │   ├── Assessments.jsx
│       │   ├── ScoreEntry.jsx
│       │   ├── ScoreManagement.jsx
│       │   ├── Results.jsx
│       │   ├── ClassResults.jsx
│       │   ├── SubjectPerformance.jsx
│       │   └── FormRanking.jsx
│       ├── utils/
│       │   └── api.js
│       ├── hooks/
│       │   └── useToast.jsx
│       └── styles/
│           └── global.css
│
├── backend/                      # Node.js + Express API
│   ├── jest.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── database.js
│       ├── routes/
│       │   ├── streams.js
│       │   ├── students.js
│       │   ├── subjects.js
│       │   ├── assessments.js
│       │   ├── scores.js
│       │   ├── results.js
│       │   ├── reports.js
│       │   └── grading.js
│       └── tests/
│           ├── setup.js
│           ├── grading.test.js
│           ├── streams.test.js
│           ├── students.test.js
│           ├── subjects.test.js
│           ├── scores.test.js
│           └── results.test.js
│
└── database/
    └── schema.sql               # MySQL schema + seed data
```

---

## Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ikonex-academy
```

### 2. Database setup

Start MySQL and run the schema:

```bash
sudo systemctl start mysql
mysql -u root -p < database/schema.sql
```

This creates the `ikonex_academy` database with all tables and a default grading scale.

### 3. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ikonex_academy
PORT=5000
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover: grading logic, streams, students, subjects, scores (including duplicate prevention), and results processing.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/streams` | List / create class streams |
| GET/PUT/DELETE | `/api/streams/:id` | View / update / delete stream |
| GET | `/api/streams/:id/students` | Students in a stream |
| GET | `/api/streams/:id/subjects` | Subjects assigned to a stream |
| GET/POST | `/api/students` | List / register students |
| GET/PUT/DELETE | `/api/students/:id` | View / update / delete student |
| GET/POST | `/api/subjects` | List / create subjects |
| PUT/DELETE | `/api/subjects/:id` | Update / delete subject |
| POST | `/api/subjects/assign` | Assign subject to stream |
| DELETE | `/api/subjects/assign/:sid/:subid` | Remove subject from stream |
| GET/POST | `/api/assessments` | List / create assessments |
| PUT/DELETE | `/api/assessments/:id` | Update / delete assessment |
| GET/POST | `/api/scores` | List / submit score |
| POST | `/api/scores/bulk` | Bulk score submission |
| PUT/DELETE | `/api/scores/:id` | Update / delete score |
| GET | `/api/results/student/:id` | Student results with positions |
| GET | `/api/results/class/:stream_id` | Class rankings |
| GET | `/api/results/subject/:sub_id/stream/:stream_id` | Subject performance |
| GET | `/api/results/form-ranking` | Form-wide rankings |
| GET | `/api/reports/student/:id/html` | Student report card (HTML/PDF) |
| GET | `/api/reports/class/:stream_id/html` | Class performance report |
| GET | `/api/reports/subject/:sub_id/stream/:stream_id/html` | Subject report |
| GET | `/api/reports/form-ranking/html` | Form ranking report |

---

## Grading Scale

| Grade | Range | Label |
|---|---|---|
| A | 75 – 100 | Distinction |
| B | 65 – 74.99 | Merit |
| C | 55 – 64.99 | Credit |
| D | 45 – 54.99 | Pass |
| E | 35 – 44.99 | Near Miss |
| U | 0 – 34.99 | Fail |

---

## Score Weighting

All subject scores are calculated as:
- **Exam assessments** → weighted to 70%
- **CA / Quiz / Assignment** → weighted to 30%
- **Combined score** → out of 100

---

## License

Built for Ikonex Academy Assessment — 2025/2026