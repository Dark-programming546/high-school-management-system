import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { academicYearService } from '../../services/index.js';
import { getErrorMessage, formatDate } from '../../utils/helpers.js';

export default function AcademicYearsPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await academicYearService.getAll();
      setYears(data.academicYears || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return setError('Name is required');
    try {
      setSaving(true);
      await academicYearService.create({ name: name.trim() });
      setSuccess('Academic year created');
      setShowModal(false);
      setName('');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await academicYearService.activate(id);
      setSuccess('Academic year activated');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {v ? '● Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (v) => formatDate(v) },
    {
      key: '_id',
      label: 'Actions',
      render: (id, row) => !row.isActive && (
        <button
          onClick={() => handleActivate(id)}
          className="text-xs text-green-600 hover:text-green-800 font-medium"
        >
          Set Active
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Academic Years</h1>
          <Button onClick={() => setShowModal(true)}>+ New Year</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : years.length === 0
              ? <EmptyState message="No academic years yet. Create one to get started." />
              : <Table columns={columns} data={years} />
          }
        </div>
      </div>

      <Modal
        isOpen={showModal}
        title="New Academic Year"
        onClose={() => { setShowModal(false); setName(''); }}
        onSubmit={handleCreate}
        submitText={saving ? 'Creating...' : 'Create'}
      >
        <FormGroup label="Year Name (e.g. 2024/2025)">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="2024/2025"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
