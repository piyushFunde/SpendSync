import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Download, Wallet, X } from 'lucide-react';

import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Shared authenticated application layout.
const AppLayout = () => (
  <div className="app-shell flex min-h-screen relative text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 relative z-10">
      <Header />
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  </div>
);

// PWA Install Banner
const PwaBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 right-6 p-4 rounded-2xl glass-panel border border-indigo-500/30 shadow-2xl flex items-center gap-3.5 z-50 animate-fadeInUp max-w-sm">
      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
        <Wallet size={19} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white">Install SpendSync</div>
        <div className="text-[11px] text-slate-400">Add a shortcut to your home screen</div>
      </div>
      <button
        onClick={handleInstall}
        className="btn-primary btn-sm text-xs px-3 py-1.5"
        id="pwa-install-btn"
      >
        <Download size={13} />
        Install
      </button>
      <button
        onClick={() => setShowBanner(false)}
        className="btn-icon p-1.5"
        id="pwa-dismiss-btn"
      >
        <X size={14} />
      </button>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <PwaBanner />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#121b25',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 14px 36px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#4fc4a2', secondary: '#121b25' },
          },
          error: {
            iconTheme: { primary: '#ed8290', secondary: '#121b25' },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
