import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/registrar/dashboard', icon: '📊' },
  { label: 'Students',  path: '/registrar/students',  icon: '👥' },
];

export default function RegistrarLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between shrink-0 z-20">
        <span className="font-bold text-gray-800 text-lg">🎓 School Registrar</span>
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
        <aside className="w-52 bg-green-900 text-white shrink-0 overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map(({ label, path, icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                  pathname === path
                    ? 'bg-green-600 text-white font-medium'
                    : 'text-green-100 hover:bg-green-800 hover:text-white'
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
