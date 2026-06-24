import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { staffService } from '../../services/index.js';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';

const ROLES = ['REGISTRAR', 'DIRECTOR', 'VICE_DIRECTOR'];
const ROLE_COLORS = {
  REGISTRAR:     'bg-green-100 text-green-700',
  DIRECTOR:      'bg-purple-100 text-purple-700',
  VICE_DIRECTOR: 'bg-indigo-100 text-indigo-700',
};

const BLANK     = { username: '', password: '', role: 'REGISTRAR', firstName: '', lastName: '' };
const BLANK_PWD = { password: '' };

export default function StaffPage() {
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Create modal
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(BLANK);

  // Reset password modal
  const [pwdModal, setPwdModal]   = useState(false);
  const [pwdStaffId, setPwdStaffId] = useState(null);
  const [pwdForm, setPwdForm]     = useState(BLANK_PWD);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await staffService.getAll();
      setStaff(data.staff || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.username.trim())       return setError('Username is required');
    if (form.password.length < 6)    return setError('Password must be at least 6 characters');
    if (!ROLES.includes(form.role))  return setError('Please select a valid role');
    try {
      setSaving(true);
      await staffService.create({
        username:  form.username.trim().toLowerCase(),
        password:  form.password,
        role:      form.role,
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
      });
      setSuccess(`${form.role} account created successfully`);
      setModal(false);
      setForm(BLANK);
      load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete account "${username}"? This cannot be undone.`)) return;
    try {
      await staffService.delete(id);
      setSuccess('Staff account deleted');
      load();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const openPwdModal = (id) => { setPwdStaffId(id); setPwdForm(BLANK_PWD); setPwdModal(true); };

  const handleResetPassword = async () => {
    if (pwdForm.password.length < 6) return setError('Password must be at least 6 characters');
    try {
      setSaving(true);
      await staffService.resetPassword(pwdStaffId, { password: pwdForm.password });
      setSuccess('Password reset successfully');
      setPwdModal(false);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    { key: 'firstName', label: 'First Name', render: v => v || '—' },
    { key: 'lastName',  label: 'Last Name',  render: v => v || '—' },
    { key: 'username',  label: 'Username'   },
    {
      key: 'role',
      label: 'Role',
      render: v => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[v] || 'bg-gray-100 text-gray-600'}`}>
          {v.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'lastLogin', label: 'Last Login', render: v => v ? formatDate(v) : 'Never' },
    {
      key: '_id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-3">
          <button onClick={() => openPwdModal(id)} className="text-xs text-blue-600 hover:underline">
            Reset Password
          </button>
          <button onClick={() => handleDelete(id, row.username)} className="text-xs text-red-600 hover:underline">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Staff Accounts</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage Registrar, Director, and Vice Director accounts</p>
          </div>
          <Button onClick={() => { setForm(BLANK); setModal(true); }}>+ Create Staff Account</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : staff.length === 0
            ? <EmptyState message="No staff accounts yet. Create the first one." />
            : <Table columns={columns} data={staff} />
          }
        </div>
      </div>

      {/* Create Staff Account */}
      <Modal
        isOpen={modal}
        title="Create Staff Account"
        onClose={() => { setModal(false); setForm(BLANK); }}
        onSubmit={handleCreate}
        submitText={saving ? 'Creating…' : 'Create Account'}
      >
        <FormGroup label="Role">
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inp}>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
        </FormGroup>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="First Name">
            <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} placeholder="Optional" />
          </FormGroup>
          <FormGroup label="Last Name">
            <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} placeholder="Optional" />
          </FormGroup>
        </div>
        <FormGroup label="Username">
          <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className={inp} autoFocus />
        </FormGroup>
        <FormGroup label="Password">
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inp} />
        </FormGroup>
        <p className="text-xs text-gray-400 mt-1">Minimum 6 characters. Share credentials with the staff member after creation.</p>
      </Modal>

      {/* Reset Password */}
      <Modal
        isOpen={pwdModal}
        title="Reset Staff Password"
        onClose={() => setPwdModal(false)}
        onSubmit={handleResetPassword}
        submitText={saving ? 'Resetting…' : 'Reset Password'}
      >
        <p className="text-sm text-gray-500 mb-3">Enter a new password for this staff account.</p>
        <FormGroup label="New Password">
          <input type="password" value={pwdForm.password} onChange={e => setPwdForm({ password: e.target.value })} className={inp} autoFocus />
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
