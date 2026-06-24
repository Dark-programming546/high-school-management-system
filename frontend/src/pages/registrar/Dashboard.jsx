import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrarLayout from '../../components/RegistrarLayout.jsx';
import { Loading, Alert } from '../../components/UI.jsx';
import { dashboardService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    dashboardService.getStats()
      .then(data => setStats(data.stats))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RegistrarLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrar Dashboard</h1>

        {error   && <Alert type="error" message={error} onClose={() => setError('')} />}
        {loading && <Loading />}

        {!loading && stats && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-2xl font-bold text-green-700">{stats.totalStudents ?? 0}</div>
                <div className="text-sm text-green-600 mt-0.5">Total Students</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl mb-1">⏳</div>
                <div className="text-2xl font-bold text-yellow-700">{stats.pendingApplications ?? 0}</div>
                <div className="text-sm text-yellow-600 mt-0.5">Pending Registrations</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Quick Actions</h2>
              <button
                onClick={() => navigate('/registrar/students')}
                className="text-sm px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition"
              >
                👥 Register Students
              </button>
            </div>
          </>
        )}
      </div>
    </RegistrarLayout>
  );
}
