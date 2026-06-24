import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard',  path: '/director/dashboard',  icon: '📊' },
  { label: 'Students',   path: '/director/students',   icon: '👥' },
  { label: 'Teachers',   path: '/director/teachers',   icon: '👨🏫' },
  { label: 'Results',    path: '/director/results',    icon: '📈' },
  { label: 'Ranking',    path: '/director/ranking',    icon: '🏆' },
];

export default function DirectorLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const roleLabel = user?.role === 'vicedirector' ? 'Vice Director' : 'Director';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between shrink-0 z-20">
        <span className="font-bold text-gray-800 text-lg">🎓 School {roleLabel}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Read Only</span>
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
        <aside className="w-52 bg-purple-900 text-white shrink-0 overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map(({ label, path, icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                  pathname === path
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-purple-100 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
