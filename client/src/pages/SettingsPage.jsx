import { useState } from 'react';
import { User, Palette, Save } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { CURRENCIES, getInitials } from '../utils/constants';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUserPreferences } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');

  const handleSaveProfile = () => {
    const displayName = name.trim();
    if (!displayName) {
      toast.error('Display name is required');
      return;
    }

    updateUserPreferences({ name: displayName, currency });
    toast.success('Profile saved on this device');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage your profile and display preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav
          aria-label="Settings sections"
          className="lg:w-56 flex lg:flex-col gap-1.5 p-1.5 bg-white/[0.02] rounded-2xl border border-white/5 self-start w-full"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-item ${activeTab === id ? 'active font-bold' : ''}`}
              id={`settings-tab-${id}`}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' ? (
            <section className="cyber-card p-5 sm:p-7" aria-labelledby="profile-heading">
              <div className="mb-6">
                <h2 id="profile-heading" className="text-lg font-bold text-white">Your profile</h2>
                <p className="text-sm text-slate-400 mt-1">
                  These details are saved in your SpendSync profile on this device.
                </p>
              </div>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                  style={{ background: user?.avatarColor || '#6678e8' }}
                  aria-hidden="true"
                >
                  {getInitials(name || user?.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{name || user?.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="form-group">
                  <label className="form-label text-[11px]" htmlFor="settings-name">Display name</label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-[11px]" htmlFor="settings-email">Email address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ''}
                    className="form-input text-sm opacity-70"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-[11px]" htmlFor="settings-currency">Default currency</label>
                  <select
                    id="settings-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="form-select text-sm"
                  >
                    {CURRENCIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.symbol} {item.name} ({item.code})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="btn-primary mt-2 inline-flex items-center gap-2"
                  id="save-profile-btn"
                >
                  <Save size={15} />
                  <span>Save profile</span>
                </button>
              </div>
            </section>
          ) : (
            <section className="cyber-card p-5 sm:p-7" aria-labelledby="appearance-heading">
              <h2 id="appearance-heading" className="text-lg font-bold text-white">Appearance</h2>
              <p className="text-sm text-slate-400 mt-1 mb-6">
                SpendSync currently uses a consistent dark theme across the app.
              </p>
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div>
                  <div className="text-sm font-semibold text-white">Dark appearance</div>
                  <div className="text-xs text-slate-400 mt-1">The current app-wide color scheme.</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 bg-white/5">
                  Default
                </span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
