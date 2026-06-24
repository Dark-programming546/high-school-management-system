import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (isAuthenticated()) {
    const dest = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }[user?.role] || '/login';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-3">High School Management System</h1>
        <p className="text-gray-400 text-lg mb-10">Manage academics, students, teachers, and more</p>

        <div className="flex flex-col items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="w-64 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
            Admin Login
          </button>
          <button onClick={() => navigate('/teacher-login')}
            className="w-64 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition">
            Teacher Login
          </button>
          <button onClick={() => navigate('/student-login')}
            className="w-64 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition">
            Student Login
          </button>
        </div>
      </div>
    </div>
  );
}
