import { useState, useEffect } from 'react';
import DirectorLayout from '../../components/DirectorLayout.jsx';
import { Alert, Loading, EmptyState } from '../../components/UI.jsx';
import { rankingService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function DirectorRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    rankingService.schoolRanking()
      .then(data => setRanking(data.ranking || []))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DirectorLayout>
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold text-gray-800">School Ranking</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Read Only</span>
        </div>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {loading && <Loading />}
        {!loading && ranking.length === 0 && <EmptyState message="No ranking data available." />}
        {!loading && ranking.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {ranking.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {entry.schoolRank ?? i + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {entry.student?.firstName} {entry.student?.lastName}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{entry.averageScore?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DirectorLayout>
  );
}
