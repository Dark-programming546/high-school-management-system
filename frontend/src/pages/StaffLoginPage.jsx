import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/helpers.js';

/**
 * Generic staff login page.
 * @param {string} role         - auth role key: 'registrar' | 'director' | 'vicedirector'
 * @param {string} title        - Display title shown on the page
 * @param {string} color        - Tailwind color key: 'green' | 'purple' | 'indigo'
 * @param {string} redirectPath - Where to navigate on success
 * @param {string} demoUsername - Demo credentials username
 * @param {string} demoPassword - Demo credentials password
 */
const COLORS = {
  green:  { bg: 'from-green-500 to-green-600',   ring: 'focus:ring-green-500',  btn: 'bg-green-600 hover:bg-green-700' },
  purple: { bg: 'from-purple-500 to-purple-600', ring: 'focus:ring-purple-500', btn: 'bg-purple-600 hover:bg-purple-700' },
  indigo: { bg: 'from-indigo-500 to-indigo-600', ring: 'focus:ring-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700' },
};

export default function StaffLoginPage({ role, title, color = 'green', redirectPath, demoUsername, demoPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const c = COLORS[color];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password, role);
      if (result.success) {
        navigate(redirectPath);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${c.bg}`}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">High School Management</h1>
        <p className="text-center text-gray-600 mb-8">{title}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${c.ring} outline-none`}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${c.ring} outline-none`}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${c.btn} text-white font-medium py-2 rounded-lg transition disabled:opacity-50`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {demoUsername && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo credentials:</p>
            <p>Username: <span className="font-mono">{demoUsername}</span></p>
            <p>Password: <span className="font-mono">{demoPassword}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
