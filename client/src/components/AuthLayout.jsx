import { BarChart3, Download, Shield, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

const AuthLayout = ({ variant, title, description, children, footer }) => {
  const isRegister = variant === 'register';

  return (
    <main className="auth-page">
      <section className="auth-form-panel">
        <Link className="auth-brand" to="/" aria-label="SpendSync home">
          <span className="auth-brand-mark"><Wallet size={16} /></span>
          <span>SpendSync</span>
        </Link>

        <div className="auth-form-content">
          <div className="auth-form-heading">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          {footer}
          <p className="auth-trust-note"><Shield size={12} /> Your account and transactions stay tied to your sign-in.</p>
        </div>
      </section>

      <aside className="auth-promo-panel" aria-label="SpendSync overview">
        <div className="auth-promo-glow" />
        <div className="auth-promo-content">
          <Reveal as="h2" className="auth-promo-heading" delay={80}>
            {isRegister ? <>Spend smarter with your<br />money in focus.</> : 'Your money, back in focus.'}
          </Reveal>
          <Reveal as="p" className="auth-promo-description" delay={180}>
            {isRegister
              ? 'Track spending, understand your habits, and keep your financial activity organized.'
              : 'Sign in to review the financial activity you have recorded.'}
          </Reveal>

          <Reveal className="auth-preview-card auth-benefits-preview" delay={280}>
            <div className="auth-benefit-row">
              <span className="auth-activity-icon auth-activity-income"><Wallet size={15} /></span>
              <span><strong>Record income and expenses</strong><small>Keep your financial activity organized.</small></span>
            </div>
            <div className="auth-benefit-row">
              <span className="auth-activity-icon auth-activity-food"><BarChart3 size={15} /></span>
              <span><strong>Review your activity</strong><small>Explore your recorded transactions and trends.</small></span>
            </div>
            <div className="auth-benefit-row">
              <span className="auth-activity-icon auth-activity-income"><Download size={15} /></span>
              <span><strong>Export your records</strong><small>Take your transaction history with you.</small></span>
            </div>
          </Reveal>
        </div>
      </aside>
    </main>
  );
};

export default AuthLayout;
