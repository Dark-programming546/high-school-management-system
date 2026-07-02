import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import TeacherLayout from '../../components/TeacherLayout.jsx';
import ChangePassword from '../../components/ChangePassword.jsx';
import { Loading, Alert } from '../../components/UI.jsx';
import { teachingAssignmentService } from '../../services/index.js';
import apiClient from '../../api/client.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function TeacherDashboard() {
  const { user, logout, clearMustChangePassword } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const handleChangePassword = async (data) => {
    await apiClient.patch('/teacher-auth/change-password', data);
    clearMustChangePassword();
  };

  useEffect(() => {
    teachingAssignmentService.getAll()
      .then(data => setAssignments(data.assignments || []))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // forced password change screen
  if (user?.mustChangePassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between">
          <span className="font-bold text-gray-800 text-lg">🎓 Teacher Portal</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded">Logout</button>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <ChangePassword forced onSubmit={handleChangePassword} />
        </main>
      </div>
    );
  }

  // filter assignments that belong to this teacher
  const myAssignments = assignments.filter(a => a.teacherId?._id === user?.id || a.teacherId === user?.id);

  const QUICK_ACTIONS = [
    { icon: '📚', label: 'My Assignments', desc: `${myAssignments.length} subject${myAssignments.length !== 1 ? 's' : ''} assigned`, path: '/teacher/assignments', color: 'border-yellow-200 hover:bg-yellow-50' },
    { icon: '📝', label: 'Enter Marks',    desc: 'Submit student marks for your subjects', path: '/teacher/marks',       color: 'border-blue-200   hover:bg-blue-50'   },
    { icon: '📈', label: 'View Results',   desc: 'Check calculated results for your students', path: '/teacher/results',  color: 'border-green-200  hover:bg-green-50'  },
    { icon: '🏆', label: 'Class Ranking',  desc: 'See the ranking of students in your class', path: '/teacher/ranking',  color: 'border-purple-200 hover:bg-purple-50' },
  ];

  return (
    <TeacherLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>

        {error   && <Alert type="error" message={error} onClose={() => setError('')} />}
        {loading && <Loading />}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {QUICK_ACTIONS.map(({ icon, label, desc, path, color }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`bg-white rounded-lg border ${color} p-5 text-left transition cursor-pointer w-full`}
                >
                  <h2 className="font-semibold text-gray-700 mb-1">{icon} {label}</h2>
                  <p className="text-sm text-gray-500">{desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <ChangePassword onSubmit={handleChangePassword} />
            </div>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
