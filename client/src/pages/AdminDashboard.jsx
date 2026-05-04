import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ volunteers: 0, beneficiaries: 0, tasks: 0, assignments: 0 });
  const [volunteers, setVolunteers] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      const [v, b, t, a] = await Promise.all([
        api.get('/volunteers'),
        api.get('/beneficiaries'),
        api.get('/tasks'),
        api.get('/assignments'),
      ]);
      setVolunteers(v.data);
      setBeneficiaries(b.data);
      setTasks(t.data);
      setStats({
        volunteers: v.data.length,
        beneficiaries: b.data.length,
        tasks: t.data.length,
        assignments: a.data.length,
      });
    };
    load();
  }, []);

  const exportCSV = (type) => {
    window.open(`/api/${type}/export/csv`, '_blank');
  };

  const StatCard = ({ label, value, color }) => (
    <div className={`rounded-xl p-6 text-white ${color} shadow`}>
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-1 text-sm opacity-90">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold remar-green mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Volunteers" value={stats.volunteers} color="bg-remar" />
          <StatCard label="Beneficiaries" value={stats.beneficiaries} color="bg-remar" />
          <StatCard label="Tasks" value={stats.tasks} color="bg-yellow-500" />
          <StatCard label="Assignments" value={stats.assignments} color="bg-remar" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['overview', 'volunteers', 'beneficiaries', 'tasks'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                tab === t ? 'bg-remar text-white' : 'bg-white text-gray-600 hover:bg-remar-light border'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {tab === 'overview' && (
            <div>
              <h2 className="font-semibold remar-green mb-4">Recent Tasks</h2>
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{task.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'open' ? 'bg-remar-light remar-green' :
                      task.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'volunteers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold remar-green">Volunteers ({volunteers.length})</h2>
                <button onClick={() => exportCSV('volunteers')}
                  className="text-sm bg-yellow-400 text-green-900 px-4 py-1 rounded font-semibold hover:bg-yellow-300 transition">
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Name</th><th className="pb-2">Gender</th>
                    <th className="pb-2">Age Group</th><th className="pb-2">Phone</th><th className="pb-2">Skills</th>
                  </tr></thead>
                  <tbody>
                    {volunteers.map(v => (
                      <tr key={v.id} className="border-b hover:bg-green-50">
                        <td className="py-2 font-medium">{v.name}</td>
                        <td className="py-2">{v.gender}</td>
                        <td className="py-2">{v.age_group}</td>
                        <td className="py-2">{v.phone}</td>
                        <td className="py-2">{v.skills?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'beneficiaries' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold remar-green">Beneficiaries ({beneficiaries.length})</h2>
                <button onClick={() => exportCSV('beneficiaries')}
                  className="text-sm bg-yellow-400 text-green-900 px-4 py-1 rounded font-semibold hover:bg-yellow-300 transition">
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Name</th><th className="pb-2">Gender</th>
                    <th className="pb-2">Age Group</th><th className="pb-2">Phone</th><th className="pb-2">Support Needs</th>
                  </tr></thead>
                  <tbody>
                    {beneficiaries.map(b => (
                      <tr key={b.id} className="border-b hover:bg-green-50">
                        <td className="py-2 font-medium">{b.name}</td>
                        <td className="py-2">{b.gender}</td>
                        <td className="py-2">{b.age_group}</td>
                        <td className="py-2">{b.phone}</td>
                        <td className="py-2">{b.support_needs?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'tasks' && (
            <div>
              <h2 className="font-semibold remar-green mb-4">All Tasks ({tasks.length})</h2>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        {task.scheduled_date && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(task.scheduled_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ml-4 ${
                        task.status === 'open' ? 'bg-remar-light remar-green' :
                        task.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                        task.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
