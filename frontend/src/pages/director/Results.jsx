import { useState, useEffect } from 'react';
import DirectorLayout from '../../components/DirectorLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState } from '../../components/UI.jsx';
import { resultService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function DirectorResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    resultService.getAll()
      .then(data => setResults(data.results || []))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'student',      label: 'Student',    render: v => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'totalScore',   label: 'Total Score' },
    { key: 'averageScore', label: 'Average',    render: v => v != null ? `${v.toFixed(1)}%` : '—' },
    {
      key: 'status',
      label: 'Status',
      render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{v}</span>,
    },
  ];

  return (
    <DirectorLayout>
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Results</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Read Only</span>
        </div>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? <Loading /> : results.length === 0 ? <EmptyState message="No results calculated yet." /> : <Table columns={columns} data={results} />}
        </div>
      </div>
    </DirectorLayout>
  );
}
