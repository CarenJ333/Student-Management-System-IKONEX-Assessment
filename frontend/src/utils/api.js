import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Streams
export const getStreams         = ()         => API.get('/streams');
export const getStream          = (id)       => API.get(`/streams/${id}`);
export const getStreamStudents  = (id)       => API.get(`/streams/${id}/students`);
export const getStreamSubjects  = (id)       => API.get(`/streams/${id}/subjects`);
export const createStream       = (data)     => API.post('/streams', data);
export const updateStream       = (id, data) => API.put(`/streams/${id}`, data);
export const deleteStream       = (id)       => API.delete(`/streams/${id}`);

// Students
export const getStudents        = ()         => API.get('/students');
export const getStudent         = (id)       => API.get(`/students/${id}`);
export const createStudent      = (data)     => API.post('/students', data);
export const updateStudent      = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent      = (id)       => API.delete(`/students/${id}`);

// Subjects
export const getSubjects        = ()         => API.get('/subjects');
export const createSubject      = (data)     => API.post('/subjects', data);
export const updateSubject      = (id, data) => API.put(`/subjects/${id}`, data);
export const deleteSubject      = (id)       => API.delete(`/subjects/${id}`);
export const assignSubject      = (data)     => API.post('/subjects/assign', data);
export const removeSubject      = (sid, subid) => API.delete(`/subjects/assign/${sid}/${subid}`);

// Assessments
export const getAssessments     = (params)   => API.get('/assessments', { params });
export const createAssessment   = (data)     => API.post('/assessments', data);
export const updateAssessment   = (id, data) => API.put(`/assessments/${id}`, data);
export const deleteAssessment   = (id)       => API.delete(`/assessments/${id}`);

// Scores
export const getScores          = (params)   => API.get('/scores', { params });
export const submitScore        = (data)     => API.post('/scores', data);
export const bulkSubmitScores   = (data)     => API.post('/scores/bulk', data);
export const updateScore        = (id, data) => API.put(`/scores/${id}`, data);
export const deleteScore        = (id)       => API.delete(`/scores/${id}`);

// Results
export const getStudentResults  = (id, params)  => API.get(`/results/student/${id}`, { params });
export const getClassResults    = (id, params)  => API.get(`/results/class/${id}`, { params });
export const getSubjectResults  = (subId, stId, params) =>
  API.get(`/results/subject/${subId}/stream/${stId}`, { params });
export const getGradingScales   = ()         => API.get('/grading');

// Reports
export const getStudentReportURL  = (id, params) => {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL || '/api'}/reports/student/${id}/html${q ? '?' + q : ''}`;
};
export const getClassReportURL    = (id, params) => {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL || '/api'}/reports/class/${id}/html${q ? '?' + q : ''}`;
};

// Form-wide ranking (e.g. all Form 1 streams combined)
export const getFormRanking = (params) => API.get('/results/form-ranking', { params });

// Subject report URL
export const getSubjectReportURL = (subId, stId, params) => {
  const q = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_URL || '/api'}/reports/subject/${subId}/stream/${stId}/html${q ? '?' + q : ''}`;
};

// Form ranking report URL
export const getFormRankingReportURL = (params) => {
  const q = new URLSearchParams(params).toString();
  return `/api/reports/form-ranking/html${q ? '?' + q : ''}`;
};

// Score management
export const getStudentScores     = (student_id) => API.get(`/scores/student/${student_id}`);
export const deleteScoreByStudentAssessment = (student_id, assessment_id) =>
  API.delete(`/scores/student/${student_id}/assessment/${assessment_id}`);