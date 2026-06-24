import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import LandingPage             from '../pages/LandingPage.jsx';
import AdminLogin              from '../pages/AdminLogin.jsx';
import TeacherLogin            from '../pages/TeacherLogin.jsx';
import StudentLogin            from '../pages/StudentLogin.jsx';

import AdminDashboard          from '../pages/admin/Dashboard.jsx';
import AcademicYearsPage       from '../pages/admin/AcademicYears.jsx';
import ClassesPage             from '../pages/admin/Classes.jsx';
import SubjectsPage            from '../pages/admin/Subjects.jsx';
import TeachersPage            from '../pages/admin/Teachers.jsx';
import StudentsPage            from '../pages/admin/Students.jsx';
import TeachingAssignmentsPage from '../pages/admin/TeachingAssignments.jsx';
import AssessmentSchemesPage   from '../pages/admin/AssessmentSchemes.jsx';
import MarksPage               from '../pages/admin/Marks.jsx';
import ResultsPage             from '../pages/admin/Results.jsx';
import RankingPage             from '../pages/admin/Ranking.jsx';

import TeacherDashboard from '../pages/teacher/Dashboard.jsx';
import StudentDashboard from '../pages/student/Dashboard.jsx';

const Admin   = ({ children }) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
const Teacher = ({ children }) => <ProtectedRoute requiredRole="teacher">{children}</ProtectedRoute>;
const Student = ({ children }) => <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;

export default function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<LandingPage />}   />
          <Route path="/login"          element={<AdminLogin />}    />
          <Route path="/teacher-login"  element={<TeacherLogin />}  />
          <Route path="/student-login"  element={<StudentLogin />}  />

          {/* Admin */}
          <Route path="/admin/dashboard"            element={<Admin><AdminDashboard /></Admin>}                />
          <Route path="/admin/academic-years"       element={<Admin><AcademicYearsPage /></Admin>}             />
          <Route path="/admin/classes"              element={<Admin><ClassesPage /></Admin>}                   />
          <Route path="/admin/subjects"             element={<Admin><SubjectsPage /></Admin>}                  />
          <Route path="/admin/teachers"             element={<Admin><TeachersPage /></Admin>}                  />
          <Route path="/admin/students"             element={<Admin><StudentsPage /></Admin>}                  />
          <Route path="/admin/teaching-assignments" element={<Admin><TeachingAssignmentsPage /></Admin>}       />
          <Route path="/admin/assessment-schemes"   element={<Admin><AssessmentSchemesPage /></Admin>}         />
          <Route path="/admin/marks"                element={<Admin><MarksPage /></Admin>}                     />
          <Route path="/admin/results"              element={<Admin><ResultsPage /></Admin>}                   />
          <Route path="/admin/ranking"              element={<Admin><RankingPage /></Admin>}                   />

          {/* Teacher */}
          <Route path="/teacher/dashboard" element={<Teacher><TeacherDashboard /></Teacher>} />

          {/* Student */}
          <Route path="/student/dashboard" element={<Student><StudentDashboard /></Student>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
