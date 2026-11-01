import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  UserCheck, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  PhoneCall, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ChevronRight,
  PackageCheck,
  Wrench,
  ShoppingBag,
  Compass,
  Map
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ProviderArrivalTracker, ArrivalStage } from './ProviderArrivalTracker';

export type OrderStatusType = 
  | 'received' 
  | 'pending' 
  | 'confirmed'
  | 'assigned' 
  | 'on_the_way' 
  | 'in_progress' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export interface ProgressStep {
  key: string;
  labelBn: string;
  labelEn: string;
  descriptionBn: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface OrderProgressProps {
  orderId?: string;
  collectionName?: 'orders' | 'bookings';
  status?: OrderStatusType | string;
  type?: 'service' | 'hardware';
  variant?: 'full' | 'compact' | 'stepper';
  customerName?: string;
  customerPhone?: string;
  address?: string;
  estimatedTime?: string;
  technician?: {
    name: string;
    phone: string;
    rating?: number;
    title?: string;
  };
  onStatusChange?: (newStatus: OrderStatusType) => void;
  showSimulateButton?: boolean;
  className?: string;
}

// Fixed 4-Stage Workflow Steps matching user request: Pending -> Confirmed -> In Progress -> Completed
export const WORKFLOW_STEPS: ProgressStep[] = [
  {
    key: 'pending',
    labelBn: '১. অপেক্ষমাণ',
    labelEn: 'Pending',
    descriptionBn: 'আপনার অর্ডারটি সফলভাবে জমা হয়েছে এবং অনুমোদনের অপেক্ষায় আছে',
    icon: Clock,
  },
  {
    key: 'confirmed',
    labelBn: '২. নিশ্চিতকৃত',
    labelEn: 'Confirmed',
    descriptionBn: 'অর্ডারটি নিশ্চিত করা হয়েছে এবং কর্মী নির্ধারণ করা হচ্ছে',
    icon: UserCheck,
  },
  {
    key: 'in_progress',
    labelBn: '৩. প্রক্রিয়াধীন',
    labelEn: 'In Progress',
    descriptionBn: 'কাজটি বর্তমানে চলমান রয়েছে',
    icon: RefreshCw,
  },
  {
    key: 'completed',
    labelBn: '৪. সম্পন্ন',
    labelEn: 'Completed',
    descriptionBn: 'অর্ডারটি সফলভাবে সম্পন্ন হয়েছে',
    icon: CheckCircle2,
  },
];

/**
 * Maps raw status string from Firestore to index 0..3 in the 4-step workflow.
 */
export function getStepIndexFromStatus(status?: string): number {
  if (!status) return 0;
  const s = status.toLowerCase();

  if (s === 'completed' || s === 'delivered' || s === 'finished') {
    return 3;
  }
  if (s === 'in_progress' || s === 'on_the_way' || s === 'processing' || s === 'shipped') {
    return 2;
  }
  if (s === 'confirmed' || s === 'assigned' || s === 'technician_assigned' || s === 'received') {
    // If it's 'received', we might consider it 'Pending' or 'Confirmed'. 
    // Usually 'received' is the very first state.
    // Let's map 'received' to index 0 (Pending) and others to index 1 (Confirmed)
    if (s === 'received') return 0;
    return 1;
  }
  // Default 'pending', 'created'
  return 0;
}

export const OrderProgress: React.FC<OrderProgressProps> = ({
  orderId,
  collectionName = 'orders',
  status: propStatus = 'received',
  type = 'service',
  variant = 'full',
  customerName,
  customerPhone,
  address,
  estimatedTime,
  technician: initialTechnician,
  onStatusChange,
  showSimulateButton = false,
  className = '',
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>(propStatus);
  const [technician, setTechnician] = useState(initialTechnician);
  const [isLoading, setIsLoading] = useState<boolean>(!!orderId);
  const [lastUpdated, setLastUpdated] = useState<string>('এখনই আপডেটেড');
  const [progressTab, setProgressTab] = useState<'map' | 'timeline'>('map');

  // Real-time Firestore Listener if orderId is provided
  useEffect(() => {
    if (!orderId) {
      setCurrentStatus(propStatus);
      return;
    }

    setIsLoading(true);
    const targetColl = collectionName || (orderId.startsWith('ASBD-') ? 'bookings' : 'orders');
    const docRef = doc(db, targetColl, orderId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        setIsLoading(false);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const liveStatus = data.status || 'received';
          setCurrentStatus(liveStatus);
          
          if (data.technician) {
            setTechnician(data.technician);
          } else if (data.assignedTo) {
            setTechnician({
              name: data.assignedTo.name || 'নির্ধারিত টেকনিশিয়ান',
              phone: data.assignedTo.phone || '০১৭...',
              rating: data.assignedTo.rating || 5.0,
              title: data.assignedTo.title || 'সার্ভিস স্পেশালিস্ট'
            });
          }

          if (data.updatedAt) {
            try {
              const dt = new Date(data.updatedAt);
              setLastUpdated(dt.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }));
            } catch {
              setLastUpdated('সাম্প্রতিক');
            }
          }

          if (onStatusChange) {
            onStatusChange(liveStatus as OrderStatusType);
          }
        }
      },
      (error) => {
        setIsLoading(false);
        handleFirestoreError(error, OperationType.GET, `${targetColl}/${orderId}`);
      }
    );

    return () => unsubscribe();
  }, [orderId, collectionName, propStatus]);

  // Keep state synced with propStatus when orderId is not used
  useEffect(() => {
    if (!orderId && propStatus) {
      setCurrentStatus(propStatus);
    }
  }, [propStatus, orderId]);

  const isCancelled = currentStatus === 'cancelled';
  const activeStepIdx = isCancelled ? -1 : getStepIndexFromStatus(currentStatus);
  const progressPercentage = isCancelled ? 0 : Math.round(((activeStepIdx + 1) / 4) * 100);

  // Status Badge Helper
  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-300">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          <span>অর্ডার বাতিল (Cancelled)</span>
        </span>
      );
    }

    switch (activeStepIdx) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>১. অপেক্ষমাণ (Pending)</span>
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-900 border border-sky-300">
            <UserCheck className="w-3.5 h-3.5 text-sky-700" />
            <span>২. নিশ্চিতকৃত (Confirmed)</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
            <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin" />
            <span>৩. প্রক্রিয়াধীন (In Progress)</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>৪. সম্পন্ন (Completed)</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Next status simulator for interactive testing
  const handleSimulateNextStatus = () => {
    const cycle: Record<string, OrderStatusType> = {
      pending: 'confirmed',
      received: 'confirmed',
      confirmed: 'in_progress',
      assigned: 'in_progress',
      in_progress: 'completed',
      on_the_way: 'completed',
      completed: 'pending',
      cancelled: 'pending'
    };
    const next = cycle[currentStatus] || 'confirmed';
    setCurrentStatus(next);
    if (onStatusChange) onStatusChange(next);
  };

  // ==========================================
  // VARIANT 1: COMPACT (Horizontal Stepper for cards)
  // ==========================================
  if (variant === 'compact') {
    return (
      <div className={`space-y-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">অর্ডার ট্র্যাকিং:</span>
            {getStatusBadge()}
          </div>
          {!isCancelled && (
            <span className="font-mono font-extrabold text-emerald-800 text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {progressPercentage}% সম্পূর্ণ
            </span>
          )}
        </div>

        {!isCancelled ? (
          <div className="relative pt-1 pb-1">
            {/* Visual Step Timeline */}
            <div className="flex items-center justify-between relative px-2">
              {/* Background Line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 -z-0" />
              
              {/* Active Progress Line */}
              <div 
                className="absolute top-1/2 left-4 h-0.5 bg-emerald-500 transition-all duration-700 -translate-y-1/2 -z-0"
                style={{ 
                  width: `${activeStepIdx === 0 ? '0%' : activeStepIdx === 1 ? '33%' : activeStepIdx === 2 ? '66%' : 'calc(100% - 32px)'}`
                }}
              />

              {WORKFLOW_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110' 
                          : isPassed 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white text-gray-300 border border-gray-200 shadow-xs'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[9px] font-black uppercase tracking-tighter text-center max-w-[50px] leading-[10px] ${
                        isCurrent
                          ? 'text-emerald-900'
                          : isPassed
                          ? 'text-emerald-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-[11px] text-red-700 font-bold">
              অর্ডারটি বাতিল করা হয়েছে। সাহায্যের জন্য সাপোর্টে যোগাযোগ করুন।
            </p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VARIANT 2: STEPPER (Vertical Timeline)
  // ==========================================
  if (variant === 'stepper') {
    return (
      <div className={`bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 ${className}`}>
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              {type === 'service' ? <Wrench className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">অর্ডার প্রোগ্রেস টাইমলাইন</h4>
              {orderId && <p className="text-[11px] font-mono text-gray-500">আইডি: #{orderId}</p>}
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {isCancelled ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <h5 className="font-bold text-red-900 text-sm">অর্ডারটি বাতিল করা হয়েছে</h5>
            <p className="text-xs text-red-700">কোনো প্রশ্ন থাকলে অনুগ্রহ করে আমাদের কল সেন্টারে কল করুন।</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {WORKFLOW_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPassed = idx <= activeStepIdx;
              const isCurrent = idx === activeStepIdx;

              return (
                <div key={step.key} className="relative group">
                  {/* Circle Dot */}
                  <div
                    className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  {/* Step Info */}
                  <div className={`space-y-0.5 ${isCurrent ? 'bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs sm:text-sm ${isCurrent ? 'text-emerald-950 font-black' : isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.labelBn}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-semibold">
                        ({step.labelEn})
                      </span>
                    </div>
                    <p className={`text-xs ${isCurrent ? 'text-emerald-800 font-medium' : 'text-gray-500'}`}>
                      {step.descriptionBn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VARIANT 3: FULL (Rich default view with visual line)
  // ==========================================
  return (
    <div className={`bg-white rounded-3xl border border-emerald-100 shadow-md p-5 sm:p-6 space-y-6 relative overflow-hidden ${className}`}>
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-800 text-white font-bold inline-flex items-center justify-center">
              {type === 'service' ? <Wrench className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </span>
            <h3 className="font-black text-gray-900 text-base sm:text-lg tracking-tight">
              অর্ডার ও সার্ভিস প্রোগ্রেস (Real-time Status)
            </h3>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            {orderId && <span className="font-mono font-bold text-emerald-900">আইডি: #{orderId}</span>}
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>লাইভ আপডেট: {lastUpdated}</span>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {getStatusBadge()}
        </div>
      </div>

      {/* Cancelled View */}
      {isCancelled ? (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 text-center space-y-2">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-red-950 text-base">অর্ডারটি বাতিল করা হয়েছে (Order Cancelled)</h4>
          <p className="text-xs text-red-800 max-w-md mx-auto">
            এই বুকিং অথবা অর্ডারটি বর্তমানে বাতিল অবস্থায় রয়েছে। আপনি চাইলে পুনরায় বুক করতে পারেন অথবা আমাদের হেল্পলাইনে কল করতে পারেন।
          </p>
          <div className="pt-2">
            <a
              href="tel:09612000000"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>হেল্পলাইনে কল করুন (09612-000000)</span>
            </a>
          </div>
        </div>
      ) : (
        /* View Mode Switcher: Map vs Timeline */
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setProgressTab('map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  progressTab === 'map'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-300" />
                <span>লাইভ ম্যাপ ট্র্যাকিং</span>
              </button>

              <button
                onClick={() => setProgressTab('timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  progressTab === 'timeline'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>টাইমলাইন স্টেপস</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {progressPercentage}% সম্পূর্ণ
            </span>
          </div>

          {progressTab === 'map' ? (
            <ProviderArrivalTracker
              orderId={orderId || 'ASBD-LIVE'}
              customerAddress={address}
              customerName={customerName}
              customerPhone={customerPhone}
              technician={technician}
              initialStage={
                currentStatus === 'completed' || currentStatus === 'delivered'
                  ? 'completed'
                  : currentStatus === 'in_progress'
                  ? 'in_service'
                  : currentStatus === 'on_the_way'
                  ? 'on_the_way'
                  : 'dispatched'
              }
            />
          ) : (
            /* Active Steps Horizontal Bar */
            <div className="space-y-6">
              {/* Visual Step Timeline */}
              <div className="relative pt-3 pb-2">
                {/* Background Connecting Line */}
                <div className="absolute top-8 left-[12%] right-[12%] h-1.5 bg-gray-200 rounded-full -z-0" />

                {/* Filled Progress Line */}
                <div
                  className="absolute top-8 left-[12%] h-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 rounded-full transition-all duration-700 -z-0"
                  style={{
                    width: `${
                      activeStepIdx === 0
                        ? '0%'
                        : activeStepIdx === 1
                        ? '25%'
                        : activeStepIdx === 2
                        ? '50%'
                        : '76%'
                    }`,
                  }}
                />

                {/* 4 Main Step Circles */}
                <div className="grid grid-cols-4 gap-2 relative z-10">
                  {WORKFLOW_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isPassed = idx < activeStepIdx;
                    const isCurrent = idx === activeStepIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center space-y-2 group">
                        {/* Circle Node */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs ${
                            isCurrent
                              ? 'bg-emerald-800 text-white ring-4 ring-emerald-200 scale-110 shadow-lg'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-gray-400 border-2 border-gray-200'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : (
                            <StepIcon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                          )}
                        </div>

                        {/* Step Titles */}
                        <div className="space-y-0.5">
                          <span
                            className={`block text-xs sm:text-sm font-bold tracking-tight leading-tight ${
                              isCurrent
                                ? 'text-emerald-950 font-black'
                                : isPassed
                                ? 'text-gray-900 font-bold'
                                : 'text-gray-400 font-medium'
                            }`}
                          >
                            {step.labelBn}
                          </span>
                          <span
                            className={`block text-[10px] font-mono ${
                              isCurrent ? 'text-emerald-800 font-bold' : 'text-gray-400'
                            }`}
                          >
                            {step.labelEn}
                          </span>
                        </div>

                        {/* Step Subtext */}
                        <p className="text-[11px] text-gray-500 hidden md:block max-w-[130px] leading-tight">
                          {step.descriptionBn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Active Step Highlight Callout Box */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 p-4 rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-800 text-white shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                      বর্তমান অগ্রগতি বিবরণ
                    </span>
                    <h4 className="font-extrabold text-gray-900 text-sm">
                      {WORKFLOW_STEPS[activeStepIdx]?.labelBn} ({WORKFLOW_STEPS[activeStepIdx]?.labelEn})
                    </h4>
                    <p className="text-xs text-gray-700">
                      {WORKFLOW_STEPS[activeStepIdx]?.descriptionBn}
                    </p>
                  </div>
                </div>

                {/* Assigned Provider/Technician Info Card if Step >= 1 */}
                {technician && activeStepIdx >= 1 && (
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs shrink-0 flex items-center justify-between gap-3 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs">
                        {technician.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                          <span>{technician.name}</span>
                          {technician.rating && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded font-mono">
                              ★ {technician.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">{technician.title || 'স্পেশালিস্ট প্রোভাইডার'}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${technician.phone}`}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs shrink-0"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>কল করুন</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderProgress;
