import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import TeacherLayout from '../../components/TeacherLayout.jsx';
import { Loading, Alert, EmptyState } from '../../components/UI.jsx';
import { teachingAssignmentService, rankingService } from '../../services/index.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function TeacherRanking() {
  const { user } = useAuth();
  const [classes, setClasses]       = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [ranking, setRanking]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingRank, setLoadingRank] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    teachingAssignmentService.getAll()
      .then(data => {
        const all = data.assignments || [];
        const mine = all.filter(a =>
          a.teacherId?._id === user?.id || a.teacherId === user?.id
        );
        const seen = new Set();
        const unique = [];
        mine.forEach(a => {
          const id = a.classId?._id;
          if (id && !seen.has(id)) { seen.add(id); unique.push(a.classId); }
        });
        setClasses(unique);
      })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedClass) { setRanking([]); return; }
    setLoadingRank(true);
    rankingService.classRanking(selectedClass)
      .then(data => setRanking(data.ranking || []))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoadingRank(false));
  }, [selectedClass]);

  return (
    <TeacherLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Class Ranking</h1>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {loading ? <Loading /> : (
          <>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
              >
                <option value="">Select a class</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} — Grade {c.grade}
                  </option>
                ))}
              </select>
            </div>

            {!selectedClass && <EmptyState message="Select a class above to view ranking." />}
            {selectedClass && loadingRank && <Loading />}
            {selectedClass && !loadingRank && ranking.length === 0 && (
              <EmptyState message="No ranking data for this class yet." />
            )}
            {selectedClass && !loadingRank && ranking.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {ranking.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {entry.classRank ?? i + 1}
                      </span>
                      <span className="font-medium text-gray-800">
                        {entry.student?.firstName} {entry.student?.lastName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{entry.averageScore?.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
