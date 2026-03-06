import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import CalendarView from './pages/CalendarView';
import Report from './pages/Report';
import Settings from './pages/Settings';
import SetupWizard from './pages/SetupWizard';

function AppContent() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/health')
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Not JSON response. Content-Type:', contentType, 'Body:', text.substring(0, 200));
          throw new Error('Not JSON response');
        }
        if (res.status === 403) {
          const data = await res.json();
          if (data.redirect === '/setup') {
            return { configured: false };
          }
          return data;
        }
        return res.json();
      })
      .then(data => {
        setIsConfigured(data.configured);
        if (data.configured === false && location.pathname !== '/setup') {
          navigate('/setup');
        } else if (data.configured === true && location.pathname === '/setup') {
          navigate('/');
        }
      })
      .catch(err => {
        console.error("Failed to fetch health status", err);
        // If we can't reach the server, we might be in a bad state, but let's not block rendering entirely
        // or we can assume it's not configured to be safe.
        setIsConfigured(false);
      });
  }, [navigate, location.pathname]);

  if (isConfigured === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizard onComplete={() => setIsConfigured(true)} />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CalendarView />} />
        <Route path="/report" element={<Report />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
