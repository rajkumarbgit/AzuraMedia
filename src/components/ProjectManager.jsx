import { useState, useEffect } from 'react';
import api from '../api';

export default function ProjectManager() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ job_no: '', client_id: 1, currency: 'USD', client_payout: 0, production_percentage: 50, mandates: 0, pm_comment: '' });

  const fetchJobs = async () => setJobs((await api.get('/jobs')).data);
  useEffect(() => { fetchJobs(); }, []);

  const createJob = async (e) => {
    e.preventDefault();
    await api.post('/jobs', form);
    fetchJobs();
  };

  const requestAmend = async (jobId) => {
    const change = prompt("Enter mandate change (e.g., +5 or -2):");
    const comment = prompt("Enter comment:");
    if (change && comment) {
      await api.post('/jobs/amend', { job_id: jobId, mandate_change: parseInt(change), comment });
      fetchJobs();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New Job</h2>
      <form onSubmit={createJob} className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="Job No" className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, job_no: e.target.value})} />
        <select className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, currency: e.target.value})}>
          <option>USD</option><option>EUR</option><option>INR</option><option>GBP</option>
        </select>
        <input type="number" placeholder="Client Payout" className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, client_payout: parseFloat(e.target.value)})} />
        <input type="number" placeholder="Production %" className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, production_percentage: parseFloat(e.target.value)})} />
        <input type="number" placeholder="Mandates" className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, mandates: parseInt(e.target.value)})} />
        <input placeholder="PM Comment" className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setForm({...form, pm_comment: e.target.value})} />
        <button className="col-span-2 bg-blue-600 text-white p-2 rounded">Create Job</button>
      </form>

      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Active Jobs & Timeline</h2>
      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="border p-4 rounded dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">{job.job_no} (v{job.current_version})</h3>
                <p className="text-sm text-gray-500">Mandates: {job.mandates} | Payout: {job.currency} {job.client_payout}</p>
              </div>
              <button onClick={() => requestAmend(job.id)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Request Amend</button>
            </div>
            <p className="text-xs mt-2 text-gray-400">{job.pm_comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}