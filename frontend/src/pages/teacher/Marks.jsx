import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import TeacherLayout from '../../components/TeacherLayout.jsx';
import { Loading, Alert, EmptyState } from '../../components/UI.jsx';
import { teachingAssignmentService, studentService, markService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function TeacherMarks() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [semester, setSemester]   = useState(1);
  const [students, setStudents]   = useState([]);
  const [marks, setMarks]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    teachingAssignmentService.getAll()
      .then(data => {
        const all = data.assignments || [];
        const mine = all.filter(a =>
          a.teacherId?._id === user?.id || a.teacherId === user?.id
        );
        setAssignments(mine);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedAssignment) { setStudents([]); return; }
    const assignment = assignments.find(a => a._id === selectedAssignment);
    if (!assignment) return;
    setLoadingStudents(true);
    studentService.getAll({ grade: assignment.classId?.grade, limit: 100 })
      .then(data => {
        const list = (data.students || []).filter(s =>
          s.currentClassId === assignment.classId?._id ||
          s.currentClassId?._id === assignment.classId?._id
        );
        setStudents(list);
        // init marks state
        const init = {};
        list.forEach(s => {
          init[s._id] = { assignment: '', quiz: '', mid: '', final: '' };
        });
        setMarks(init);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoadingStudents(false));
  }, [selectedAssignment, assignments]);

  const assignment = assignments.find(a => a._id === selectedAssignment);

  const setMark = (studentId, field, value) => {
    setMarks(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const handleSubmitAll = async () => {
    if (!selectedAssignment) return setError('Select an assignment first');
    const invalid = students.find(s => {
      const m = marks[s._id];
      return ['assignment','quiz','mid','final'].some(f => m[f] === '' || isNaN(Number(m[f])));
    });
    if (invalid) return setError('Fill in all score fields before submitting');

    try {
      setSaving(true);
      await Promise.all(students.map(s => {
        const m = marks[s._id];
        return markService.createOrUpdate({
          studentId:  s._id,
          subjectId:  assignment.subjectId?._id,
          classId:    assignment.classId?._id,
          semester,
          assignment: Number(m.assignment),
          quiz:       Number(m.quiz),
          mid:        Number(m.mid),
          final:      Number(m.final),
        });
      }));
      setSuccess(`Marks submitted for ${students.length} student(s)`);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const inp = 'w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <TeacherLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Enter Marks</h1>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {loading ? <Loading /> : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                <select
                  value={selectedAssignment}
                  onChange={e => setSelectedAssignment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
                >
                  <option value="">Select subject / class</option>
                  {assignments.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.subjectId?.name} — {a.classId?.name} (Grade {a.classId?.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
            </div>

            {!selectedAssignment && <EmptyState message="Select an assignment above to load students." />}

            {selectedAssignment && loadingStudents && <Loading />}

            {selectedAssignment && !loadingStudents && students.length === 0 && (
              <EmptyState message="No students found in this class. Make sure students are assigned to the class." />
            )}

            {selectedAssignment && !loadingStudents && students.length > 0 && (
              <>
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                        <th className="px-3 py-3 font-medium text-gray-600">Assignment<br/><span className="text-xs font-normal text-gray-400">/30</span></th>
                        <th className="px-3 py-3 font-medium text-gray-600">Quiz<br/><span className="text-xs font-normal text-gray-400">/10</span></th>
                        <th className="px-3 py-3 font-medium text-gray-600">Mid<br/><span className="text-xs font-normal text-gray-400">/30</span></th>
                        <th className="px-3 py-3 font-medium text-gray-600">Final<br/><span className="text-xs font-normal text-gray-400">/100</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-800">
                            {s.firstName} {s.lastName}
                          </td>
                          {['assignment','quiz','mid','final'].map(field => (
                            <td key={field} className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={marks[s._id]?.[field] ?? ''}
                                onChange={e => setMark(s._id, field, e.target.value)}
                                className={inp}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleSubmitAll}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded transition disabled:opacity-50"
                >
                  {saving ? 'Submitting…' : `Submit Marks for ${students.length} Student(s)`}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
