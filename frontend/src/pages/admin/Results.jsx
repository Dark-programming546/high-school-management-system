import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { resultService, studentService, classService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

const STATUS_COLORS = {
  PASS:      'bg-green-100 text-green-700',
  FAIL:      'bg-red-100 text-red-600',
  REPEAT:    'bg-yellow-100 text-yellow-700',
  GRADUATED: 'bg-blue-100 text-blue-700',
};

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(false);
  const [calcForm, setCalcForm] = useState({ studentId: '', classId: '' });

  const load = async () => {
    try {
      setLoading(true);
      const [r, s, c] = await Promise.all([
        resultService.getAll(),
        studentService.getAll({ limit: 100 }),
        classService.getAll(),
      ]);
      setResults(r.results || []);
      setStudents(s.students || []);
      setClasses(c.classes || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCalculate = async () => {
    if (!calcForm.studentId || !calcForm.classId) return setError('Student and class are required');
    try {
      setSaving(true);
      await resultService.calculate(calcForm);
      setSuccess('Result calculated successfully');
      setModal(false);
      setCalcForm({ studentId: '', classId: '' });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const sel = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
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
    { key: 'totalScore',      label: 'Total'   },
    { key: 'averageScore',    label: 'Average', render: v => `${v?.toFixed(1)}%` },
    { key: 'failedSubjectsCount', label: 'Failed Subjects' },
    { key: 'classRank',  label: 'Class Rank'  },
    { key: 'schoolRank', label: 'School Rank' },
    {
      key: 'status',
      label: 'Status',
      render: v => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100'}`}>{v}</span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Results</h1>
          <Button onClick={() => setModal(true)}>⚙ Calculate Result</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : results.length === 0
              ? <EmptyState message="No results yet. Calculate one above." />
              : <Table columns={columns} data={results} />
          }
        </div>
      </div>

      <Modal isOpen={modal} title="Calculate Student Result" onClose={() => setModal(false)} onSubmit={handleCalculate} submitText={saving ? 'Calculating…' : 'Calculate'}>
        <p className="text-sm text-gray-500 mb-3">This computes the final result for a student based on all their submitted marks.</p>
        <FormGroup label="Student">
          <select value={calcForm.studentId} onChange={e => setCalcForm({ ...calcForm, studentId: e.target.value })} className={sel}>
            <option value="">Select student</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} (Grade {s.currentGrade})</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Class">
          <select value={calcForm.classId} onChange={e => setCalcForm({ ...calcForm, classId: e.target.value })} className={sel}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}</option>)}
          </select>
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
