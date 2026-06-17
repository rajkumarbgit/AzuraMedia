import { useEffect, useState } from 'react';
import api from '../api';
import { Search } from 'lucide-react';

export default function CEODashboard() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/jobs').then(res => setJobs(res.data)); }, []);

  const totalEarnings = jobs.reduce((acc, j) => acc + j.client_payout, 0);
  const inProgress = jobs.filter(j => j.status !== 'Completed').length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow">
          <h3 className="text-blue-800 dark:text-blue-200 text-sm">Total Jobs</h3>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{jobs.length}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow">
          <h3 className="text-green-800 dark:text-green-200 text-sm">In Progress</h3>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{inProgress}</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-6 rounded-lg shadow">
          <h3 className="text-purple-800 dark:text-purple-200 text-sm">Total Earnings</h3>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">${totalEarnings}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center mb-4 border-b dark:border-gray-700 pb-2">
          <Search className="text-gray-400 mr-2" size={20} />
          <input placeholder="Search job, status, currency..." className="bg-transparent w-full outline-none text-gray-700 dark:text-white" onChange={e => setSearch(e.target.value)} />
        </div>
        <table className="w-full text-left text-gray-700 dark:text-gray-300">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-2">Job No</th><th>Version</th><th>Mandates</th><th>Payout</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.filter(j => JSON.stringify(j).toLowerCase().includes(search.toLowerCase())).map(job => (
              <tr key={job.id} className="border-b dark:border-gray-700">
                <td className="py-2">{job.job_no}</td><td>v{job.current_version}</td><td>{job.mandates}</td><td>{job.currency} {job.client_payout}</td><td>{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}