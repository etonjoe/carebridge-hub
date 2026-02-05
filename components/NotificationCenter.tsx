
import React, { useEffect } from 'react';
import { AppNotification } from '../types';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Props {
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

// NotificationCenter component displays a list of active notifications as toast messages
const NotificationCenter: React.FC<Props> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
      ))}
    </div>
  );
};

interface ToastProps {
  notification: AppNotification;
  onClose: () => void;
}

// Toast component handles individual notification display and auto-dismissal
const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
  };

  const colors = {
    success: 'border-emerald-100 bg-white',
    info: 'border-blue-100 bg-white',
    warning: 'border-amber-100 bg-white',
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl animate-in slide-in-from-right-10 duration-300 ${colors[notification.type]}`}>
      <div className="shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{notification.title}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
      </div>
      <button onClick={onClose} className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationCenter;
