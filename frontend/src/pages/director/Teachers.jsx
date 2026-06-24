import { useState, useEffect } from 'react';
import DirectorLayout from '../../components/DirectorLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState } from '../../components/UI.jsx';
import { teacherService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function DirectorTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    teacherService.getAll()
      .then(data => setTeachers(data.teachers || []))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName',  label: 'Last Name'  },
    { key: 'phone',     label: 'Phone'      },
    {
      key: 'isActive',
      label: 'Status',
      render: v => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{v ? 'Active' : 'Inactive'}</span>,
    },
  ];

  return (
    <DirectorLayout>
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Read Only</span>
        </div>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? <Loading /> : teachers.length === 0 ? <EmptyState message="No teachers found." /> : <Table columns={columns} data={teachers} />}
        </div>
      </div>
    </DirectorLayout>
  );
}
