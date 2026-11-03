import { AlertCircle, RefreshCw } from 'lucide-react';

const RequestError = ({ message, onRetry, isLoading }) => (
  <div className="request-error" role="alert">
    <div className="request-error-message">
      <AlertCircle size={17} />
      <span>{message}</span>
    </div>
    <button
      type="button"
      className="request-error-retry"
      onClick={onRetry}
      disabled={isLoading}
    >
      <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
      Try again
    </button>
  </div>
);

export default RequestError;
