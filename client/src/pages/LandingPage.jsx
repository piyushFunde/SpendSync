import {
  ArrowRight,
  BarChart3,
  Download,
  LayoutDashboard,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

const features = [
  {
    icon: Wallet,
    title: 'A clear view of your money',
    description: 'See income, spending and your current balance together, without jumping between spreadsheets.',
  },
  {
    icon: BarChart3,
    title: 'Understand your spending',
    description: 'Explore monthly cash flow and category totals using the transactions you have recorded.',
  },
  {
    icon: Download,
    title: 'Take your records with you',
    description: 'Export your transaction history as CSV or create a PDF statement when you need one.',
  },
];

const LandingPage = () => (
  <div className="landing-page min-h-screen text-slate-100">
    <header className="landing-header">
      <Link to="/" className="landing-brand" aria-label="SpendSync home">
        <span className="landing-brand-mark"><Wallet size={19} strokeWidth={2.2} /></span>
        <span>SpendSync</span>
      </Link>
      <nav className="landing-nav" aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#how-it-works">How it works</a>
        <a href="#budgets">Budgets</a>
        <a href="#features">Features</a>
        <a href="#faqs">FAQs</a>
      </nav>
      <div className="landing-actions">
        <Link to="/login" className="landing-login">Sign in</Link>
        <Link to="/register" className="landing-cta landing-cta-small">
          Sign up
        </Link>
      </div>
    </header>

    <main>
      <section id="home" className="landing-hero">
        <div className="landing-hero-copy">
          <Reveal as="h1" className="landing-headline">
            Spend smarter with<br /><span>your money in focus.</span>
          </Reveal>
          <Reveal as="p" className="landing-hero-subtext" delay={100}>
            Track spending, understand your habits, and keep your finances in view —
            all in one simple place.
          </Reveal>
          <Reveal className="landing-hero-actions" delay={200}>
            <Link to="/register" className="landing-cta">
              Get started <ArrowRight size={17} />
            </Link>
          </Reveal>
        </div>

        <Reveal
          className="landing-preview dashboard-reveal"
          aria-label="Illustrative SpendSync dashboard preview"
          delay={500}
        >
          <div className="dashboard-frame">
            <aside className="dashboard-sidebar">
              <div className="dashboard-brand">
                <span className="dashboard-brand-mark"><Wallet size={14} /></span>
                <strong>SpendSync</strong>
              </div>
              <span className="dashboard-nav-label">MAIN MENU</span>
              <div className="dashboard-nav-item dashboard-nav-active"><LayoutDashboard size={13} /> Overview</div>
              <div className="dashboard-nav-item">Transactions</div>
              <div className="dashboard-nav-item"><BarChart3 size={13} /> Analytics</div>
            </aside>

            <div className="dashboard-main">
              <div className="dashboard-toolbar">
                <div>
                  <span className="dashboard-kicker">YOUR FINANCES</span>
                  <h2>Overview</h2>
                </div>
              </div>

              <div className="dashboard-stat-grid">
                <article className="dashboard-stat-card">
                  <span>Balance</span>
                  <strong>—</strong>
                  <small>Based on your activity</small>
                </article>
                <article className="dashboard-stat-card">
                  <span>Income</span>
                  <strong>—</strong>
                  <small>Your recorded income</small>
                </article>
                <article className="dashboard-stat-card">
                  <span>Expenses</span>
                  <strong>—</strong>
                  <small>Your recorded expenses</small>
                </article>
              </div>

              <div className="dashboard-content-grid">
                <section className="dashboard-chart-card dashboard-stagger">
                  <div className="dashboard-card-heading">
                    <div><span>YOUR ACTIVITY</span><strong>Cash flow</strong></div>
                  </div>
                  <p className="dashboard-empty-state">Your cash flow will appear here after you add transactions.</p>
                </section>

                <section className="dashboard-activity-card dashboard-stagger">
                  <div className="dashboard-card-heading">
                    <div><span>RECENT ACTIVITY</span><strong>Transactions</strong></div>
                  </div>
                  <p className="dashboard-empty-state">Your latest transactions will appear here.</p>
                </section>
              </div>
            </div>
          </div>
          <div className="preview-caption">Your dashboard reflects your recorded activity</div>
        </Reveal>
      </section>

      <Reveal as="section" id="features" className="landing-section">
        <div className="landing-section-heading">
          <span className="landing-section-kicker">Everything in one place</span>
          <h2>Less guesswork. More clarity.</h2>
          <p>The essentials to record your finances and understand your habits.</p>
        </div>
        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="landing-feature" key={title}>
              <span className="landing-feature-icon"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" id="how-it-works" className="landing-how">
        <div>
          <span className="landing-section-kicker">A straightforward start</span>
          <h2>Build a picture that’s<br />actually yours.</h2>
        </div>
        <div className="landing-steps">
          <div><span>01</span><p><strong>Create your account</strong><br />Set up your profile and preferred currency.</p></div>
          <div><span>02</span><p><strong>Add your transactions</strong><br />Record income and expenses as they happen.</p></div>
          <div><span>03</span><p><strong>Review your overview</strong><br />Use your recorded activity to spot patterns.</p></div>
        </div>
      </Reveal>

      <Reveal as="section" id="budgets" className="landing-section landing-budget-section">
        <div className="landing-section-heading">
          <span className="landing-section-kicker">Make a plan that works for you</span>
          <h2>Build a spending plan from real activity.</h2>
          <p>Review the income and expenses you record, then use that clear picture to make your own informed budget.</p>
        </div>
        <div className="landing-budget-grid">
          <article className="landing-budget-card">
            <span className="landing-budget-card-label">RECORD</span>
            <h3>Keep activity together</h3>
            <p>Add income and expenses to build a reliable view of your finances.</p>
          </article>
          <article className="landing-budget-card">
            <span className="landing-budget-card-label">REVIEW</span>
            <h3>Understand your spending</h3>
            <p>Review your transactions by category to understand what is driving your spending.</p>
          </article>
          <article className="landing-budget-card">
            <span className="landing-budget-card-label">PLAN</span>
            <h3>Choose your next steps</h3>
            <p>Use your recorded activity to make financial plans that fit your priorities.</p>
          </article>
        </div>
      </Reveal>

      <Reveal as="section" id="faqs" className="landing-section landing-faq-section">
        <div className="landing-section-heading">
          <span className="landing-section-kicker">Frequently asked questions</span>
          <h2>Good to know.</h2>
          <p>A few quick answers to help you get started with SpendSync.</p>
        </div>
        <div className="landing-faq-list">
          <details>
            <summary>What can I track with SpendSync?</summary>
            <p>Record income and expenses, organize transactions by category, and review your activity in one place.</p>
          </details>
          <details>
            <summary>Can I review my spending over time?</summary>
            <p>Yes. Your dashboard and analytics help you explore transaction totals and category trends.</p>
          </details>
          <details>
            <summary>Can I export my transaction history?</summary>
            <p>Yes. Export your records as a CSV or create a PDF statement when you need a copy.</p>
          </details>
          <details>
            <summary>How do I get started?</summary>
            <p>Create an account, add your transactions, and visit your overview to see your finances take shape.</p>
          </details>
        </div>
      </Reveal>

      <Reveal as="section" className="landing-final-cta">
        <div>
          <span className="landing-section-kicker">Start with the basics</span>
          <h2>A clearer view starts here.</h2>
        </div>
        <Link to="/register" className="landing-cta">
          Get started <ArrowRight size={17} />
        </Link>
      </Reveal>
    </main>

    <footer className="landing-footer">
      <Link to="/" className="landing-brand">
        <span className="landing-brand-mark"><Wallet size={17} /></span>
        <span>SpendSync</span>
      </Link>
      <span>Personal finance, made clearer.</span>
      <div><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></div>
    </footer>
  </div>
);

export default LandingPage;
