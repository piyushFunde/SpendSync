import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, ChartNoAxesColumn, Settings,
  LogOut, Menu, X, Wallet, Download
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils/constants';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: ChartNoAxesColumn, label: 'Categories' },
  { to: '/export', icon: Download, label: 'Export' },
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
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1.5 mt-2" aria-label="Main menu">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-3 mb-2">
            Main menu
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
      <div className="p-3">
        {/* User Profile */}
        <div className="sidebar-account p-2.5 rounded-xl border border-white/5">
          <div className="sidebar-account-profile">
            <div
              className="sidebar-account-avatar"
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
            <NavLink
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-settings-link p-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={16} />
            </NavLink>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-sign-out"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={13} />
            <span>Sign out</span>
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
