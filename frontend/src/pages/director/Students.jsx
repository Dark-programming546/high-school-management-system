import { useState, useEffect, useCallback } from 'react';
import DirectorLayout from '../../components/DirectorLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState } from '../../components/UI.jsx';
import { studentService } from '../../services/index.js';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';
import { GRADES } from '../../utils/constants.js';

const STATUS_COLORS = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-600',
  GRADUATED: 'bg-blue-100 text-blue-700',
};

export default function DirectorStudents() {
  const [students, setStudents]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search)      params.search = search;
      if (filterGrade) params.grade  = filterGrade;
      const data = await studentService.getAll(params);
      setStudents(data.students || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, filterGrade]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'firstName',    label: 'First Name' },
    { key: 'lastName',     label: 'Last Name'  },
    { key: 'currentGrade', label: 'Grade'      },
    { key: 'stream',       label: 'Stream'     },
    { key: 'gender',       label: 'Gender'     },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>,
    },
    { key: 'createdAt', label: 'Registered', render: v => formatDate(v) },
  ];

  return (
    <DirectorLayout>
      <div className="max-w-6xl">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Read Only</span>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="flex flex-wrap gap-3 mb-4">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name…" className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-48" />
          <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded text-sm">
            <option value="">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? <Loading /> : students.length === 0 ? <EmptyState message="No students found." /> : <Table columns={columns} data={students} />}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
            <span>Page {pagination.currentPage} of {pagination.totalPages} — {pagination.totalStudents} students</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </DirectorLayout>
  );
}
