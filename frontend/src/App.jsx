import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import Dashboard         from './pages/Dashboard';
import Streams           from './pages/Streams';
import StreamDetail      from './pages/StreamDetail';
import Students          from './pages/Students';
import StudentDetail     from './pages/StudentDetail';
import Subjects          from './pages/Subjects';
import Assessments       from './pages/Assessments';
import ScoreEntry        from './pages/ScoreEntry';
import Results           from './pages/Results';
import ClassResults      from './pages/ClassResults';
import SubjectPerformance from './pages/SubjectPerformance';
import FormRanking       from './pages/FormRanking';
import ScoreManagement  from './pages/ScoreManagement';

function Sidebar() {
  const links = [
    { section: 'Overview', items: [
      { to: '/', label: 'Dashboard' },
    ]},
    { section: 'Management', items: [
      { to: '/streams',  label: 'Class Streams' },
      { to: '/students', label: 'Students' },
      { to: '/subjects', label: 'Subjects' },
    ]},
    { section: 'Assessments', items: [
      { to: '/assessments', label: 'Assessments' },
      { to: '/scores',         label: 'Score Entry' },
      { to: '/score-management', label: 'Score Management' },
    ]},
    { section: 'Results & Reports', items: [
      { to: '/results',             label: 'Student Results' },
      { to: '/class-results',       label: 'Class Rankings' },
      { to: '/subject-performance', label: 'Subject Performance' },
      { to: '/form-ranking',        label: 'Form Rankings' },
    ]},
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Ikonex Academy</h1>
        <p>Student Management System</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section">{section}</div>
            {items.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"                    element={<Dashboard />} />
            <Route path="/streams"             element={<Streams />} />
            <Route path="/streams/:id"         element={<StreamDetail />} />
            <Route path="/students"            element={<Students />} />
            <Route path="/students/:id"        element={<StudentDetail />} />
            <Route path="/subjects"            element={<Subjects />} />
            <Route path="/assessments"         element={<Assessments />} />
            <Route path="/scores"              element={<ScoreEntry />} />
            <Route path="/results"             element={<Results />} />
            <Route path="/class-results"       element={<ClassResults />} />
            <Route path="/subject-performance" element={<SubjectPerformance />} />
            <Route path="/form-ranking"        element={<FormRanking />} />
            <Route path="/score-management"    element={<ScoreManagement />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;