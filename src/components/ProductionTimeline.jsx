import { useEffect, useState } from 'react';
import api from '../api';

export default function ProductionTimeline() {
  const [tasks, setTasks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ job_id: '', name: '', lead_id: '', assigned_ops_id: '', facility: 'Mumbai', estimated_hours: 8 });

  const fetchData = async () => {
    setTasks((await api.get('/tasks')).data);
    setJobs((await api.get('/jobs')).data);
    setUsers((await api.get('/users')).data);
  };

  useEffect(() => { fetchData(); }, []);

  const createTask = async (e) => {
    e.preventDefault();
    await api.post('/tasks', form);
    fetchData();
  };

  // Shift capacity calculation (8 hours shift minus 1 hour break = 7 hours capacity)
  const getRemainingCapacity = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return 0;
    const bookedHours = tasks.filter(t => t.assigned_ops_id === userId).reduce((acc, t) => acc + t.estimated_hours, 0);
    return 7 - bookedHours; // 7 hours total capacity
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Book Task</h2>
        <form onSubmit={createTask} className="space-y-3">
          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, job_id: e.target.value})}>
            <option>Select Job</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.job_no}</option>)}
          </select>
          <input placeholder="Task Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, name: e.target.value})} />
          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, lead_id: e.target.value})}>
            <option>Select Lead</option>
            {users.filter(u => u.role === 'lead').map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, assigned_ops_id: e.target.value})}>
            <option>Select Ops</option>
            {users.filter(u => u.role === 'ops').map(u => <option key={u.id} value={u.id}>{u.username} ({u.shift})</option>)}
          </select>
          <input placeholder="Est. Hours" type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, estimated_hours: parseFloat(e.target.value)})} />
          <button className="w-full bg-blue-600 text-white p-2 rounded">Assign Task</button>
        </form>
      </div>

      <div className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Timeline & Capacity</h2>
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="font-bold text-gray-800 dark:text-white">Ops Capacity (7h total)</h3>
          {users.filter(u => u.role === 'ops').map(u => (
            <div key={u.id} className="flex justify-between text-sm mt-1 text-gray-600 dark:text-gray-300">
              <span>{u.username} ({u.shift})</span>
              <span>Remaining: {getRemainingCapacity(u.id)}h</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="border p-3 rounded flex justify-between dark:border-gray-700">
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white">{t.name}</h4>
                <p className="text-xs text-gray-500">Job ID: {t.job_id} | Facility: {t.facility}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700 dark:text-white">{t.estimated_hours}h</p>
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}