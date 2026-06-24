import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard',         path: '/admin/dashboard',            icon: '📊' },
  { label: 'Academic Years',    path: '/admin/academic-years',       icon: '📅' },
  { label: 'Classes',           path: '/admin/classes',              icon: '🏫' },
  { label: 'Subjects',          path: '/admin/subjects',             icon: '📚' },
  { label: 'Teachers',          path: '/admin/teachers',             icon: '👨‍🏫' },
  { label: 'Students',          path: '/admin/students',             icon: '👥' },
  { label: 'Staff Accounts',    path: '/admin/staff',                icon: '🔑' },
  { label: 'Assignments',       path: '/admin/teaching-assignments', icon: '📋' },
  { label: 'Assessment Scheme', path: '/admin/assessment-schemes',   icon: '⚖️'  },
  { label: 'Marks',             path: '/admin/marks',                icon: '📝' },
  { label: 'Results',           path: '/admin/results',              icon: '📈' },
  { label: 'Ranking',           path: '/admin/ranking',              icon: '🏆' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between shrink-0 z-20">
        <span className="font-bold text-gray-800 text-lg">🎓 School Admin</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Logged in as <strong className="text-gray-700">{user?.username}</strong>
          </span>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-gray-900 text-white shrink-0 overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map(({ label, path, icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                  pathname === path
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
