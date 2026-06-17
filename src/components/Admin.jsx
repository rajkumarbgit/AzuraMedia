import { useState, useEffect } from 'react';
import api from '../api';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'ops', designation: '', shift: 'GEN' });

  const fetchUsers = async () => setUsers((await api.get('/users')).data);
  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    await api.post('/users', form);
    fetchUsers();
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add User</h2>
        <form onSubmit={createUser} className="space-y-3">
          <input placeholder="Username" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, username: e.target.value})} />
          <input placeholder="Password" type="password" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, password: e.target.value})} />
          <input placeholder="Designation" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, designation: e.target.value})} />
          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, role: e.target.value})}>
            <option value="ops">Ops</option><option value="lead">Lead</option><option value="pm">Project Manager</option><option value="ceo">CEO</option>
          </select>
          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, shift: e.target.value})}>
            <option value="GEN">GEN (9am-6pm)</option><option value="APAC">APAC (6am-2pm)</option>
            <option value="EMEA">EMEA (2pm-10pm)</option><option value="AMER">AMER (10pm-6am)</option>
          </select>
          <button className="w-full bg-blue-600 text-white p-2 rounded">Add User</button>
        </form>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">User Directory</h2>
        <table className="w-full text-left text-gray-700 dark:text-gray-300">
          <thead><tr className="border-b dark:border-gray-700"><th className="py-2">User</th><th>Role</th><th>Shift</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b dark:border-gray-700">
                <td className="py-2">{u.username}</td><td>{u.role}</td><td>{u.shift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}