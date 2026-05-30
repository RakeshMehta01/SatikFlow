import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info as InfoIcon, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;
let listeners: Listener[] = [];
let toasts: ToastItem[] = [];

const notify = () => {
  listeners.forEach(l => l([...toasts]));
};

export const toast = {
  add(type: ToastType, arg: string | ToastOptions) {
    const id = Math.random().toString(36).substring(2, 9);
    
    let title: string | undefined = undefined;
    let message = '';
    let duration = 3000;
    
    if (typeof arg === 'string') {
      message = arg;
    } else {
      title = arg.title;
      message = arg.message;
      if (arg.duration) {
        duration = arg.duration;
      }
    }

    if (typeof arg === 'string' || !arg.duration) {
      if (type === 'success') duration = 3000;
      else if (type === 'info') duration = 4000;
      else if (type === 'warning') duration = 5000;
      else if (type === 'error') duration = 6000;
    }

    toasts.push({ id, type, title, message, duration });
    notify();
  },
  
  success(arg: string | ToastOptions) {
    this.add('success', arg);
  },
  
  error(arg: string | ToastOptions) {
    this.add('error', arg);
  },
  
  warning(arg: string | ToastOptions) {
    this.add('warning', arg);
  },
  
  info(arg: string | ToastOptions) {
    this.add('info', arg);
  },
  
  dismiss(id: string) {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }
};

const ToastCard: React.FC<{ item: ToastItem }> = ({ item }) => {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(item.duration);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const triggerDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      toast.dismiss(item.id);
    }, 200); // Wait for exit animation
  };

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    if (timeLeft <= 0) {
      triggerDismiss();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 100);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isPaused]);

  const IconComponent = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: InfoIcon
  }[item.type];

  const styles = {
    success: { border: 'border-emerald-100', accent: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    error: { border: 'border-rose-100', accent: 'text-rose-600', bg: 'bg-rose-50/50' },
    warning: { border: 'border-amber-100', accent: 'text-amber-600', bg: 'bg-amber-50/50' },
    info: { border: 'border-blue-100', accent: 'text-blue-600', bg: 'bg-blue-50/50' }
  }[item.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full bg-white rounded-[12px] border ${styles.border} shadow-xl p-4 flex items-start space-x-3 transition-all duration-300 transform ${
        visible ? 'animate-slideIn opacity-100 translate-x-0' : 'animate-slideOut opacity-0 translate-x-12'
      }`}
    >
      <div className={`p-1.5 rounded-[8px] ${styles.bg} ${styles.accent} flex-shrink-0 mt-0.5`}>
        <IconComponent className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        {item.title ? (
          <h5 className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{item.title}</h5>
        ) : (
          <h5 className="text-xs font-bold text-slate-800 leading-tight mb-0.5 uppercase tracking-wide text-[9px] opacity-75">
            {item.type}
          </h5>
        )}
        <p className="text-xs text-slate-600 leading-normal">{item.message}</p>
      </div>
      <button
        onClick={triggerDismiss}
        className="text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded-full transition-colors self-start mt-0.5 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleChange = (newToasts: ToastItem[]) => {
      setActiveToasts(newToasts);
    };
    listeners.push(handleChange);
    handleChange(toasts);
    return () => {
      listeners = listeners.filter(l => l !== handleChange);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col space-y-3 w-full max-w-[380px] pointer-events-none px-4 sm:px-0">
      {activeToasts.map((toastItem) => (
        <ToastCard key={toastItem.id} item={toastItem} />
      ))}
    </div>
  );
};
