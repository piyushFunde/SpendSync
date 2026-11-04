import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CreditCard,
  Download,
  LayoutDashboard,
  Search,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

const previewBars = [
  [42, 30], [54, 38], [35, 47], [66, 45], [50, 59], [78, 51],
  [60, 72], [88, 62], [68, 80], [95, 74], [72, 90], [84, 66],
  [98, 79], [76, 94], [91, 70], [100, 84],
];

const previewCategories = ['Rent', 'Food', 'Travel', 'Dining', 'Bills', 'Saved'];

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
            Track spending, understand your habits, and keep your budget in view —
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
              <div className="dashboard-nav-item"><CreditCard size={13} /> Transactions</div>
              <div className="dashboard-nav-item"><BarChart3 size={13} /> Analytics</div>
              <div className="dashboard-sidebar-note">
                <span>MONTHLY SAVINGS GOAL</span>
                <strong>$840 <small>/ $1,200</small></strong>
                <i><b /></i>
              </div>
            </aside>

            <div className="dashboard-main">
              <div className="dashboard-toolbar">
                <div>
                  <span className="dashboard-kicker">YOUR FINANCES</span>
                  <h2>Overview</h2>
                </div>
                <div className="dashboard-toolbar-actions">
                  <span className="dashboard-search"><Search size={13} /> Search anything...</span>
                  <span className="dashboard-icon-button"><Bell size={13} /></span>
                  <span className="dashboard-avatar">JD</span>
                </div>
              </div>

              <div className="dashboard-category-row" aria-hidden="true">
                {previewCategories.map((category, index) => (
                  <span className="dashboard-category-chip" key={category}>
                    <i className={`dashboard-category-dot dashboard-category-dot-${index}`} />
                    {category}
                    <b>{['1,450', '312', '96', '184', '128', '600'][index]}</b>
                  </span>
                ))}
              </div>

              <div className="dashboard-stat-grid">
                <article className="dashboard-stat-card dashboard-balance-card">
                  <span>Total balance</span>
                  <strong>$27,169.85</strong>
                  <small><ArrowUpRight size={12} /> Across your accounts</small>
                </article>
                <article className="dashboard-stat-card">
                  <span>Savings goal</span>
                  <strong>$8,450 <small>/ $12,000</small></strong>
                  <div className="dashboard-progress"><i /></div>
                  <small>70% reached</small>
                </article>
                <article className="dashboard-stat-card">
                  <span>Monthly budget</span>
                  <strong>$2,340 <small>of $3,000</small></strong>
                  <div className="dashboard-budget-line"><i /></div>
                  <small>On track this month</small>
                </article>
              </div>

              <div className="dashboard-content-grid">
                <section className="dashboard-chart-card dashboard-stagger">
                  <div className="dashboard-card-heading">
                    <div><span>YOUR ACTIVITY</span><strong>Cash flow</strong></div>
                    <span className="dashboard-select">Last 7 months <ChevronDown size={12} /></span>
                  </div>
                  <div className="dashboard-chart">
                    <div className="dashboard-chart-y-axis"><span>$5k</span><span>$3k</span><span>$1k</span><span>$0</span></div>
                    <div className="dashboard-chart-plot">
                      <div className="dashboard-chart-grid"><i /><i /><i /><i /></div>
                      <div className="dashboard-bars" aria-hidden="true">
                        {previewBars.map(([income, expense], index) => (
                          <span className="dashboard-bar-pair" key={index}>
                            <i className="dashboard-income-bar" style={{ height: `${income}%` }} />
                            <i className="dashboard-expense-bar" style={{ height: `${expense}%` }} />
                          </span>
                        ))}
                      </div>
                      <div className="dashboard-chart-months">
                        <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-chart-legend">
                    <span><i className="dashboard-income-dot" /> Income</span>
                    <span><i className="dashboard-expense-dot" /> Expenses</span>
                  </div>
                </section>

                <section className="dashboard-activity-card dashboard-stagger">
                  <div className="dashboard-card-heading">
                    <div><span>RECENT ACTIVITY</span><strong>Transactions</strong></div>
                    <ArrowRight size={14} />
                  </div>
                  <div className="dashboard-activity-row">
                    <span className="dashboard-activity-icon dashboard-food-icon">F</span>
                    <span><strong>Groceries</strong><small>Food &amp; dining · Today</small></span>
                    <b>−$64.20</b>
                  </div>
                  <div className="dashboard-activity-row">
                    <span className="dashboard-activity-icon dashboard-income-icon">S</span>
                    <span><strong>Monthly salary</strong><small>Income · Nov 01</small></span>
                    <b className="dashboard-positive">+$3,800</b>
                  </div>
                  <div className="dashboard-activity-row">
                    <span className="dashboard-activity-icon dashboard-bill-icon">H</span>
                    <span><strong>Home utilities</strong><small>Bills · Oct 29</small></span>
                    <b>−$128.40</b>
                  </div>
                  <div className="dashboard-transfer-card">
                    <span><ArrowDownLeft size={13} /> Monthly spending</span>
                    <strong>$2,340.00</strong>
                    <small>Within your planned budget</small>
                    <div className="dashboard-progress"><i /></div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <div className="preview-caption">Illustrative dashboard preview</div>
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
          <h2>Budgets that keep you on track.</h2>
          <p>Set a monthly spending target, keep an eye on your progress, and adjust as life changes.</p>
        </div>
        <div className="landing-budget-grid">
          <article className="landing-budget-card">
            <span className="landing-budget-card-label">MONTHLY SPENDING</span>
            <strong>$2,340 <small>of $3,000</small></strong>
            <div className="landing-budget-progress" aria-label="78 percent of monthly budget used">
              <span />
            </div>
            <p>$660 left in your plan this month</p>
          </article>
          <article className="landing-budget-card">
            <span className="landing-budget-card-label">A CLEARER PICTURE</span>
            <h3>See where it goes</h3>
            <p>Review your transactions by category to understand what is driving your spending.</p>
          </article>
          <article className="landing-budget-card">
            <span className="landing-budget-card-label">FLEXIBLE BY DESIGN</span>
            <h3>Adjust as you go</h3>
            <p>Your budget is a helpful guide. Update your targets whenever your priorities change.</p>
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
