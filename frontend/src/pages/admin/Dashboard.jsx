import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { Loading, Alert } from '../../components/UI.jsx';
import { dashboardService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

function StatCard({ icon, label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red:    'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm mt-0.5 opacity-80">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getStats()
      .then(data => setStats(data.stats))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {loading && <Loading />}

        {!loading && stats && (
          <>
            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon="🏫" label="Total Classes"   value={stats.totalClasses   ?? 0} color="blue"   />
              <StatCard icon="👥" label="Total Students"  value={stats.totalStudents  ?? 0} color="green"  />
              <StatCard icon="👨🏫" label="Total Teachers" value={stats.totalTeachers  ?? 0} color="purple" />
              <StatCard icon="⏳" label="Pending Apps"    value={stats.pendingApplications ?? 0} color="orange" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Pass / fail rates */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-semibold text-gray-700 mb-3">Result Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Results</span>
                    <strong>{stats.totalResults ?? 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Passed Students</span>
                    <strong className="text-green-700">{stats.passedStudents ?? 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Failed / Repeat</span>
                    <strong className="text-red-700">{stats.failedOrRepeatStudents ?? 0}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Pass Rate</span>
                    <strong>{stats.passRate ?? 0}%</strong>
                  </div>
                </div>
              </div>

              {/* Top 3 students */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-semibold text-gray-700 mb-3">🏆 Top Students</h2>
                {stats.topStudents?.length > 0 ? (
                  <ol className="space-y-2 text-sm">
                    {stats.topStudents.map((entry, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>
                          <span className="font-bold text-blue-600 mr-2">#{entry.schoolRank ?? i + 1}</span>
                          {entry.student?.firstName} {entry.student?.lastName}
                        </span>
                        <span className="text-gray-500">{entry.averageScore?.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-400 text-sm">No results calculated yet.</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  ['📅 Academic Years', '/admin/academic-years'],
                  ['👨🏫 Teachers',     '/admin/teachers'],
                  ['👥 Students',       '/admin/students'],
                  ['📋 Assignments',    '/admin/teaching-assignments'],
                  ['📝 Marks',          '/admin/marks'],
                  ['📈 Results',        '/admin/results'],
                ].map(([label, path]) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
