import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import TeacherLayout from '../../components/TeacherLayout.jsx';
import Table from '../../components/Table.jsx';
import { Loading, Alert, EmptyState } from '../../components/UI.jsx';
import { teachingAssignmentService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function TeacherAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    teachingAssignmentService.getAll()
      .then(data => {
        const all = data.assignments || [];
        // filter to only this teacher's assignments
        const mine = all.filter(a =>
          a.teacherId?._id === user?.id || a.teacherId === user?.id
        );
        setAssignments(mine);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  const columns = [
    { key: 'subjectId', label: 'Subject', render: v => v?.name || '—' },
    { key: 'subjectId', label: 'Code',    render: v => v?.code || '—' },
    { key: 'classId',   label: 'Class',   render: v => v?.name || '—' },
    { key: 'classId',   label: 'Grade',   render: v => v?.grade ? `Grade ${v.grade}` : '—' },
    { key: 'classId',   label: 'Stream',  render: v => v?.stream || '—' },
    { key: 'academicYearId', label: 'Academic Year', render: v => v?.name || '—' },
  ];

  return (
    <TeacherLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Assignments</h1>
        <p className="text-sm text-gray-500 mb-5">Subjects and classes assigned to you this academic year.</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : assignments.length === 0
            ? <EmptyState message="No assignments found. Contact admin to assign you subjects." />
            : <Table columns={columns} data={assignments} />
          }
        </div>
      </div>
    </TeacherLayout>
  );
}
