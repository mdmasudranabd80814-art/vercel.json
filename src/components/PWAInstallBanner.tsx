import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner recently
    const isDismissed = localStorage.getItem('pwa_banner_dismissed') === 'true';
    if (!isDismissed && !isInstalled && (isInstallable || isIOS)) {
      setIsVisible(true);
    }
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      const success = await install();
      if (success) {
        setIsVisible(false);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="bg-emerald-900 text-white py-2 px-4 shadow-md sticky top-0 z-50 animate-in slide-in-from-top duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-700 p-1.5 rounded-lg hidden sm:block">
              <Smartphone className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">অ্যাপ ইন্সটল করুন</p>
              <p className="text-[11px] text-emerald-200 hidden sm:block">দ্রুত ব্যবহারের জন্য হোম স্ক্রিনে যোগ করুন</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              ইন্সটল
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">iPhone / iPad এ ইন্সটল করুন</h3>
              <button onClick={() => setShowIOSGuide(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">১</div>
                <p>Safari ব্রাউজারের নিচের টুলবার থেকে <span className="font-bold">Share</span> বাটনটি ট্যাপ করুন।</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">২</div>
                <p>নিচে স্ক্রল করে <span className="font-bold">Add to Home Screen</span> অপশনটি বেছে নিন।</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </>
  );
};
