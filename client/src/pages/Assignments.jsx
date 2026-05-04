import { useEffect, useState } from 'react';
import api from '../api';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ task_id: '', volunteer_id: '', beneficiary_id: '', notes: '' });

  const load = async () => {
    const [a, v, b, t] = await Promise.all([
      api.get('/assignments'),
      api.get('/volunteers'),
      api.get('/beneficiaries'),
      api.get('/tasks'),
    ]);
    setAssignments(a.data);
    setVolunteers(v.data);
    setBeneficiaries(b.data);
    setTasks(t.data.filter(t => t.status === 'open'));
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    await api.post('/assignments', form);
    setForm({ task_id: '', volunteer_id: '', beneficiary_id: '', notes: '' });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/assignments/${id}`, { status });
    load();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold remar-green">Assignments</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-remar text-white px-4 py-2 rounded-lg font-semibold hover:bg-remar transition">
            + Assign Volunteer
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-semibold remar-green mb-4">New Assignment</h2>
            <form onSubmit={handleAssign} className="grid grid-cols-2 gap-3">
              <select required value={form.task_id} onChange={e => setForm({ ...form, task_id: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar">
                <option value="">Select Task</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <select required value={form.volunteer_id} onChange={e => setForm({ ...form, volunteer_id: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar">
                <option value="">Select Volunteer</option>
                {volunteers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <select value={form.beneficiary_id} onChange={e => setForm({ ...form, beneficiary_id: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar">
                <option value="">Select Beneficiary (optional)</option>
                {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input placeholder="Notes" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-remar" />
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="bg-remar text-white px-6 py-2 rounded-lg font-semibold hover:bg-remar">
                  Assign
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="border px-6 py-2 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-remar text-white">
              <tr>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Volunteer</th>
                <th className="px-4 py-3 text-left">Beneficiary</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} className="border-b hover:bg-green-50">
                  <td className="px-4 py-3 font-medium">{a.task_title}</td>
                  <td className="px-4 py-3">{a.volunteer_name}</td>
                  <td className="px-4 py-3">{a.beneficiary_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      a.status === 'confirmed' ? 'bg-remar-light remar-green' :
                      a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      a.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === 'pending' && (
                      <button onClick={() => updateStatus(a.id, 'confirmed')}
                        className="text-xs remar-green hover:underline mr-2">Confirm</button>
                    )}
                    {a.status !== 'completed' && a.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(a.id, 'completed')}
                        className="text-xs text-blue-600 hover:underline">Complete</button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No assignments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
