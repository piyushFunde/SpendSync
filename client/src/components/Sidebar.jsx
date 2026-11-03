import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Settings,
  LogOut, Menu, X, Wallet, ShieldCheck
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils/constants';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="sidebar-brand-mark">
            <Wallet size={19} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">SpendSync</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 -mt-0.5">Personal finance</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1.5 mt-2">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">
            Workspace
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item group relative ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="transition-transform group-hover:scale-110" />
              <span className="flex-1 font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Account summary and sign-out */}
      <div className="p-3 space-y-3">
        <div className="sidebar-note">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={15} className="text-indigo-300" />
            <span className="text-xs font-semibold text-slate-200">Your finances, organized</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">Keep your income and spending in one simple view.</p>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md shadow-indigo-500/20 border border-white/20"
            style={{ background: user?.avatarColor || '#6366f1' }}
          >
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              <span>{user?.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar hidden lg:flex flex-col w-64 h-screen sticky top-0 z-40">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 btn-icon p-2.5 app-menu-button"
        aria-label="Open menu"
        id="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`app-sidebar lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col transition-transform duration-300 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 btn-icon p-1.5"
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
