import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { teacherService } from '../../services/index.js';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';

const BLANK     = { firstName: '', lastName: '', employeeId: '', phone: '', email: '' };
const BLANK_ACC = { username: '', password: '' };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(false);
  const [accModal, setAccModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [accForm, setAccForm] = useState(BLANK_ACC);
  const [accTeacherId, setAccTeacherId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data.teachers || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { firstName: item.firstName, lastName: item.lastName, employeeId: item.employeeId, phone: item.phone || '', email: item.email || '' } : BLANK);
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setForm(BLANK); };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.employeeId.trim()) return setError('First name, last name, and employee ID are required');
    try {
      setSaving(true);
      const payload = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), employeeId: form.employeeId.trim(), phone: form.phone.trim(), email: form.email.trim() };
      if (editing) {
        await teacherService.update(editing._id, payload);
        setSuccess('Teacher updated');
      } else {
        await teacherService.create(payload);
        setSuccess('Teacher created');
      }
      closeModal();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await teacherService.delete(id);
      setSuccess('Teacher deleted');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openAccModal = (id) => { setAccTeacherId(id); setAccForm(BLANK_ACC); setAccModal(true); };

  const handleCreateAccount = async () => {
    if (!accForm.username.trim() || !accForm.password.trim()) return setError('Username and password are required');
    try {
      setSaving(true);
      await teacherService.createAccount(accTeacherId, { username: accForm.username.trim(), password: accForm.password });
      setSuccess('Teacher account created');
      setAccModal(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    { key: 'firstName',  label: 'First Name'  },
    { key: 'lastName',   label: 'Last Name'   },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'email',      label: 'Email'       },
    { key: 'phone',      label: 'Phone'       },
    {
      key: 'username',
      label: 'Account',
      render: (v, row) =>
        v ? (
          <span className="text-xs text-green-600 font-medium">✓ {v}</span>
        ) : (
          <button onClick={() => openAccModal(row._id)} className="text-xs text-blue-600 hover:underline">
            Create Account
          </button>
        ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: v => (
        <span className={`px-2 py-0.5 rounded-full text-xs ${v !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: v => formatDate(v) },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <Button onClick={() => openModal()}>+ New Teacher</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : teachers.length === 0
              ? <EmptyState message="No teachers yet." />
              : <Table columns={columns} data={teachers} onEdit={openModal} onDelete={handleDelete} />
          }
        </div>
      </div>

      {/* Add / Edit teacher */}
      <Modal isOpen={modal} title={editing ? 'Edit Teacher' : 'New Teacher'} onClose={closeModal} onSubmit={handleSubmit} submitText={saving ? 'Saving…' : editing ? 'Update' : 'Create'}>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="First Name">
            <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} autoFocus />
          </FormGroup>
          <FormGroup label="Last Name">
            <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} />
          </FormGroup>
        </div>
        <FormGroup label="Employee ID">
          <input type="text" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. EMP-001" className={inp} />
        </FormGroup>
        <FormGroup label="Email">
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inp} />
        </FormGroup>
        <FormGroup label="Phone">
          <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} />
        </FormGroup>
      </Modal>

      {/* Create login account */}
      <Modal isOpen={accModal} title="Create Teacher Login Account" onClose={() => setAccModal(false)} onSubmit={handleCreateAccount} submitText={saving ? 'Creating…' : 'Create Account'}>
        <p className="text-sm text-gray-500 mb-3">This gives the teacher a username and password to log in.</p>
        <FormGroup label="Username">
          <input type="text" value={accForm.username} onChange={e => setAccForm({ ...accForm, username: e.target.value })} className={inp} autoFocus />
        </FormGroup>
        <FormGroup label="Password">
          <input type="password" value={accForm.password} onChange={e => setAccForm({ ...accForm, password: e.target.value })} className={inp} />
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
