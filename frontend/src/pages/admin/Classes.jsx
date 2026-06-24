import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { classService } from '../../services/index.js';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';
import { GRADES, STREAMS } from '../../utils/constants.js';

const BLANK = { name: '', grade: '', stream: 'NONE', capacity: '' };

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
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
      const data = await classService.getAll();
      setClasses(data.classes || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { name: item.name, grade: item.grade, stream: item.stream, capacity: item.capacity } : BLANK);
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setForm(BLANK); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.grade || !form.capacity) return setError('All fields are required');
    const payload = { name: form.name.trim(), grade: +form.grade, stream: form.stream, capacity: +form.capacity };
    try {
      setSaving(true);
      if (editing) {
        await classService.update(editing._id, payload);
        setSuccess('Class updated');
      } else {
        await classService.create(payload);
        setSuccess('Class created');
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
    if (!window.confirm('Delete this class?')) return;
    try {
      await classService.delete(id);
      setSuccess('Class deleted');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    { key: 'name',      label: 'Class'    },
    { key: 'grade',     label: 'Grade'    },
    { key: 'stream',    label: 'Stream'   },
    { key: 'capacity',  label: 'Capacity' },
    { key: 'createdAt', label: 'Created', render: v => formatDate(v) },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
          <Button onClick={() => openModal()}>+ New Class</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : classes.length === 0
              ? <EmptyState message="No classes yet." />
              : <Table columns={columns} data={classes} onEdit={openModal} onDelete={handleDelete} />
          }
        </div>
      </div>

      <Modal
        isOpen={modal}
        title={editing ? 'Edit Class' : 'New Class'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={saving ? 'Saving…' : editing ? 'Update' : 'Create'}
      >
        <FormGroup label="Class Name">
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 9A" className={inp} autoFocus />
        </FormGroup>
        <FormGroup label="Grade">
          <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className={inp}>
            <option value="">Select grade</option>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Stream">
          <select value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })} className={inp}>
            {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Capacity">
          <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="60" min="1" className={inp} />
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
