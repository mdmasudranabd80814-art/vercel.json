import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  Bell, 
  User, 
  CheckCircle2, 
  PhoneCall, 
  X,
  ShieldCheck,
  ChevronDown,
  Clock,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Gift,
  Mic,
  MicOff,
  Volume2,
  Globe,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLocation: string;
  onOpenLocationModal: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenHowItWorks: () => void;
  onOpenReferralModal?: () => void;
  onOpenSellerHub?: () => void;
  onOpenProduct?: (productId: string) => void;
}

const POPULAR_SEARCH_SUGGESTIONS = [
  'ড্রিল মেশিন',
  'এসি সার্ভিস',
  'প্লাম্বার',
  'ইলেকট্রিশিয়ান',
  'হোম ক্লিনিং',
  'হোম টিউটর'
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  onOpenLocationModal,
  cartCount,
  onOpenCart,
  onOpenLogin,
  activeNav,
  setActiveNav,
  onOpenHowItWorks,
  onOpenReferralModal,
  onOpenSellerHub,
  onOpenProduct,
}) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('asb_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n: any) => !n.isRead).length;
        }
      }
    } catch {
      // fallback
    }
    return 3;
  });

  // Keep unread notification count synchronized
  useEffect(() => {
    const syncNotifs = () => {
      try {
        const saved = localStorage.getItem('asb_notifications_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setUnreadNotifCount(parsed.filter((n: any) => !n.isRead).length);
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', syncNotifs);
    return () => window.removeEventListener('storage', syncNotifs);
  }, []);

  // Voice Search States and Refs
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Load recent searches from localStorage on init (limit to 5)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => typeof item === 'string' && item.trim().length > 0).slice(0, 5);
        }
      }
    } catch {
      // default fallback
    }
    return [];
  });

  const [homepageConfig, setHomepageConfig] = useState({
    hotline: '০৯৬১২-০০০০০০',
    hotlineHours: '২৪/৭ সাপোর্ট',
    promoCode: 'ALL20',
  });

  useEffect(() => {
    const loadConfig = () => {
      try {
        const saved = localStorage.getItem('homepage_full_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          setHomepageConfig((prev) => ({
            ...prev,
            hotline: parsed.hotline || prev.hotline,
            hotlineHours: parsed.hotlineHours || prev.hotlineHours,
            promoCode: parsed.promoCode || prev.promoCode,
          }));
        }
      } catch {
        // default fallback
      }
    };
    loadConfig();
    window.addEventListener('storage', loadConfig);
    return () => window.removeEventListener('storage', loadConfig);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Laptop Keyboard Shortcuts (/ for Search, Alt+H Home, Alt+S Services, Alt+P Products, Alt+O Orders, Alt+B Bag)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      const isEditingText = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

      if (e.key === '/' && !isEditingText) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.altKey && e.key.toLowerCase() === 'h' && !isEditingText) {
        e.preventDefault();
        setActiveNav('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.altKey && e.key.toLowerCase() === 's' && !isEditingText) {
        e.preventDefault();
        setActiveNav('services');
        document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.altKey && e.key.toLowerCase() === 'p' && !isEditingText) {
        e.preventDefault();
        setActiveNav('products');
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.altKey && e.key.toLowerCase() === 'o' && !isEditingText) {
        e.preventDefault();
        setActiveNav('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.altKey && e.key.toLowerCase() === 'b' && !isEditingText) {
        e.preventDefault();
        onOpenCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveNav, onOpenCart]);

  // Save new search query to recent searches (max 5)
  const handleSaveSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches', e);
      }
      return updated;
    });
  };

  // Form submit (e.g. Enter key press or Search click)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSaveSearch(searchQuery);
      setIsSearchFocused(false);
    }
  };

  // Clear all recent searches
  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('recent_searches');
    } catch (e) {
      console.error('Failed to clear recent searches', e);
    }
  };

  // Remove individual search item
  const handleRemoveRecentItem = (queryToRemove: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem('recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update recent searches', e);
      }
      return updated;
    });
  };

  // Handle selecting a search query
  const handleSelectQuery = (query: string) => {
    setSearchQuery(query);
    handleSaveSearch(query);
    setIsSearchFocused(false);
  };

  // Toggle Voice-to-Text Search using Web Speech API
  const handleToggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('আপনার ব্রাউজারে ভয়েস সার্চ সমর্থিত নয় (Chrome/Edge ব্যবহার করুন)');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD'; // Primary Bengali recognition for services & products

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setIsSearchFocused(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setSearchQuery(transcript);
        }

        if (event.results[0] && event.results[0].isFinal && transcript.trim()) {
          handleSaveSearch(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('মাইক্রোফোন ব্যবহারের অনুমতি দিন');
        } else if (event.error === 'no-speech') {
          setSpeechError('কোনো কথা শোনা যায়নি, আবার চেষ্টা করুন');
        } else if (event.error !== 'aborted') {
          setSpeechError('ভয়েস সনাক্ত করতে ব্যর্থ হয়েছে, আবার চেষ্টা করুন');
        }
        setIsListening(false);
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setSpeechError('ভয়েস ইনপুট শুরু করা সম্ভব হয়নি');
      setIsListening(false);
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  // Filter recent searches if user is typing
  const displayedRecentSearches = searchQuery.trim()
    ? recentSearches.filter((item) => item.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : recentSearches;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              {t('হটলাইন:', 'Hotline:')} {homepageConfig.hotline} ({homepageConfig.hotlineHours})
            </span>
            <span className="text-emerald-300">|</span>
            <span className="text-emerald-100">
              {t('সারাদেশে বিশ্বস্ত হোম সার্ভিস ও দ্রুত ডেলিভারি', 'Nationwide Trusted Home Services & Fast Delivery')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReferralModal}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Gift className="w-3 h-3" />
              <span>{t('রেফার করে ৳১০০ আয়', 'Refer & Earn ৳100')}</span>
            </button>
            <span className="bg-emerald-700/80 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide text-emerald-200">
              {t(`কুপন কোড: ${homepageConfig.promoCode} (২০% ছাড়)`, `Coupon: ${homepageConfig.promoCode} (20% Off)`)}
            </span>
            <button 
              onClick={onOpenHowItWorks} 
              className="text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              {t('কিভাবে কাজ করে?', 'How it works?')}
            </button>
            <a 
              href="/control" 
              className="bg-emerald-950/70 hover:bg-emerald-700 text-emerald-200 hover:text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-emerald-600/70"
              title="স্মার্ট এডমিন কন্ট্রোল রুম"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>{t('এডমিন কন্ট্রোল', 'Admin Control')}</span>
            </a>

            {/* Compact Language Switcher (Top Bar) */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 bg-emerald-950/60 hover:bg-emerald-700 text-emerald-100 hover:text-white px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border border-emerald-600/60 ml-1 shrink-0"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-3 h-3 text-emerald-300" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
        
        {/* Top Header Row (Logo, Location, Nav, Actions) */}
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Logo */}
          <div 
            onClick={() => {
              setActiveNav('home');
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-emerald-800 font-sans">
                  All Service BD
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600 inline" /> {t('ভেরিফাইড', 'Verified')}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 tracking-wide">
                {t('অল সার্ভিস বিডি', 'All Service BD')}
              </span>
            </div>
          </div>

          {/* Location Selector (Desktop/Tablet) */}
          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/70 text-xs font-medium transition-all shrink-0 cursor-pointer"
            title={t('অবস্থান পরিবর্তন করুন', 'Change Location')}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[130px] font-semibold">{selectedLocation}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-700">
            <button
              onClick={() => { setActiveNav('home'); setSearchQuery(''); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeNav === 'home' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('হোম', 'Home')}
            </button>
            <button
              onClick={() => { setActiveNav('categories'); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeNav === 'categories' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('ক্যাটাগরি', 'Categories')}
            </button>
            <button
              onClick={() => { setActiveNav('services'); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeNav === 'services' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('সেবা সমূহ', 'Services')}
            </button>
            <button
              onClick={() => { setActiveNav('products'); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeNav === 'products' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('পণ্য', 'Products')}
            </button>
            <button
              onClick={() => { 
                setActiveNav('testimonials');
                document.getElementById('testimonials-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeNav === 'testimonials' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('রিভিউ ও রেটিং', 'Reviews & Ratings')}
            </button>
            <button
              onClick={() => { setActiveNav('orders'); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 ${
                activeNav === 'orders' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('আমার অর্ডার', 'My Orders')}
            </button>
            <button
              onClick={() => { setActiveNav('offers'); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 ${
                activeNav === 'offers' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-0.5' : ''
              }`}
            >
              {t('অফার', 'Offers')}
              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full">{t('২০%', '20%')}</span>
            </button>
            <button
              onClick={onOpenReferralModal}
              className="hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 font-semibold text-emerald-800"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>{t('রেফার ও বোনাস', 'Refer & Bonus')}</span>
              <span className="text-[10px] bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.2 rounded-full">৳১০০</span>
            </button>
            {/* Desktop Cart Button */}
            <button
              onClick={onOpenCart}
              className="hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200/70"
              title={t('শপিং ব্যাগ ও বুকিং', 'Shopping Bag & Booking')}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>{t('ব্যাগ', 'Bag')}</span>
              {cartCount > 0 && (
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenHowItWorks}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {t('সাহায্য', 'Help')}
            </button>
          </nav>

          {/* Right Action Icons (Language Switcher, Notifications, Login) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Header Compact Language Button */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-xs font-bold border border-gray-200 transition-all cursor-pointer shrink-0"
              title={language === 'bn' ? 'English - ক্লিক করে ভাষা পরিবর্তন করুন' : 'বাংলা - Click to change language'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Notification Center Trigger Button (Replaces Cart at this position) */}
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90 transition-all cursor-pointer border border-emerald-200 shadow-2xs group"
              title={t('সকল বিজ্ঞপ্তি ও অফার দেখুন', 'View All Notifications & Offers')}
              aria-label={t('বিজ্ঞপ্তি ও অফার', 'Notifications & Offers')}
            >
              <Bell className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold text-emerald-800">
                {t('বিজ্ঞপ্তি', 'Notice')}
              </span>
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Login / Profile Button */}
            <button
              onClick={onOpenLogin}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                user
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-700'
              }`}
            >
              {user ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">
                    {user.displayName?.split(' ')[0] || t('প্রোফাইল', 'Profile')}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('লগইন', 'Login')}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Dedicated Full-Width Stretched Search Bar underneath top row */}
        <div ref={searchContainerRef} className="w-full relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={
                isListening 
                  ? t("ভয়েসে খুঁজছেন... কথা বলুন...", "Listening... Speak now...") 
                  : t("সেবা বা পণ্য খুঁজুন (যেমন: ড্রিল, ফ্যান, এসি, প্লাম্বার)... [/]", "Search services or products (e.g. Drill, Fan, AC, Plumber)... [/]")
              }
              className={`w-full pl-11 pr-28 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 hover:bg-white focus:bg-white border rounded-2xl focus:outline-hidden focus:ring-2 transition-all placeholder:text-gray-400 font-sans text-gray-800 shadow-sm ${
                isListening 
                  ? 'border-red-400 ring-2 ring-red-400/30 bg-red-50/30' 
                  : 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
            <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 pointer-events-none" />
            
            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  title={t('মুছে ফেলুন', 'Clear')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleToggleVoiceSearch}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200 shadow-md'
                    : 'text-emerald-700 hover:bg-emerald-100/70 hover:scale-105 active:scale-95'
                }`}
                title={isListening ? t('ভয়েস সার্চ থামান', 'Stop Voice Search') : t('ভয়েস দিয়ে খুঁজুন (Voice Search)', 'Voice Search')}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-white animate-bounce" />
                ) : (
                  <Mic className="w-4 h-4 text-emerald-600" />
                )}
              </button>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('খুঁজুন', 'Search')}</span>
              </button>
            </div>
          </form>

          {/* Active Voice Search Listening Banner */}
          {isListening && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 flex items-center justify-between bg-emerald-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl border border-emerald-700/50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2 font-medium truncate pr-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="truncate">
                  🎙️ <strong className="text-emerald-300">{t('ভয়েস রেকর্ডিং চালু:', 'Voice Recording Active:')}</strong> {t('মুখে বলুন... (যেমন: "এসি সার্ভিস", "ড্রিল মেশিন")', 'Speak now... (e.g. "AC Service", "Drill Machine")')}
                </span>
              </div>
              <button 
                type="button" 
                onClick={handleToggleVoiceSearch} 
                className="text-emerald-200 hover:text-white text-[11px] font-bold bg-emerald-800 hover:bg-emerald-700 px-2 py-0.5 rounded-md transition-colors shrink-0 cursor-pointer"
              >
                {t('থামান', 'Stop')}
              </button>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 flex items-center justify-between bg-amber-600 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl border border-amber-500/50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2 font-medium truncate pr-2">
                <Volume2 className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="truncate">{speechError}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSpeechError(null)} 
                className="p-1 hover:bg-amber-700 rounded-md transition-colors cursor-pointer shrink-0"
                title={t('বন্ধ করুন', 'Close')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dropdown Menu */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Recent Searches Section */}
              {recentSearches.length > 0 ? (
                <div className="mb-2">
                  <div className="px-4 py-1.5 flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 tracking-wide uppercase">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {t(`সাম্প্রতিক অনুসন্ধান (${recentSearches.length}/৫)`, `Recent Searches (${recentSearches.length}/5)`)}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllRecent}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                      title={t('সব সাম্প্রতিক অনুসন্ধান মুছে ফেলুন', 'Clear all recent searches')}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t('সব মুছে ফেলুন', 'Clear All')}</span>
                    </button>
                  </div>

                  <div className="mt-1">
                    {displayedRecentSearches.length > 0 ? (
                      displayedRecentSearches.map((queryItem, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectQuery(queryItem)}
                          className="px-4 py-2 hover:bg-emerald-50/70 text-gray-700 hover:text-emerald-900 text-sm font-medium transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0 transition-colors" />
                            <span className="truncate">{queryItem}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-emerald-600 transition-all" />
                            <button
                              type="button"
                              onClick={(e) => handleRemoveRecentItem(queryItem, e)}
                              className="p-1 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-100/70 transition-colors cursor-pointer"
                              title={t('হিস্ট্রি থেকে সরান', 'Remove from history')}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-xs text-gray-400 italic">
                        {t(`"${searchQuery}" সম্পর্কিত কোনো সাম্প্রতিক অনুসন্ধান নেই`, `No recent searches for "${searchQuery}"`)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 text-xs text-gray-400 flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {t('সাম্প্রতিক অনুসন্ধানের ইতিহাস নেই', 'No search history')}
                  </span>
                </div>
              )}

              {/* Popular Search Suggestions Section */}
              <div className="pt-2 px-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 tracking-wide uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {t('জনপ্রিয় অনুসন্ধান', 'Popular Searches')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuery(item)}
                      className="px-2.5 py-1 rounded-full text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 transition-colors font-medium cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Mobile Location bar if on mobile */}
        <div className="flex sm:hidden items-center justify-between pt-1 text-xs">
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 text-emerald-800 font-medium"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('অবস্থান:', 'Location:')} <strong className="text-gray-900">{selectedLocation}</strong></span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            {t('২৪/৭ কাস্টমার সেবা', '24/7 Customer Support')}
          </span>
        </div>
      </div>

      {/* Notification Center Popover / Modal */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => {
          setIsNotificationOpen(false);
          try {
            const saved = localStorage.getItem('asb_notifications_v1');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                setUnreadNotifCount(parsed.filter((n: any) => !n.isRead).length);
              }
            }
          } catch {
            // ignore
          }
        }}
        onOpenReferral={onOpenReferralModal}
        onOpenOrders={() => {
          setActiveNav('orders');
          setIsNotificationOpen(false);
        }}
        onOpenOffers={() => {
          setActiveNav('offers');
          setIsNotificationOpen(false);
        }}
        onOpenServices={() => {
          setActiveNav('services');
          setIsNotificationOpen(false);
          const el = document.getElementById('services-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenProduct={(prodId) => {
          setIsNotificationOpen(false);
          onOpenProduct?.(prodId);
        }}
      />
    </header>
  );
};

