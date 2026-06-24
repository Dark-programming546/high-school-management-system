import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DASHBOARDS = {
  admin:        '/admin/dashboard',
  registrar:    '/registrar/dashboard',
  director:     '/director/dashboard',
  vicedirector: '/director/dashboard',
  teacher:      '/teacher/dashboard',
  student:      '/student/dashboard',
};

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to={DASHBOARDS[user.role] || '/'} replace />;
  }

  return children;
}
