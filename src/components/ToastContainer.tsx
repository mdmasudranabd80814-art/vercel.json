import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  XCircle, 
  X, 
  ChevronRight, 
  Wrench, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export interface ToastNotification {
  id: string;
  orderId: string;
  orderType: 'service' | 'hardware' | 'general';
  title: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  timestamp: Date;
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onViewOrder?: (orderId: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onViewOrder,
}) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-2 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const isService = toast.orderType === 'service';

        // Color & icon mappings by status
        let statusBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        let statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let statusText = 'সম্পন্ন';

        if (toast.status === 'pending') {
          statusBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
          statusIcon = <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />;
          statusText = 'অপেক্ষমাণ (Pending)';
        } else if (toast.status === 'in_progress') {
          statusBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
          statusIcon = <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />;
          statusText = 'প্রক্রিয়াধীন (In Progress)';
        } else if (toast.status === 'cancelled') {
          statusBadgeClass = 'bg-red-100 text-red-900 border-red-300';
          statusIcon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
          statusText = 'বাতিল (Cancelled)';
        } else if (toast.status === 'completed') {
          statusBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
          statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          statusText = 'সম্পন্ন (Completed)';
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-4 transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.02] overflow-hidden relative group"
          >
            {/* Top status indicator bar */}
            <div 
              className={`absolute top-0 left-0 right-0 h-1 ${
                toast.status === 'completed'
                  ? 'bg-emerald-500'
                  : toast.status === 'in_progress'
                  ? 'bg-blue-500'
                  : toast.status === 'pending'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            />

            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 shrink-0 mt-0.5">
                {statusIcon}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-extrabold text-xs text-gray-900 tracking-tight truncate">
                      {toast.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass} shrink-0`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="বন্ধ করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-600 leading-snug font-medium">
                  {toast.message}
                </p>

                {/* Footer with Order ID and View Button */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-[11px] mt-2">
                  <span className="font-mono text-emerald-800 font-bold flex items-center gap-1">
                    {isService ? <Wrench className="w-3 h-3 text-emerald-700" /> : <ShoppingBag className="w-3 h-3 text-emerald-700" />}
                    #{toast.orderId}
                  </span>

                  {onViewOrder && (
                    <button
                      onClick={() => onViewOrder(toast.orderId)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <span>অর্ডার দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
