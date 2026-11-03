import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { CURRENCIES } from '../utils/constants';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', currency: 'USD'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      currency: form.currency,
    };
    const result = await register(payload);
    if (result.success) {
      toast.success('Account created. Welcome to SpendSync');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="auth-container relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="auth-card relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="sidebar-brand-mark">
            <Wallet size={21} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SpendSync</h1>
            <p className="text-xs text-slate-400">Personal finance, made clearer.</p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-slate-400 text-sm mt-1">Set up your profile to start tracking your finances.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group col-span-2 sm:col-span-1">
              <label className="form-label text-[11px]" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Morgan"
                className={`form-input text-sm ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group col-span-2 sm:col-span-1">
              <label className="form-label text-[11px]" htmlFor="currency">Currency</label>
              <select
                id="currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="form-select text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-[11px]" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={`form-input text-sm ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-[11px]" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className={`form-input text-sm pr-8 ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label text-[11px]" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className={`form-input text-sm ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full btn-lg mt-3"
            id="register-btn"
          >
            {isLoading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
