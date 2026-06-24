import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { assessmentSchemeService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';
import { GRADES } from '../../utils/constants.js';

const BLANK = { grade: '', assignmentWeight: 10, quizWeight: 10, midWeight: 20 };

export default function AssessmentSchemesPage() {
  const [schemes, setSchemes] = useState([]);
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
      const data = await assessmentSchemeService.getAll();
      setSchemes(data.schemes || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item
      ? { grade: item.grade, assignmentWeight: item.assignmentWeight, quizWeight: item.quizWeight, midWeight: item.midWeight }
      : BLANK
    );
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setForm(BLANK); };

  const total = +form.assignmentWeight + +form.quizWeight + +form.midWeight + 60;

  const handleSubmit = async () => {
    if (!editing && !form.grade) return setError('Grade is required');
    if (total !== 100) return setError(`Weights must total 100 (currently ${total}). Final is fixed at 60.`);
    try {
      setSaving(true);
      const payload = {
        assignmentWeight: +form.assignmentWeight,
        quizWeight:       +form.quizWeight,
        midWeight:        +form.midWeight,
      };
      if (editing) {
        await assessmentSchemeService.update(editing._id, payload);
        setSuccess('Scheme updated');
      } else {
        await assessmentSchemeService.create({ ...payload, grade: +form.grade });
        setSuccess('Scheme created');
      }
      closeModal();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    { key: 'grade',            label: 'Grade' },
    { key: 'assignmentWeight', label: 'Assignment %' },
    { key: 'quizWeight',       label: 'Quiz %' },
    { key: 'midWeight',        label: 'Mid %' },
    { key: 'finalWeight',      label: 'Final % (fixed)' },
    {
      key: 'academicYearId',
      label: 'Year',
      render: v => v?.name || '—',
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Assessment Schemes</h1>
          <Button onClick={() => openModal()}>+ New Scheme</Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded mb-4">
          Assignment + Quiz + Mid + Final (60, fixed) must equal <strong>100</strong>.
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : schemes.length === 0
              ? <EmptyState message="No assessment schemes yet." />
              : <Table columns={columns} data={schemes} onEdit={openModal} />
          }
        </div>
      </div>

      <Modal isOpen={modal} title={editing ? 'Edit Scheme' : 'New Assessment Scheme'} onClose={closeModal} onSubmit={handleSubmit} submitText={saving ? 'Saving…' : editing ? 'Update' : 'Create'}>
        {!editing && (
          <FormGroup label="Grade">
            <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className={inp}>
              <option value="">Select grade</option>
              {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </FormGroup>
        )}
        <div className="grid grid-cols-3 gap-3">
          <FormGroup label="Assignment %">
            <input type="number" value={form.assignmentWeight} onChange={e => setForm({ ...form, assignmentWeight: e.target.value })} min="0" max="40" className={inp} />
          </FormGroup>
          <FormGroup label="Quiz %">
            <input type="number" value={form.quizWeight} onChange={e => setForm({ ...form, quizWeight: e.target.value })} min="0" max="40" className={inp} />
          </FormGroup>
          <FormGroup label="Mid %">
            <input type="number" value={form.midWeight} onChange={e => setForm({ ...form, midWeight: e.target.value })} min="0" max="40" className={inp} />
          </FormGroup>
        </div>
        <div className="bg-gray-50 border rounded px-3 py-2 text-sm mt-1">
          <span className="text-gray-500">Final (fixed): <strong>60%</strong></span>
          &nbsp;|&nbsp;
          <span className={total === 100 ? 'text-green-600' : 'text-red-600'}>
            Total: <strong>{total}%</strong> {total === 100 ? '✓' : '✗ must be 100'}
          </span>
        </div>
      </Modal>
    </AdminLayout>
  );
}
