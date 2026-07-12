import React from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastMessage } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" aria-live="assertive" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="toast-icon text-success" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon text-warning" size={20} />;
      case 'error':
        return <AlertOctagon className="toast-icon text-danger" size={20} />;
      case 'info':
      default:
        return <Info className="toast-icon text-info" size={20} />;
    }
  };

  return (
    <div className={`toast-item toast-${toast.type}`} role="status">
      {getIcon()}
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close-btn focus-ring" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
};
