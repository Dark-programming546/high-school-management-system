import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import TeacherLayout from '../../components/TeacherLayout.jsx';
import Table from '../../components/Table.jsx';
import { Loading, Alert, EmptyState } from '../../components/UI.jsx';
import { teachingAssignmentService, resultService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function TeacherResults() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    teachingAssignmentService.getAll()
      .then(data => {
        const all = data.assignments || [];
        const mine = all.filter(a =>
          a.teacherId?._id === user?.id || a.teacherId === user?.id
        );
        // unique classes
        const seen = new Set();
        const classes = [];
        mine.forEach(a => {
          const id = a.classId?._id;
          if (id && !seen.has(id)) { seen.add(id); classes.push(a.classId); }
        });
        setAssignments(classes);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedClass) { setResults([]); return; }
    setLoadingResults(true);
    resultService.getAll()
      .then(data => {
        const all = data.results || [];
        const filtered = all.filter(r =>
          r.classId === selectedClass || r.classId?._id === selectedClass
        );
        setResults(filtered);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoadingResults(false));
  }, [selectedClass]);

  const columns = [
    { key: 'student',      label: 'Student',    render: v => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'totalScore',   label: 'Total Score' },
    { key: 'averageScore', label: 'Average',    render: v => v != null ? `${v.toFixed(1)}%` : '—' },
    {
      key: 'status',
      label: 'Status',
      render: v => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v}
        </span>
      ),
    },
  ];

  return (
    <TeacherLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">View Results</h1>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {loading ? <Loading /> : (
          <>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
              >
                <option value="">Select a class</option>
                {assignments.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} — Grade {c.grade}
                  </option>
                ))}
              </select>
            </div>

            {!selectedClass && <EmptyState message="Select a class above to view results." />}
            {selectedClass && loadingResults && <Loading />}
            {selectedClass && !loadingResults && results.length === 0 && (
              <EmptyState message="No results found for this class. Results may not have been calculated yet." />
            )}
            {selectedClass && !loadingResults && results.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <Table columns={columns} data={results} />
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
