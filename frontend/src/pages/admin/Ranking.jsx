import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Button, FormGroup } from '../../components/UI.jsx';
import { rankingService, resultService, classService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function RankingPage() {
  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [r, c, t] = await Promise.all([
        resultService.getAll(),
        classService.getAll(),
        rankingService.getTop3(),
      ]);
      setResults(r.results || []);
      setClasses(c.classes || []);
      setTop3(t.topStudents || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSchoolRanking = async () => {
    try {
      setRunning(true);
      await rankingService.schoolRanking();
      setSuccess('School ranking calculated');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  const handleClassRanking = async () => {
    if (!selectedClass) return setError('Select a class first');
    try {
      setRunning(true);
      await rankingService.classRanking(selectedClass);
      setSuccess('Class ranking calculated');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    { key: 'schoolRank', label: 'School Rank', render: v => v ?? '—' },
    { key: 'classRank',  label: 'Class Rank',  render: v => v ?? '—' },
    {
      key: 'studentId',
      label: 'Student',
      render: v => v ? `${v.firstName} ${v.lastName}` : '—',
    },
    {
      key: 'classId',
      label: 'Class',
      render: v => v ? v.name : '—',
    },
    { key: 'averageScore', label: 'Average %', render: v => v?.toFixed(2) },
    {
      key: 'status',
      label: 'Status',
      render: v => {
        const c = { PASS: 'bg-green-100 text-green-700', FAIL: 'bg-red-100 text-red-600', REPEAT: 'bg-yellow-100 text-yellow-700' }[v] || 'bg-gray-100';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{v}</span>;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Ranking</h1>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <Button onClick={handleSchoolRanking} disabled={running}>
            {running ? 'Running…' : '🏫 Calculate School Ranking'}
          </Button>
          <div className="flex items-end gap-2">
            <FormGroup label="Class Ranking">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}</option>)}
              </select>
            </FormGroup>
            <button
              onClick={handleClassRanking}
              disabled={running}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50 transition"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
            <h2 className="font-bold text-yellow-800 mb-3">🏆 Top 3 Students (School-wide)</h2>
            <div className="flex gap-4">
              {top3.map((entry, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl">{['🥇','🥈','🥉'][i]}</div>
                  <div className="font-semibold text-gray-800 text-sm">{entry.student?.firstName} {entry.student?.lastName}</div>
                  <div className="text-xs text-gray-500">{entry.averageScore?.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full ranking table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : results.length === 0
              ? <EmptyState message="No results to rank yet. Calculate results first." />
              : <Table columns={columns} data={results} />
          }
        </div>
      </div>
    </AdminLayout>
  );
}
