import React, { useState, useEffect } from 'react';
import { Laptop, Tablet, Monitor, Keyboard, Sparkles, Sliders, Maximize2, Minimize2, Battery, Wifi, Clock, Chrome, Check } from 'lucide-react';

export type LaptopViewportMode = 'laptop-15' | 'tablet-laptop' | 'desktop-ultra' | 'fluid';

interface AndroidLaptopModeBarProps {
  currentMode: LaptopViewportMode;
  onModeChange: (mode: LaptopViewportMode) => void;
  isWindowShellActive: boolean;
  onToggleWindowShell: () => void;
}

export const AndroidLaptopModeBar: React.FC<AndroidLaptopModeBarProps> = ({
  currentMode,
  onModeChange,
  isWindowShellActive,
  onToggleWindowShell,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Android Laptop Top System / Mode Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white text-xs py-2 px-4 border-b border-emerald-800/50 shadow-md select-none sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Laptop className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>অ্যান্ড্রয়েড ল্যাপটপ ভার্সন (Android Laptop Edition)</span>
            </div>

            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Chromebook & Desktop Optimized
            </span>
          </div>

          {/* Device Resolution Switchers */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onModeChange('fluid')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'fluid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="ফুল স্ক্রিন ল্যাপটপ ডিসপ্লে"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden md:inline">ফ্লুইড ল্যাপটপ</span>
            </button>

            <button
              onClick={() => onModeChange('laptop-15')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'laptop-15'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="১৫.৬ ইঞ্চি অ্যান্ড্রয়েড ল্যাপটপ (1920×1080)"
            >
              <Laptop className="w-3 h-3" />
              <span>১৫.৬" ল্যাপটপ</span>
            </button>

            <button
              onClick={() => onModeChange('tablet-laptop')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'tablet-laptop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="অ্যান্ড্রয়েড প্যাড / কিবোর্ড ট্যাবলেট (1280×800)"
            >
              <Tablet className="w-3 h-3" />
              <span className="hidden sm:inline">ট্যাব ল্যাপটপ</span>
            </button>

            <button
              onClick={() => onModeChange('desktop-ultra')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'desktop-ultra'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="আল্ট্রা-ওয়াইড ডেস্কটপ মনিটর (2560×1440)"
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden md:inline">আল্ট্রা মনিটর</span>
            </button>
          </div>

          {/* Right Action Tools & Window Frame Toggle */}
          <div className="flex items-center gap-3">
            {/* Keyboard Shortcuts Button */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/10"
              title="ল্যাপটপ কিবোর্ড শর্টকাট"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">কিবোর্ড শর্টকাট</span>
              <span className="bg-emerald-800 text-emerald-200 px-1 py-0.2 rounded text-[9px] font-mono">/</span>
            </button>

            {/* Laptop Window Shell Toggle */}
            <button
              onClick={onToggleWindowShell}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                isWindowShellActive
                  ? 'bg-amber-400 text-emerald-950 font-black'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>{isWindowShellActive ? 'উইন্ডো ফ্রেম সক্রিয়' : 'ল্যাপটপ ফ্রেম'}</span>
            </button>

            {/* Android Laptop System Tray Indicators */}
            <div className="hidden lg:flex items-center gap-2 text-emerald-300 text-[11px] pl-2 border-l border-white/15">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-white font-bold">{currentTime}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-gray-900">ল্যাপটপ কিবোর্ড শর্টকাটস</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              অ্যান্ড্রয়েড ল্যাপটপ বা ক্রোমবুকে দ্রুত কাজ করার জন্য নিচের কিবোর্ড শর্টকাটগুলো ব্যবহার করুন:
            </p>

            <div className="space-y-2.5 text-xs">
              {[
                { key: '/', desc: 'সার্চ বার দ্রুত ফোকাস করুন' },
                { key: 'Alt + H', desc: 'হোম পেজে ফিরে যান' },
                { key: 'Alt + S', desc: 'সেবা সমূহ সেকশনে স্ক্রল করুন' },
                { key: 'Alt + P', desc: 'পণ্য মার্কেটপ্লেসে স্ক্রল করুন' },
                { key: 'Alt + O', desc: 'আমার অর্ডার ভিউ' },
                { key: 'Alt + B', desc: 'শপিং ব্যাগ / কার্ট খুলুন' },
                { key: 'Esc', desc: 'যেকোনো মডাল বা পপআপ বন্ধ করুন' },
              ].map((sc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-700 font-medium">{sc.desc}</span>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 shadow-2xs rounded-lg text-emerald-800 font-mono font-bold text-[11px]">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="mt-5 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
            >
              বুঝেছি (শুরু করুন)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
