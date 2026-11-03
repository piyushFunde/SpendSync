import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form);
    if (result.success) {
      toast.success('Welcome back to SpendSync');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="auth-container relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="auth-card relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="sidebar-brand-mark">
            <Wallet size={21} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SpendSync</h1>
            <p className="text-xs text-slate-400">Personal finance, made clearer.</p>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to view your transactions and overview.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

          <div className="form-group">
            <label className="form-label text-[11px]" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••"
                className={`form-input pr-11 text-sm ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                id="toggle-password"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full btn-lg mt-4"
            id="login-btn"
          >
            {isLoading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
