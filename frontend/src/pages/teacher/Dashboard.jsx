import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../../components/ChangePassword.jsx';
import apiClient from '../../api/client.js';

export default function TeacherDashboard() {
  const { user, logout, clearMustChangePassword } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = async (data) => {
    await apiClient.patch('/teacher-auth/change-password', data);
    clearMustChangePassword();
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between">
        <span className="font-bold text-gray-800 text-lg">🎓 Teacher Portal</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Welcome, <strong className="text-gray-700">{user?.username}</strong></span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition">Logout</button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-1">📚 My Assignments</h2>
            <p className="text-sm text-gray-500">View subjects and classes assigned to you.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-1">📝 Enter Marks</h2>
            <p className="text-sm text-gray-500">Submit student marks for your subjects.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-1">📈 View Results</h2>
            <p className="text-sm text-gray-500">Check calculated results for your students.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-1">🏆 Class Ranking</h2>
            <p className="text-sm text-gray-500">See the ranking of students in your class.</p>
          </div>
        </div>

        <ChangePassword onSubmit={handleChangePassword} />
      </main>
    </div>
  );
}
