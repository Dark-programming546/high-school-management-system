import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { teachingAssignmentService, teacherService, subjectService, classService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function TeachingAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ teacherId: '', subjectId: '', classId: '' });

  const load = async () => {
    try {
      setLoading(true);
      const [a, t, s, c] = await Promise.all([
        teachingAssignmentService.getAll(),
        teacherService.getAll(),
        subjectService.getAll(),
        classService.getAll(),
      ]);
      setAssignments(a.assignments || []);
      setTeachers(t.teachers || []);
      setSubjects(s.subjects || []);
      setClasses(c.classes || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.teacherId || !form.subjectId || !form.classId) return setError('All fields are required');
    try {
      setSaving(true);
      await teachingAssignmentService.create(form);
      setSuccess('Assignment created');
      setModal(false);
      setForm({ teacherId: '', subjectId: '', classId: '' });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await teachingAssignmentService.delete(id);
      setSuccess('Assignment removed');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const sel = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  const columns = [
    {
      key: 'teacherId',
      label: 'Teacher',
      render: (v) => v ? `${v.firstName} ${v.lastName} (${v.employeeId})` : '—',
    },
    {
      key: 'subjectId',
      label: 'Subject',
      render: (v) => v ? `${v.name} [${v.code}]` : '—',
    },
    {
      key: 'classId',
      label: 'Class',
      render: (v) => v ? `${v.name} (Grade ${v.grade})` : '—',
    },
    {
      key: 'academicYearId',
      label: 'Year',
      render: (v) => v?.name || '—',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs ${v !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {v !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Teaching Assignments</h1>
          <Button onClick={() => setModal(true)}>+ New Assignment</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white rounded-lg border border-gray-200">
          {loading
            ? <Loading />
            : assignments.length === 0
              ? <EmptyState message="No teaching assignments yet." />
              : <Table columns={columns} data={assignments} onDelete={handleDelete} />
          }
        </div>
      </div>

      <Modal isOpen={modal} title="New Teaching Assignment" onClose={() => setModal(false)} onSubmit={handleSubmit} submitText={saving ? 'Saving…' : 'Create'}>
        <p className="text-sm text-gray-500 mb-3">Assigns a teacher to teach a subject in a class for the active academic year.</p>
        <FormGroup label="Teacher">
          <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} className={sel}>
            <option value="">Select teacher</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName} — {t.employeeId}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Subject">
          <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className={sel}>
            <option value="">Select subject</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} [{s.code}]</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Class">
          <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} className={sel}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}</option>)}
          </select>
        </FormGroup>
      </Modal>
    </AdminLayout>
  );
}
