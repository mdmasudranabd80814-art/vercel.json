import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Truck, 
  User, 
  Compass, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  Radio, 
  Maximize2, 
  ChevronRight,
  AlertCircle,
  Key,
  Crosshair,
  ExternalLink,
  Zap
} from 'lucide-react';

export type ArrivalStage = 'dispatched' | 'on_the_way' | 'arrived' | 'in_service' | 'completed';

export interface ProviderArrivalTrackerProps {
  orderId: string;
  orderTitle?: string;
  customerAddress?: string;
  customerName?: string;
  customerPhone?: string;
  technician?: {
    name: string;
    phone: string;
    rating?: number;
    title?: string;
    vehicleNo?: string;
    vehicleType?: string;
  };
  initialStage?: ArrivalStage;
  onStageChange?: (newStage: ArrivalStage) => void;
  compact?: boolean;
}

const STAGE_DETAILS: Record<ArrivalStage, {
  labelBn: string;
  labelEn: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  etaDefault: string;
  distanceDefault: string;
}> = {
  dispatched: {
    labelBn: 'ডিসপ্যাচড (Dispatched)',
    labelEn: 'Dispatched',
    description: 'টেকনিশিয়ান হাব থেকে প্রয়োজনীয় সরঞ্জাম নিয়ে রওনা হওয়ার জন্য প্রস্তুত।',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: 'text-amber-800',
    etaDefault: '১৫-২০ মি.',
    distanceDefault: '৪.২ কি.মি.'
  },
  on_the_way: {
    labelBn: 'অন দ্য ওয়ে (On the way)',
    labelEn: 'On the way',
    description: 'টেকনিশিয়ান মোটরসাইকেলে আপনার দেয়া ঠিকানার দিকে এগিয়ে আসছেন।',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    badgeText: 'text-blue-800',
    etaDefault: '৫-৮ মি.',
    distanceDefault: '১.৪ কি.মি.'
  },
  arrived: {
    labelBn: 'পৌঁছে গেছেন (Arrived)',
    labelEn: 'Arrived at Location',
    description: 'টেকনিশিয়ান আপনার বাড়ির গেটে বা দরজায় উপস্থিত আছেন!',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'text-emerald-800',
    etaDefault: 'পৌঁছে গেছেন',
    distanceDefault: '০.০ কি.মি.'
  },
  in_service: {
    labelBn: 'কাজ চলছে (In Service)',
    labelEn: 'Service In Progress',
    description: 'টেকনিশিয়ান স্থানে কাজ শুরু করেছেন। সেফটি ও ভেরিফিকেশন কোড মিলিয়ে নিন।',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    badgeText: 'text-purple-800',
    etaDefault: 'কাজ চলমান',
    distanceDefault: 'গন্তব্যে উপস্থিত'
  },
  completed: {
    labelBn: 'সম্পন্ন (Completed)',
    labelEn: 'Completed',
    description: 'সার্ভিস সফলভাবে শেষ হয়েছে। অলসার্ভিস বিডি-তে ধন্যবাদ!',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    badgeText: 'text-teal-800',
    etaDefault: 'কাজ সম্পন্ন',
    distanceDefault: 'সমাপ্ত'
  }
};

export const ProviderArrivalTracker: React.FC<ProviderArrivalTrackerProps> = ({
  orderId,
  orderTitle = 'সার্ভিস বুকিং (Service Booking)',
  customerAddress = 'ঠিকানা প্রদান করা হয়নি (Address not provided)',
  customerName = 'গ্রাহকের নাম (Customer)',
  customerPhone = 'প্রদান করা হয়নি (Not provided)',
  technician = {
    name: 'নির্ধারিত টেকনিশিয়ান',
    phone: '০১৭...',
    rating: 5.0,
    title: 'সার্ভিস স্পেশালিস্ট',
    vehicleNo: 'ঢাকা মেট্রো-...',
    vehicleType: 'সার্ভিস বাইক'
  },
  initialStage = 'on_the_way',
  onStageChange,
  compact = false
}) => {
  const [currentStage, setCurrentStage] = useState<ArrivalStage>(initialStage);
  const [progressPercent, setProgressPercent] = useState<number>(() => {
    switch (initialStage) {
      case 'dispatched': return 15;
      case 'on_the_way': return 60;
      case 'arrived': return 92;
      case 'in_service': return 98;
      case 'completed': return 100;
      default: return 60;
    }
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [etaMinutes, setEtaMinutes] = useState<number>(7);
  const [remainingKm, setRemainingKm] = useState<number>(1.2);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
  const [quickSmsText, setQuickSmsText] = useState<string>('আমি বাসায় উপস্থিত আছি, মেইন গেট দিয়ে চলে আসুন।');
  const [smsSentNotice, setSmsSentNotice] = useState<boolean>(false);
  const [securityCode] = useState<string>('ASBD-4920');

  // Simulated GPS Coordinates Along Route
  // Starts at Hub (Uttara Sector 1) -> Moves towards Customer (Sector 7)
  const routePoints = [
    { x: 12, y: 78, landmark: 'অলসার্ভিস বিডি সেন্ট্রাল হাব' },
    { x: 28, y: 64, landmark: 'জসিমউদ্দীন ফ্লাইওভার মোড়' },
    { x: 48, y: 48, landmark: 'রবীন্দ্র সরণি এভিনিউ' },
    { x: 68, y: 35, landmark: 'উত্তরা সেক্টর ৭ লেক পাড়' },
    { x: 88, y: 22, landmark: 'গ্রাহকের ঠিকানা (বাসা ২৪, রোড ১২)' }
  ];

  // Calculate Provider current x, y position on SVG map from progressPercent
  const getProviderCoordinates = (pct: number) => {
    const totalSegments = routePoints.length - 1;
    const clampedPct = Math.min(100, Math.max(0, pct));
    const segmentIndex = Math.min(
      totalSegments - 1,
      Math.floor((clampedPct / 100) * totalSegments)
    );
    const segmentProgress =
      (clampedPct / 100) * totalSegments - segmentIndex;

    const start = routePoints[segmentIndex];
    const end = routePoints[segmentIndex + 1] || start;

    const currentX = start.x + (end.x - start.x) * segmentProgress;
    const currentY = start.y + (end.y - start.y) * segmentProgress;

    return { x: currentX, y: currentY, currentLandmark: start.landmark };
  };

  const providerPos = getProviderCoordinates(progressPercent);

  // Sync stage when progress percent changes
  useEffect(() => {
    let newStage: ArrivalStage = currentStage;
    if (progressPercent < 30) {
      newStage = 'dispatched';
      setEtaMinutes(15);
      setRemainingKm(3.8);
    } else if (progressPercent < 88) {
      newStage = 'on_the_way';
      const remainingPct = (88 - progressPercent) / 58;
      setEtaMinutes(Math.max(1, Math.round(remainingPct * 10)));
      setRemainingKm(parseFloat((remainingPct * 2.5).toFixed(1)));
    } else if (progressPercent < 96) {
      newStage = 'arrived';
      setEtaMinutes(0);
      setRemainingKm(0);
    } else if (progressPercent < 100) {
      newStage = 'in_service';
      setEtaMinutes(0);
      setRemainingKm(0);
    } else {
      newStage = 'completed';
      setEtaMinutes(0);
      setRemainingKm(0);
    }

    if (newStage !== currentStage) {
      setCurrentStage(newStage);
      if (onStageChange) onStageChange(newStage);
    }
  }, [progressPercent]);

  // Live map movement simulation interval
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setIsSimulating(false);
          return 100;
        }
        return Math.min(100, prev + 0.8 * simSpeed);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Stage Switch Handler
  const handleSelectStage = (stage: ArrivalStage) => {
    setCurrentStage(stage);
    if (onStageChange) onStageChange(stage);

    switch (stage) {
      case 'dispatched':
        setProgressPercent(15);
        break;
      case 'on_the_way':
        setProgressPercent(55);
        break;
      case 'arrived':
        setProgressPercent(90);
        break;
      case 'in_service':
        setProgressPercent(97);
        break;
      case 'completed':
        setProgressPercent(100);
        break;
    }
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSentNotice(true);
    setTimeout(() => {
      setSmsSentNotice(false);
      setShowSmsModal(false);
    }, 1800);
  };

  const stageMeta = STAGE_DETAILS[currentStage];

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden font-sans space-y-0 relative">
      {/* 1. Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700/50">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>লাইভ জিও-ট্র্যাকিং (Live GPS Map Tracker)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>প্রোভাইডার আগমন স্ট্যাটাস</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-emerald-800 text-emerald-200 rounded-lg">
              #{orderId}
            </span>
          </h3>
          <p className="text-xs text-emerald-100/90 font-medium truncate max-w-md">
            সার্ভিস: {orderTitle}
          </p>
        </div>

        {/* Current Stage Badge & Simulation Controls */}
        <div className="flex items-center gap-2 relative z-10 self-start sm:self-auto">
          <span className={`px-3 py-1.5 rounded-full text-xs font-black border shadow-xs flex items-center gap-1.5 ${stageMeta.badgeBg}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
            <span>{stageMeta.labelBn}</span>
          </span>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/30 hover:bg-amber-500/30'
                : 'bg-emerald-700/80 text-white border-emerald-600 hover:bg-emerald-700'
            }`}
            title={isSimulating ? 'সিমুলেশন বিরতি দিন' : 'লাইভ সিমুলেশন প্লে করুন'}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSimulating ? 'পজ' : 'প্লে'}</span>
          </button>

          <button
            onClick={() => setProgressPercent(15)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            title="পুনরায় রিসেট করুন"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Arrival Stages Quick Bar */}
      <div className="bg-emerald-950/90 border-b border-emerald-800/60 p-2.5 overflow-x-auto custom-scrollbar flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-bold text-emerald-300 shrink-0 flex items-center gap-1 mr-1">
          <Compass className="w-3.5 h-3.5 text-emerald-400" /> ধাপ নির্বাচন:
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleSelectStage('dispatched')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentStage === 'dispatched'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <span>১. ডিসপ্যাচড</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

          <button
            onClick={() => handleSelectStage('on_the_way')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentStage === 'on_the_way'
                ? 'bg-blue-500 text-white font-black shadow-md'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>২. অন দ্য ওয়ে</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

          <button
            onClick={() => handleSelectStage('arrived')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentStage === 'arrived'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>৩. পৌঁছে গেছেন</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

          <button
            onClick={() => handleSelectStage('in_service')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentStage === 'in_service'
                ? 'bg-purple-500 text-white font-black shadow-md'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <span>৪. কাজ চলছে</span>
          </button>
        </div>
      </div>

      {/* 3. SIMULATED VISUAL MAP CANVAS CONTAINER */}
      <div className="relative bg-slate-900 min-h-[260px] sm:min-h-[300px] overflow-hidden flex flex-col justify-between">
        {/* Vector Map Background Pattern */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"
        />
        
        {/* Map Grid Lines SVG & Route Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Simulated Road Grid Lines */}
          <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="#334155" strokeWidth="10" />
          <line x1="0%" y1="65%" x2="100%" y2="65%" stroke="#334155" strokeWidth="8" />
          <line x1="30%" y1="0%" x2="30%" y2="100%" stroke="#334155" strokeWidth="6" />
          <line x1="70%" y1="0%" x2="70%" y2="100%" stroke="#334155" strokeWidth="6" />

          {/* Active Navigation Polyline Track */}
          <polyline
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            points={routePoints.map((p) => `${p.x}%,${p.y}%`).join(' ')}
          />

          {/* Dashed Route Path */}
          <polyline
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
            points={routePoints.map((p) => `${p.x}%,${p.y}%`).join(' ')}
          />
        </svg>

        {/* Map Header Overlay Info */}
        <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-emerald-500/30 text-white space-y-0.5 shadow-lg pointer-events-auto">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>চলতি লোকেশন মোড়:</span>
            </div>
            <p className="text-xs font-bold text-emerald-100 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{providerPos.currentLandmark}</span>
            </p>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-blue-500/30 text-white text-right space-y-0.5 shadow-lg pointer-events-auto">
            <div className="flex items-center justify-end gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>আনুমানিক সময় (ETA):</span>
            </div>
            <p className="text-sm font-black text-amber-300 font-mono">
              {currentStage === 'arrived' || currentStage === 'in_service' || currentStage === 'completed' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> দরজায় উপস্থিত!
                </span>
              ) : (
                `~ ${etaMinutes} মিনিট (${remainingKm} কিমি)`
              )}
            </p>
          </div>
        </div>

        {/* STARTING POINT PIN (HUB) */}
        <div 
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          style={{ left: `${routePoints[0].x}%`, top: `${routePoints[0].y}%` }}
        >
          <div className="bg-slate-800 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-600 mb-1 shadow-md whitespace-nowrap">
            অলসার্ভিস হাব
          </div>
          <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        {/* DESTINATION PIN (CUSTOMER ADDRESS) */}
        <div 
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          style={{ left: `${routePoints[4].x}%`, top: `${routePoints[4].y}%` }}
        >
          <div className="bg-purple-900 text-purple-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-400 mb-1 shadow-md whitespace-nowrap animate-bounce">
            আপনার গন্তব্য
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-purple-500/40 animate-ping"></div>
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl relative z-10">
              <MapPin className="w-5 h-5 fill-purple-300" />
            </div>
          </div>
        </div>

        {/* MOVING VEHICLE / PROVIDER MARKER */}
        <div 
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 ease-out pointer-events-auto cursor-pointer group"
          style={{ left: `${providerPos.x}%`, top: `${providerPos.y}%` }}
        >
          {/* Provider Tooltip Banner */}
          <div className="bg-emerald-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-xl border border-emerald-400 mb-1 shadow-2xl flex items-center gap-1.5 whitespace-nowrap group-hover:scale-105 transition-transform">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{technician.name} (অন ট্র্যাক)</span>
          </div>

          {/* Vehicle Radar Pulse */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-pulse"></div>
            <div className="absolute -inset-6 rounded-full bg-emerald-400/10 animate-ping"></div>

            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-slate-950 rounded-full flex items-center justify-center border-2 border-white shadow-2xl scale-110">
              <Truck className="w-6 h-6 fill-slate-900" />
            </div>
          </div>
        </div>

        {/* Map Bottom Progress Bar Track Overlay */}
        <div className="relative z-10 p-3 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>পথের অগ্রগতি: {Math.round(progressPercent)}%</span>
            </span>
            <span className="text-slate-400 font-mono">
              হাব ➔ সেক্টর ৭ উত্তরা
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative border border-slate-700">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Stage Status Banner Callout */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border-b border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${stageMeta.badgeBg}`}>
              {stageMeta.labelEn}
            </span>
            <span className="text-xs font-bold text-gray-500">• লাইভ আপডেট</span>
          </div>
          <h4 className="text-base font-black text-gray-900">
            {stageMeta.labelBn}
          </h4>
          <p className="text-xs text-gray-700 max-w-xl font-medium">
            {stageMeta.description}
          </p>
        </div>

        {/* Verification OTP Security Code Box */}
        <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs shrink-0 space-y-1 text-center md:text-right">
          <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center justify-center md:justify-end gap-1">
            <Key className="w-3.5 h-3.5 text-emerald-700" />
            <span>সিকিউরিটি ওটিপি কোড</span>
          </span>
          <div className="text-lg font-black font-mono tracking-wider text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-300 inline-block">
            {securityCode}
          </div>
          <p className="text-[10px] text-gray-500">কাজ শুরু করার পূর্বে প্রোভাইডারকে এই কোডটি দিন</p>
        </div>
      </div>

      {/* 5. Assigned Provider Card & Contact Action Controls */}
      <div className="p-4 sm:p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          {/* Provider Profile Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-lg flex items-center justify-center border-2 border-emerald-200 shadow-md">
                {technician.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h5 className="font-bold text-gray-900 text-sm">{technician.name}</h5>
                {technician.rating && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                    ★ {technician.rating}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800 font-semibold">{technician.title}</p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-700" />
                <span>যানবাহন: {technician.vehicleNo} ({technician.vehicleType})</span>
              </p>
            </div>
          </div>

          {/* Action Call & SMS Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${technician.phone}`}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              <span>কল করুন ({technician.phone})</span>
            </a>

            <button
              onClick={() => setShowSmsModal(true)}
              className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all border border-gray-300 flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>মেসেজ দিন</span>
            </button>
          </div>
        </div>

        {/* Address Location Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
            <span className="font-bold text-emerald-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" /> গ্রাহকের ডেলিভারি ঠিকানা:
            </span>
            <p className="text-gray-700 font-medium truncate">{customerAddress}</p>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1">
            <span className="font-bold text-teal-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> সাপোর্ট সহায়তার প্রয়োজন?
            </span>
            <p className="text-gray-700 font-medium">হটলাইন: ০৯৬১২-০০০০০০ (২৪/৭ সাপোর্ট)</p>
          </div>
        </div>
      </div>

      {/* 6. Quick SMS Modal Popup */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-gray-900 text-base">টেকনিশিয়ানকে দ্রুত বার্তা পাঠান</h4>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {smsSentNotice ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-950 text-sm">মেসেজ সফলভাবে পাঠানো হয়েছে!</p>
                <p className="text-xs text-emerald-800">টেকনিশিয়ান আপনার মেসেজটি পাওয়ার পর দ্রুত রেসপন্স করবেন।</p>
              </div>
            ) : (
              <form onSubmit={handleSendSms} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">বার্তার বিষয়বস্তু:</label>
                  <textarea
                    rows={3}
                    value={quickSmsText}
                    onChange={(e) => setQuickSmsText(e.target.value)}
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden text-gray-900"
                    placeholder="আপনার বার্তা লিখুন..."
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">দ্রুত বাছাই করুন:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickSmsText('আমি বাসায় উপস্থিত আছি, চলে আসুন।')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      • বাসায় আছি
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickSmsText('পৌঁছানোর ৫ মিনিট আগে আমাকে কল দিবেন।')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      • ৫ মিনিট আগে কল দিন
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickSmsText('মেইন গেট খোলা আছে, ৩য় তলায় চলে আসুন।')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      • ৩য় তলায় আসুন
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSmsModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>মেসেজ পাঠান</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderArrivalTracker;
