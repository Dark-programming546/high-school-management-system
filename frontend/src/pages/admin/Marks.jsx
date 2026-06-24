import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import Table from '../../components/Table.jsx';
import { Alert, Loading, EmptyState, Modal, Button, FormGroup } from '../../components/UI.jsx';
import { markService, studentService, subjectService, classService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

const BLANK_MARK = { studentId: '', subjectId: '', classId: '', semester: '1', assignment: '', quiz: '', mid: '', final: '' };

export default function MarksPage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK_MARK);

  useEffect(() => {
    Promise.all([
      studentService.getAll({ limit: 100 }),
      subjectService.getAll(),
      classService.getAll(),
    ]).then(([s, sub, c]) => {
      setStudents(s.students || []);
      setSubjects(sub.subjects || []);
      setClasses(c.classes || []);
    }).catch(err => setError(getErrorMessage(err)));
  }, []);

  const loadMarks = async (studentId) => {
    if (!studentId) return setMarks([]);
    try {
      setLoading(true);
      const data = await markService.getByStudent(studentId);
      setMarks(data.marks || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (id) => {
    setSelectedStudent(id);
    loadMarks(id);
  };

  const openModal = (prefillStudentId = '') => {
    setForm({ ...BLANK_MARK, studentId: prefillStudentId });
    setModal(true);
  };

  const handleSubmit = async () => {
    const { studentId, subjectId, classId, semester, assignment, quiz, mid, final: fin } = form;
    if (!studentId || !subjectId || !classId || !semester) return setError('Student, subject, class and semester are required');
    if ([assignment, quiz, mid, fin].some(v => v === '' || isNaN(+v))) return setError('All score fields are required (0–100)');
    try {
      setSaving(true);
      await markService.createOrUpdate({
        studentId, subjectId, classId,
        semester: +semester,
        assignment: +assignment,
        quiz: +quiz,
        mid: +mid,
        final: +fin,
      });
      setSuccess('Mark saved');
      setModal(false);
      setForm(BLANK_MARK);
      if (selectedStudent) loadMarks(selectedStudent);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
  const sel = inp;

  const columns = [
    { key: 'subjectId',  label: 'Subject',    render: v => v ? `${v.name} [${v.code}]` : '—' },
    { key: 'semester',   label: 'Semester'                                                     },
    { key: 'assignment', label: 'Assignment'                                                   },
    { key: 'quiz',       label: 'Quiz'                                                         },
    { key: 'mid',        label: 'Mid'                                                          },
    { key: 'final',      label: 'Final'                                                        },
    { key: 'total',      label: 'Total', render: v => <strong>{v}</strong>                     },
    {
      key: 'status',
      label: 'Status',
      render: v => {
        const c = { DRAFT: 'bg-gray-100 text-gray-600', SUBMITTED: 'bg-blue-100 text-blue-700', REVIEWED: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700', PUBLISHED: 'bg-purple-100 text-purple-700' }[v] || 'bg-gray-100';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{v}</span>;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Marks</h1>
          <Button onClick={() => openModal(selectedStudent)}>+ Enter Mark</Button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-gray-700">View marks for student:</label>
          <select
            value={selectedStudent}
            onChange={e => handleStudentChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select student —</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} (Grade {s.currentGrade})</option>)}
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {!selectedStudent
            ? <EmptyState message="Select a student above to view their marks." />
            : loading
              ? <Loading />
              : marks.length === 0
                ? <EmptyState message="No marks yet for this student." />
                : <Table columns={columns} data={marks} />
          }
        </div>
      </div>

      <Modal isOpen={modal} title="Enter / Update Mark" onClose={() => setModal(false)} onSubmit={handleSubmit} submitText={saving ? 'Saving…' : 'Save Mark'}>
        <FormGroup label="Student">
          <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className={sel}>
            <option value="">Select student</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </FormGroup>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Subject">
            <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className={sel}>
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Class">
            <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} className={sel}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} — Grade {c.grade}</option>)}
            </select>
          </FormGroup>
        </div>
        <FormGroup label="Semester">
          <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className={sel}>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </FormGroup>
        <div className="grid grid-cols-4 gap-2">
          {['assignment', 'quiz', 'mid', 'final'].map(field => (
            <FormGroup key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
              <input type="number" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} min="0" max="100" className={inp} />
            </FormGroup>
          ))}
        </div>
      </Modal>
    </AdminLayout>
  );
}
