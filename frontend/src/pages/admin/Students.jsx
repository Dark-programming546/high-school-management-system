import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { studentService } from '../../services/index.js';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';
import { GRADES, STREAMS } from '../../utils/constants.js';

const BLANK     = { firstName: '', lastName: '', gender: 'MALE', dateOfBirth: '', phone: '', currentGrade: '', stream: 'NONE' };
const BLANK_ACC = { username: '', password: '' };
const STATUS_COLORS = { PENDING: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-600', GRADUATED: 'bg-blue-100 text-blue-700' };

export default function StudentsPage() {
  const [students, setStudents]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Register modal
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(BLANK);

  // Account modal
  const [accModal, setAccModal]         = useState(false);
  const [accStudentId, setAccStudentId] = useState(null);
  const [accForm, setAccForm]           = useState(BLANK_ACC);

  // Filters
  const [search, setSearch]           = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search)       params.search = search;
      if (filterGrade)  params.grade  = filterGrade;
      if (filterStatus) params.registrationStatus = filterStatus;
      const data = await studentService.getAll(params);
      setStudents(data.students || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, filterGrade, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.currentGrade)
      return setError('First name, last name, and grade are required');
    try {
      setSaving(true);
      await studentService.create({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        gender: form.gender, dateOfBirth: form.dateOfBirth || undefined,
        phone: form.phone.trim() || undefined,
        currentGrade: +form.currentGrade, stream: form.stream,
      });
      setSuccess('Student registered');
      setModal(false); setForm(BLANK); load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await studentService.updateStatus(id, { status });
      setSuccess(`Student marked as ${status}`); load();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const openAccModal = (id) => {
    setAccStudentId(id); setAccForm(BLANK_ACC); setAccModal(true);
  };

  const handleCreateAccount = async () => {
    if (!accForm.username.trim() || !accForm.password.trim())
      return setError('Username and password are required');
    if (accForm.password.length < 6)
      return setError('Password must be at least 6 characters');
    try {
      setSaving(true);
      await studentService.createAccount(accStudentId, {
        username: accForm.username.trim(), password: accForm.password,
      });
      setSuccess('Student account created'); setAccModal(false); load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    { key: 'firstName',    label: 'First Name' },
    { key: 'lastName',     label: 'Last Name'  },
    { key: 'currentGrade', label: 'Grade'      },
    { key: 'stream',       label: 'Stream'     },
    { key: 'gender',       label: 'Gender'     },
    {
      key: 'username',
      label: 'Login Account',
      render: (v, row) => v
        ? <span className="text-xs text-green-600 font-medium">✓ {v}</span>
        : <button onClick={() => openAccModal(row._id)} className="text-xs text-blue-600 hover:underline font-medium">Create Account</button>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>,
    },
    {
      key: '_id',
      label: 'Approval',
      render: (id, row) => row.status === 'PENDING' && (
        <div className="flex gap-2">
          <button onClick={() => handleStatusChange(id, 'APPROVED')} className="text-xs text-green-600 hover:underline">Approve</button>
          <button onClick={() => handleStatusChange(id, 'REJECTED')} className="text-xs text-red-600 hover:underline">Reject</button>
        </div>
      ),
    },
    { key: 'createdAt', label: 'Registered', render: v => formatDate(v) },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <Button onClick={() => setModal(true)}>+ Register Student</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="flex flex-wrap gap-3 mb-4">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name…" className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded text-sm">
            <option value="">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded text-sm">
            <option value="">All Status</option>
            {['PENDING','APPROVED','REJECTED','GRADUATED'].map(s => <option key={s} value={s}>{s}</option>)}
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

      {/* Register Student */}
      <Modal isOpen={modal} title="Register Student" onClose={() => { setModal(false); setForm(BLANK); }} onSubmit={handleCreate} submitText={saving ? 'Saving…' : 'Register'}>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="First Name"><input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} autoFocus /></FormGroup>
          <FormGroup label="Last Name"><input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} /></FormGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Grade">
            <select value={form.currentGrade} onChange={e => setForm({ ...form, currentGrade: e.target.value })} className={inp}>
              <option value="">Select</option>
              {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Stream">
            <select value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })} className={inp}>
              {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Gender">
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={inp}>
              <option value="MALE">Male</option><option value="FEMALE">Female</option>
            </select>
          </FormGroup>
          <FormGroup label="Date of Birth"><input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className={inp} /></FormGroup>
        </div>
        <FormGroup label="Phone"><input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} /></FormGroup>
      </Modal>

      {/* Create Login Account */}
      <Modal isOpen={accModal} title="Create Student Login Account" onClose={() => setAccModal(false)} onSubmit={handleCreateAccount} submitText={saving ? 'Creating…' : 'Create Account'}>
        <p className="text-sm text-gray-500 mb-3">Set a username and temporary password for the student. They must change it on first login.</p>
        <FormGroup label="Username"><input type="text" value={accForm.username} onChange={e => setAccForm({ ...accForm, username: e.target.value })} className={inp} autoFocus /></FormGroup>
        <FormGroup label="Temporary Password"><input type="password" value={accForm.password} onChange={e => setAccForm({ ...accForm, password: e.target.value })} className={inp} /></FormGroup>
      </Modal>
    </AdminLayout>
  );
}
