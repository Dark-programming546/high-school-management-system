import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PORTALS = [
  { label: 'Admin Login',        path: '/login',               color: 'bg-blue-600   hover:bg-blue-700'   },
  { label: 'Registrar Login',    path: '/registrar-login',     color: 'bg-green-600  hover:bg-green-700'  },
  { label: 'Director Login',     path: '/director-login',      color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Vice Director Login',path: '/vice-director-login', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { label: 'Teacher Login',      path: '/teacher-login',       color: 'bg-yellow-500 hover:bg-yellow-600' },
  { label: 'Student Login',      path: '/student-login',       color: 'bg-red-500    hover:bg-red-600'    },
];

export default function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (isAuthenticated()) {
    const dest = {
      admin:        '/admin/dashboard',
      registrar:    '/registrar/dashboard',
      director:     '/director/dashboard',
      vicedirector: '/director/dashboard',
      teacher:      '/teacher/dashboard',
      student:      '/student/dashboard',
    }[user?.role] || '/login';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-3">High School Management System</h1>
        <p className="text-gray-400 text-lg mb-10">Manage academics, students, teachers, and more</p>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {PORTALS.map(({ label, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`${color} text-white font-medium py-3 rounded-lg transition text-sm`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
