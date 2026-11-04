import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, BarChart2, Download,
  Menu, X, SquareTerminal
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils/constants';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Overview' },
  { to: '/transactions', icon: Menu, label: 'Transactions' },
  { to: '/categories', icon: BarChart2, label: 'Categories' },
  { to: '/export', icon: Download, label: 'Export' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderSidebarContent = () => (
    <div className="sidebar-content flex flex-col h-full justify-between bg-[#09090b] text-slate-200 select-none">
      <div>
        {/* Brand Header - Clicking SpendSync returns to Overview */}
        <Link
          to="/dashboard"
          onClick={() => {
            setMobileOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="sidebar-brand-link mb-4 flex items-center gap-3 px-5 py-6 group cursor-pointer transition-all select-none"
          title="Return to Overview"
        >
          <div className="sidebar-brand-icon w-8 h-8 rounded-lg bg-[#141417] border border-[#27272a] flex items-center justify-center text-white group-hover:border-[#3f3f46] transition-colors shadow-sm">
            <SquareTerminal size={17} className="text-white" />
          </div>
          <div>
            <span className="sidebar-brand-name font-extrabold text-lg text-white tracking-tight group-hover:text-slate-200 transition-colors">
              SpendSync
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav px-3 space-y-1 mt-1" aria-label="Main menu">
          <div className="sidebar-nav-label text-[10px] font-bold text-[#71717a] uppercase tracking-widest px-3 mb-4 font-mono text-center">
            MAIN MENU
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item group relative ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="shrink-0 transition-transform group-hover:scale-105" />
              <span className="sidebar-nav-item-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Account summary and sign-out matching the design */}
      <div className="sidebar-account-container p-3">
        <div className="sidebar-account p-3.5 rounded-2xl bg-[#111114] border border-[#222225] shadow-sm">
          <div className="sidebar-account-profile flex items-center gap-3 min-w-0">
            <div className="sidebar-account-avatar w-9 h-9 rounded-full bg-[#0a2e26] border border-[#10b981]/30 text-[#10b981] font-bold text-xs flex items-center justify-center font-mono shrink-0">
              {getInitials(user?.name) || 'JD'}
            </div>
            <div className="sidebar-account-copy flex-1 min-w-0">
              <div className="sidebar-account-name text-xs font-bold text-white leading-tight">
                Signed In
              </div>
              <div className="sidebar-account-email text-[11px] text-[#71717a] truncate leading-tight mt-0.5">
                {user?.email || 'you@example.com'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-sign-out w-full mt-3 py-2 px-3 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-[#3f3f46] text-xs font-semibold text-white transition-all text-center cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar hidden lg:flex flex-col w-64 h-screen sticky top-0 z-40 bg-[#09090b] border-r border-[#18181b]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 btn-icon p-2.5 app-menu-button bg-[#111114] border border-[#27272a] text-white rounded-xl"
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
        id="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="mobile-sidebar-overlay fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        id="mobile-navigation"
        className={`app-sidebar mobile-sidebar lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col shadow-2xl bg-[#09090b] border-r border-[#18181b] ${
          mobileOpen ? 'is-open' : ''
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 btn-icon p-1.5 text-slate-400 hover:text-white"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default Sidebar;
