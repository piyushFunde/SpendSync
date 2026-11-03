import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout
      variant="login"
      title="Welcome back"
      description="Sign in to see your overview."
      footer={(
        <p className="auth-account-link">
          New to SpendSync?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
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
                className="auth-password-toggle"
                id="toggle-password"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
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
            {isLoading ? <span className="spinner" /> : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>
    </AuthLayout>
  );
};

export default LoginPage;
