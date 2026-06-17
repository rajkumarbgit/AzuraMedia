import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut } from 'lucide-react';

export default function Layout({ children, setView }) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const role = localStorage.getItem('role');

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = {
    ceo: [{ id: 'ceo', label: 'CEO Dashboard' }, { id: 'admin', label: 'Admin' }],
    pm: [{ id: 'pm', label: 'Project Manager' }],
    admin: [{ id: 'admin', label: 'Admin Panel' }],
    lead: [{ id: 'production', label: 'Production Timeline' }],
    ops: [{ id: 'production', label: 'Production Timeline' }]
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">L</div>
            <div className="flex space-x-4">
              {(navItems[role] || []).map(item => (
                <button key={item.id} onClick={() => setView(item.id)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600">{item.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDark} className="text-gray-700 dark:text-gray-300">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={logout} className="text-gray-700 dark:text-gray-300 flex items-center hover:text-red-500">
              <LogOut size={20} className="mr-1" /> Logout
            </button>
          </div>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}