import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { subjectService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

const BLANK = { name: '', code: '' };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);

  const load = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data.subjects || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { name: item.name, code: item.code } : BLANK);
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setForm(BLANK); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) return setError('Name and code are required');
    try {
      setSaving(true);
      if (editing) {
        await subjectService.update(editing._id, { name: form.name.trim(), code: form.code.trim().toUpperCase() });
        setSuccess('Subject updated');
      } else {
        await subjectService.create({ name: form.name.trim(), code: form.code.trim().toUpperCase() });
        setSuccess('Subject created');
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
    if (!window.confirm('Delete this subject?')) return;
    try {
      await subjectService.delete(id);
      setSuccess('Subject deleted');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    { key: 'name', label: 'Subject Name' },
    { key: 'code', label: 'Code' },
    {
      key: 'isActive',
      label: 'Status',
      render: v => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
          <Button onClick={() => openModal()}>+ New Subject</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : subjects.length === 0
              ? <EmptyState message="No subjects yet." />
              : <Table columns={columns} data={subjects} onEdit={openModal} onDelete={handleDelete} />
          }
        </div>
      </div>

      <Modal
        isOpen={modal}
        title={editing ? 'Edit Subject' : 'New Subject'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={saving ? 'Saving…' : editing ? 'Update' : 'Create'}
      >
        <FormGroup label="Subject Name">
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" className={inp} autoFocus />
        </FormGroup>
        <FormGroup label="Subject Code">
          <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH" className={inp} />
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
