import { ArrowDownLeft, Shield, Wallet } from 'lucide-react';
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
              ? 'Track spending, understand your habits, and keep your budget in view, all in one simple place.'
              : 'Pick up where you left off: your balance, your budget and your recent activity.'}
          </Reveal>

          {isRegister ? (
            <Reveal className="auth-preview-card auth-metrics-preview" delay={280}>
              <div className="auth-preview-heading"><span>YOUR FINANCES</span><small>Example view</small></div>
              <div className="auth-metrics-grid">
                <article>
                  <span>Total balance</span>
                  <strong>$27,169.85</strong>
                </article>
                <article>
                  <span>Savings goal</span>
                  <strong>$8,450 <small>/ $12,000</small></strong>
                  <i className="auth-progress auth-progress-teal"><b /></i>
                </article>
                <article>
                  <span>Monthly budget</span>
                  <strong>$2,340 <small>of $3,000</small></strong>
                  <i className="auth-progress auth-progress-amber"><b /></i>
                </article>
              </div>
            </Reveal>
          ) : (
            <Reveal className="auth-preview-card auth-activity-preview" delay={280}>
              <div className="auth-preview-heading"><span>RECENT ACTIVITY</span><small>Illustrative data</small></div>
              <div className="auth-activity-row">
                <span className="auth-activity-icon auth-activity-food">F</span>
                <span><strong>Groceries</strong><small>Food &amp; dining · Today</small></span>
                <b>−$64.20</b>
              </div>
              <div className="auth-activity-row">
                <span className="auth-activity-icon auth-activity-income">S</span>
                <span><strong>Monthly salary</strong><small>Income · Oct 28</small></span>
                <b className="auth-positive">+$3,800.00</b>
              </div>
              <div className="auth-preview-balance">
                <span><ArrowDownLeft size={13} /> Monthly overview</span>
                <strong>$2,340.00</strong>
                <small>Based on your recorded activity</small>
              </div>
            </Reveal>
          )}
        </div>
      </aside>
    </main>
  );
};

export default AuthLayout;
