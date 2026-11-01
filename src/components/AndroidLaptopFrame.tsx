import React from 'react';
import { Chrome, Minus, Square, X, RefreshCw, ShieldCheck, ArrowLeft, ArrowRight, Lock, Laptop, Globe } from 'lucide-react';
import { LaptopViewportMode } from './AndroidLaptopModeBar';

interface AndroidLaptopFrameProps {
  children: React.ReactNode;
  activeMode: LaptopViewportMode;
  isWindowShellActive: boolean;
  onRefresh?: () => void;
}

export const AndroidLaptopFrame: React.FC<AndroidLaptopFrameProps> = ({
  children,
  activeMode,
  isWindowShellActive,
  onRefresh,
}) => {
  // Determine width based on active resolution mode
  const getViewportWidthClass = () => {
    switch (activeMode) {
      case 'laptop-15':
        return 'max-w-[1380px]'; // 15.6" Laptop Aspect Ratio
      case 'tablet-laptop':
        return 'max-w-[1080px]'; // Android Tablet Laptop Ratio
      case 'desktop-ultra':
        return 'max-w-[1600px]'; // Ultra wide desktop
      case 'fluid':
      default:
        return 'w-full';
    }
  };

  if (!isWindowShellActive && activeMode === 'fluid') {
    return <>{children}</>;
  }

  return (
    <div className={`mx-auto transition-all duration-300 py-3 sm:py-6 px-2 sm:px-4 ${getViewportWidthClass()}`}>
      {/* Android Laptop Chrome Frame Container */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/80 overflow-hidden ring-1 ring-black/40">
        
        {/* Top Chromebook Window Title Bar & Browser Controls */}
        <div className="bg-gray-800/90 text-gray-300 text-xs px-4 py-2 flex items-center justify-between border-b border-gray-700 select-none">
          
          {/* Window Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-t-xl border-t-2 border-emerald-500 font-medium text-[11px]">
              <Chrome className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-[220px]">AllServiceBD • অ্যান্ড্রয়েড ল্যাপটপ</span>
              <X className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer ml-1" />
            </div>

            <div className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-gray-200 px-2 py-1 rounded-lg hover:bg-gray-700/50 cursor-pointer text-[11px]">
              <span>+ নতুন ট্যাব</span>
            </div>
          </div>

          {/* Window Controls (Minimize, Maximize, Close) */}
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
              Chromebook OS Mode
            </span>
            <button className="text-gray-400 hover:text-white p-1 hover:bg-gray-700/60 rounded cursor-pointer" title="মিনিমাইজ">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button className="text-gray-400 hover:text-white p-1 hover:bg-gray-700/60 rounded cursor-pointer" title="ম্যাক্সিমাইজ">
              <Square className="w-3 h-3" />
            </button>
            <button className="text-gray-400 hover:text-rose-400 p-1 hover:bg-rose-900/40 rounded cursor-pointer" title="বন্ধ">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chromebook Navigation & URL Bar */}
        <div className="bg-gray-850 px-3 py-2 border-b border-gray-750 flex items-center gap-2 text-xs">
          <button 
            onClick={() => window.history.back()} 
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-750 rounded-lg cursor-pointer"
            title="পেছনে যান"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => window.history.forward()} 
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-750 rounded-lg cursor-pointer"
            title="সামনে যান"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => {
              if (onRefresh) onRefresh();
              else window.location.reload();
            }} 
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-750 rounded-lg cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* URL Address Bar */}
          <div className="flex-1 bg-gray-950/80 text-emerald-300 px-3 py-1.5 rounded-full border border-gray-700 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-semibold">https://</span>
              <span className="text-white truncate">allservicebd.com/android-laptop</span>
            </div>
            <span className="bg-emerald-900/60 text-emerald-200 text-[10px] font-sans px-2 py-0.2 rounded-full font-bold shrink-0">
              SSL সুরক্ষিত
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] px-2 py-1 bg-emerald-950/80 rounded-lg border border-emerald-800">
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">অনলাইন</span>
          </div>
        </div>

        {/* Main Application Area Inside Laptop Frame */}
        <div className="bg-gray-50 overflow-x-hidden min-h-[700px]">
          {children}
        </div>

        {/* Laptop Frame Bottom Bezel with Brand Indicator */}
        <div className="bg-gray-900 text-gray-500 py-1.5 px-4 text-[10px] text-center border-t border-gray-800 flex items-center justify-between select-none font-mono">
          <span>Android Laptop Edition • Chromebook Display</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-400 font-sans">AllServiceBD 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
};
