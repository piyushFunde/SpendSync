import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useTransactionStore from '../store/transactionStore';
import { formatCurrency, formatDate } from '../utils/constants';
import { generateFinancialStatementPdf } from '../utils/pdfExport';
import RequestError from '../components/RequestError';

const INCLUDE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expenses' },
];

const csvPreview = (transactions) => [
  'date,description,category,type,amount',
  ...transactions.map((transaction) => {
    const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    return [
      quote(transaction.date),
      quote(transaction.description || transaction.category),
      quote(transaction.category),
      quote(String(transaction.type || 'EXPENSE').toLowerCase()),
      Number(transaction.amount || 0).toFixed(2),
    ].join(',');
  }),
].join('\n');

const ExportPage = () => {
  const [format, setFormat] = useState('CSV');
  const [include, setInclude] = useState('ALL');
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const [currentMonth] = useState(() => new Date().toLocaleDateString(undefined, { month: 'long' }));
  const {
    transactions,
    fetchTransactions,
    exportCsv,
    isLoadingTransactions,
    isExporting,
    transactionsError,
  } = useTransactionStore();
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchTransactions({ ignoreFilters: true });
  }, [fetchTransactions]);

  const includedTransactions = useMemo(
    () => transactions
      .filter((transaction) => include === 'ALL' || transaction.type === include)
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [include, transactions]
  );
  const income = includedTransactions.reduce(
    (sum, transaction) => sum + (transaction.type === 'INCOME' ? Number(transaction.amount) || 0 : 0),
    0
  );
  const expenses = includedTransactions.reduce(
    (sum, transaction) => sum + (transaction.type !== 'INCOME' ? Number(transaction.amount) || 0 : 0),
    0
  );
  const net = income - expenses;
  const isBusy = isLoadingTransactions || isExporting || isCreatingPdf;

  const handleExport = async () => {
    if (format === 'CSV') {
      const result = await exportCsv({
        type: include === 'ALL' ? '' : include,
        sourceTransactions: includedTransactions,
      });
      if (result.success) {
        toast.success(result.usedLocalExport ? 'CSV exported from loaded transactions' : 'CSV exported');
      } else {
        toast.error(result.error);
      }
      return;
    }

    setIsCreatingPdf(true);
    try {
      generateFinancialStatementPdf({ user, transactions: includedTransactions });
      toast.success('PDF statement downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsCreatingPdf(false);
    }
  };

  return (
    <div className="workspace-page export-page">
      <header className="page-heading">
        <div>
          <span className="page-eyebrow">YOUR RECORDS</span>
          <h1 className="page-title">Take your records with you</h1>
          <p className="page-description">
            Export your transaction history as a CSV, or create a PDF statement.
          </p>
        </div>
      </header>

      {transactionsError ? (
        <RequestError message={transactionsError} onRetry={() => fetchTransactions({ ignoreFilters: true })} isLoading={isLoadingTransactions} />
      ) : (
        <div className="export-layout">
          <section className="workspace-card export-settings">
            <h2>Export settings</h2>

            <fieldset>
              <legend>Format</legend>
              <div className="export-choice-row">
                {['CSV', 'PDF'].map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={format === option ? 'selected' : ''}
                    aria-pressed={format === option}
                    onClick={() => setFormat(option)}
                  >
                    {option === 'CSV' ? 'CSV file' : 'PDF statement'}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Include</legend>
              <div className="export-filter-tabs" role="group" aria-label="Transactions to include">
                {INCLUDE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={include === option.value ? 'selected' : ''}
                    aria-pressed={include === option.value}
                    onClick={() => setInclude(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="export-summary">
              <div><span>Transactions</span><strong>{includedTransactions.length}</strong></div>
              <div><span>Income</span><strong className="text-income">+{formatCurrency(income, currency)}</strong></div>
              <div><span>Expenses</span><strong>−{formatCurrency(expenses, currency)}</strong></div>
            </div>

            <button type="button" className="export-download-button" onClick={handleExport} disabled={isBusy}>
              <Download size={15} />
              {isBusy ? 'Preparing export…' : format === 'CSV' ? 'Export CSV' : 'Create PDF statement'}
            </button>
          </section>

          <section className={`workspace-card export-preview ${format === 'PDF' ? 'pdf-preview' : ''}`}>
            <div className="export-preview-heading">
              <h2>Preview</h2>
              <span>{format === 'CSV' ? 'transactions.csv' : 'statement.pdf'}</span>
            </div>
            {format === 'CSV' ? (
              <pre className="export-csv-preview">{csvPreview(includedTransactions)}</pre>
            ) : (
              <div className="statement-preview">
                <div className="statement-heading">
                  <div>
                    <h3>SpendSync statement</h3>
                    <span>{currentMonth} · {include === 'ALL' ? 'All transactions' : include.toLowerCase()}</span>
                  </div>
                  <span>{user?.name || 'Personal statement'}</span>
                </div>
                <div className="statement-totals">
                  <span>Income <strong>+{formatCurrency(income, currency)}</strong></span>
                  <span>Expenses <strong>−{formatCurrency(expenses, currency)}</strong></span>
                  <span>Net <strong>{formatCurrency(net, currency)}</strong></span>
                </div>
                <div className="statement-rows">
                  {includedTransactions.length ? includedTransactions.map((transaction) => (
                    <div className="statement-row" key={transaction.id}>
                      <span>
                        <strong>{transaction.description || transaction.category}</strong>
                        <small>{transaction.category} · {formatDate(transaction.date)}</small>
                      </span>
                      <strong className={transaction.type === 'INCOME' ? 'text-income' : ''}>
                        {transaction.type === 'INCOME' ? '+' : '−'}{formatCurrency(transaction.amount, currency)}
                      </strong>
                    </div>
                  )) : <p className="statement-empty">No transactions match this selection.</p>}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
