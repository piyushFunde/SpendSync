import { useState, useEffect } from 'react';
import {
  FileText, Plus, ChevronDown, Check
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTransactionStore from '../store/transactionStore';
import { CURRENCIES } from '../utils/constants';
import { generateFinancialStatementPdf } from '../utils/pdfExport';
import TransactionModal from './TransactionModal';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, updateUserPreferences } = useAuthStore();
  const { transactions, fetchDashboard, fetchTransactions } = useTransactionStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const currentCurrency = user?.currency || 'USD';

  // Keyboard shortcut listener: 'N' to open new transaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
        !modalOpen
      ) {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const handleCurrencyChange = (code) => {
    updateUserPreferences({ currency: code });
    setCurrencyOpen(false);
    toast.success(`Currency changed to ${code}`);
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      generateFinancialStatementPdf({
        user,
        transactions,
      });
      toast.success('PDF statement downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <header className="app-topbar sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex-1" />

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-2.5">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all hover:border-indigo-500/40"
              title="Change Currency"
            >
              <span className="font-mono text-indigo-400">{CURRENCIES.find(c => c.code === currentCurrency)?.symbol}</span>
              <span>{currentCurrency}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>

            {currencyOpen && (
              <div
                className="currency-menu absolute right-0 mt-2 w-44 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeInUp"
                onMouseLeave={() => setCurrencyOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                  Select Currency
                </div>
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      currentCurrency === c.code
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">{c.symbol}</span>
                      <span>{c.code}</span>
                    </span>
                    {currentCurrency === c.code && <Check size={12} className="text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export PDF Statement */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all export-action"
            title="Download PDF statement"
          >
            <FileText size={13} className="text-indigo-400" />
            <span>PDF Statement</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary btn-sm flex items-center gap-1.5 text-xs font-semibold"
            id="header-quick-add-btn"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New transaction</span>
            <span className="sm:hidden">Add</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-black/30 rounded border border-white/20 font-mono text-indigo-200">
              N
            </kbd>
          </button>
        </div>
      </header>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchDashboard();
          fetchTransactions();
        }}
      />
    </>
  );
};

export default Header;
