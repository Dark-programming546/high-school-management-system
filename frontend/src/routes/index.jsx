import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import LandingPage             from '../pages/LandingPage.jsx';
import AdminLogin              from '../pages/AdminLogin.jsx';
import TeacherLogin            from '../pages/TeacherLogin.jsx';
import StudentLogin            from '../pages/StudentLogin.jsx';
import RegistrarLogin          from '../pages/RegistrarLogin.jsx';
import DirectorLogin           from '../pages/DirectorLogin.jsx';
import ViceDirectorLogin       from '../pages/ViceDirectorLogin.jsx';

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
import StaffPage               from '../pages/admin/Staff.jsx';

import RegistrarDashboard      from '../pages/registrar/Dashboard.jsx';
import RegistrarStudents       from '../pages/registrar/Students.jsx';

import DirectorDashboard       from '../pages/director/Dashboard.jsx';
import DirectorStudents        from '../pages/director/Students.jsx';
import DirectorTeachers        from '../pages/director/Teachers.jsx';
import DirectorResults         from '../pages/director/Results.jsx';
import DirectorRanking         from '../pages/director/Ranking.jsx';

import TeacherDashboard  from '../pages/teacher/Dashboard.jsx';
import TeacherAssignments from '../pages/teacher/Assignments.jsx';
import TeacherMarks      from '../pages/teacher/Marks.jsx';
import TeacherResults    from '../pages/teacher/Results.jsx';
import TeacherRanking    from '../pages/teacher/Ranking.jsx';
import StudentDashboard from '../pages/student/Dashboard.jsx';

const Admin        = ({ children }) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
const Registrar    = ({ children }) => <ProtectedRoute requiredRole="registrar">{children}</ProtectedRoute>;
const Director     = ({ children }) => <ProtectedRoute requiredRoles={['director','vicedirector']}>{children}</ProtectedRoute>;
const Teacher      = ({ children }) => <ProtectedRoute requiredRole="teacher">{children}</ProtectedRoute>;
const Student      = ({ children }) => <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;

export default function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"                   element={<LandingPage />}        />
          <Route path="/login"              element={<AdminLogin />}         />
          <Route path="/registrar-login"    element={<RegistrarLogin />}     />
          <Route path="/director-login"     element={<DirectorLogin />}      />
          <Route path="/vice-director-login" element={<ViceDirectorLogin />} />
          <Route path="/teacher-login"      element={<TeacherLogin />}       />
          <Route path="/student-login"      element={<StudentLogin />}       />

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
          <Route path="/admin/staff"                element={<Admin><StaffPage /></Admin>}                     />

          {/* Registrar */}
          <Route path="/registrar/dashboard" element={<Registrar><RegistrarDashboard /></Registrar>} />
          <Route path="/registrar/students"  element={<Registrar><RegistrarStudents /></Registrar>}  />

          {/* Director & Vice Director (shared routes) */}
          <Route path="/director/dashboard" element={<Director><DirectorDashboard /></Director>} />
          <Route path="/director/students"  element={<Director><DirectorStudents /></Director>}  />
          <Route path="/director/teachers"  element={<Director><DirectorTeachers /></Director>}  />
          <Route path="/director/results"   element={<Director><DirectorResults /></Director>}   />
          <Route path="/director/ranking"   element={<Director><DirectorRanking /></Director>}   />

          {/* Teacher */}
          <Route path="/teacher/dashboard"   element={<Teacher><TeacherDashboard /></Teacher>}   />
          <Route path="/teacher/assignments" element={<Teacher><TeacherAssignments /></Teacher>} />
          <Route path="/teacher/marks"       element={<Teacher><TeacherMarks /></Teacher>}       />
          <Route path="/teacher/results"     element={<Teacher><TeacherResults /></Teacher>}     />
          <Route path="/teacher/ranking"     element={<Teacher><TeacherRanking /></Teacher>}     />

          {/* Student */}
          <Route path="/student/dashboard" element={<Student><StudentDashboard /></Student>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
