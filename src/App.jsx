import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import CEODashboard from './components/CEODashboard';
import ProjectManager from './components/ProjectManager';
import ProductionTimeline from './components/ProductionTimeline';
import Admin from './components/Admin';

function MainApp() {
  const { user } = useAuth();
  const [view, setView] = useState('ceo');
  const role = localStorage.getItem('role');

  if (!user && !localStorage.getItem('token')) return <Login />;

  return (
    <Layout setView={setView}>
      {view === 'ceo' && <CEODashboard />}
      {view === 'pm' && <ProjectManager />}
      {view === 'production' && <ProductionTimeline />}
      {view === 'admin' && <Admin />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}