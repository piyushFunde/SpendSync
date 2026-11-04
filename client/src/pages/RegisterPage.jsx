import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { CURRENCIES } from '../utils/constants';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout
      variant="register"
      title="Create your account"
      description="Set up your profile and preferred currency."
      footer={(
        <p className="auth-account-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="auth-form-fields auth-register-fields" noValidate>
          <div className="form-group">
              <label className="form-label text-[11px]" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                className={`form-input text-sm ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
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

          <div className="grid grid-cols-1 gap-3">
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
                  className="auth-password-toggle"
                >
                  {showPassword ? 'Hide' : 'Show'}
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

          <div className="form-group">
            <label className="form-label text-[11px]" htmlFor="currency">Preferred currency</label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="form-select text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full btn-lg mt-3"
            id="register-btn"
          >
            {isLoading ? <span className="spinner" /> : <>Create account <ArrowRight size={16} /></>}
          </button>
        </form>
    </AuthLayout>
  );
};

export default RegisterPage;
