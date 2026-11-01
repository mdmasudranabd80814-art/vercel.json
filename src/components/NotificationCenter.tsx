import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Tag, 
  Wrench, 
  Gift, 
  ShieldCheck, 
  PhoneCall, 
  Trash2, 
  Check, 
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export interface AppNotification {
  id: string;
  type: 'product' | 'offer' | 'order' | 'service' | 'referral' | 'system';
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  time: string;
  timeEn: string;
  timestamp: number;
  isRead: boolean;
  actionText?: string;
  actionTextEn?: string;
  actionType?: 'product' | 'link' | 'offers' | 'services' | 'referral' | 'orders' | 'hotline';
  actionUrl?: string;
  productId?: string;
  imageUrl?: string;
  active?: boolean;
  tag?: string;
  tagEn?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-prod-1',
    type: 'product',
    title: '⚡ নতুন পণ্য: কর্ডলেস পাওয়ার ড্রিল 12V স্টকে এসেছে!',
    titleEn: 'New Product: Cordless Power Drill 12V Now in Stock!',
    message: 'বাসা ও ওয়ার্কশপের কাজের জন্য আদর্শ কর্ডলেস ড্রিল মেশিন। আজই অর্ডার করলে পাচ্ছেন বিশেষ ২০% ছাড়!',
    messageEn: 'Heavy-duty cordless drill with rechargeable battery. Order now to get an instant 20% discount!',
    tag: 'নতুন পণ্য',
    tagEn: 'New Product',
    actionType: 'product',
    productId: 'prod-drill-1',
    actionText: 'পণ্যটি কিনুন ৳২৪৯৯',
    actionTextEn: 'Buy Product ৳2499',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    active: true,
    time: 'সবেমাত্র যুক্ত',
    timeEn: 'Just now',
    timestamp: Date.now() - 1000 * 60 * 5,
    isRead: false
  },
  {
    id: 'notif-1',
    type: 'offer',
    title: '🎉 বিশেষ অফার: ২০% ছাড় কুপন সক্রিয়!',
    titleEn: 'Special Offer: 20% Off Coupon Active!',
    message: 'কুপন কোড ALL20 ব্যবহারে যেকোনো হোম সার্ভিস ও অর্ডারে পাচ্ছেন ইনস্ট্যান্ট ২০% ডিসকাউন্ট।',
    messageEn: 'Use coupon code ALL20 to get instant 20% discount on any home service & order.',
    time: '১০ মিনিট আগে',
    timeEn: '10 min ago',
    timestamp: Date.now() - 1000 * 60 * 10,
    isRead: false,
    actionType: 'offers',
    actionText: 'অফারটি দেখুন',
    actionTextEn: 'View Offer',
    tag: '২০% ছাড়',
    tagEn: '20% OFF'
  },
  {
    id: 'notif-2',
    type: 'order',
    title: '⚡ দ্রুত সার্ভিস গ্যারান্টি',
    titleEn: 'Fast Service Guarantee',
    message: 'আপনার এলাকায় অভিজ্ঞ টেকনিশিয়ান প্রস্তুত আছেন। অর্ডার সম্পন্ন হলে ৩০ মিনিটের মধ্যে সার্ভিস টিম পৌঁছাবে।',
    messageEn: 'Skilled technicians are on standby in your area. Service provider arrives within 30 minutes of order.',
    time: '১ ঘণ্টা আগে',
    timeEn: '1 hour ago',
    timestamp: Date.now() - 1000 * 60 * 60,
    isRead: false,
    actionType: 'services',
    actionText: 'সেবা সমূহ বুক করুন',
    actionTextEn: 'Book Services',
    tag: 'সার্ভিস আপডেট',
    tagEn: 'Service Update'
  },
  {
    id: 'notif-3',
    type: 'referral',
    title: '🎁 রেফারেল বোনাস ৳১০০',
    titleEn: 'Referral Bonus ৳100',
    message: 'বন্ধুদের All Service BD রেফার করুন এবং প্রতি সফল রেফার বা বুকিংয়ে পান ৳১০০ ক্যাশব্যাক ডিসকাউন্ট ভাউচার!',
    messageEn: 'Refer friends to All Service BD and receive ৳100 cashback discount voucher for each referral!',
    time: '৩ ঘণ্টা আগে',
    timeEn: '3 hours ago',
    timestamp: Date.now() - 1000 * 60 * 180,
    isRead: false,
    actionType: 'referral',
    actionText: 'রেফার লিংক দেখুন',
    actionTextEn: 'View Refer Link',
    tag: '৳১০০ বোনাস',
    tagEn: '৳100 Bonus'
  },
  {
    id: 'notif-4',
    type: 'system',
    title: '🛡️ ১০০% ভেরিফাইড কারিগর পলিসি',
    titleEn: '100% Verified Technicians Policy',
    message: 'All Service BD-এর সকল টেকনিশিয়ান জাতীয় পরিচয়পত্র ও পুলিশ ক্লিয়ারেন্স ভেরিফাইড। নিশ্চিন্তে সেবা নিন।',
    messageEn: 'Every All Service BD technician is NID verified and police cleared. Enjoy safe, guaranteed service.',
    time: '১ দিন আগে',
    timeEn: '1 day ago',
    timestamp: Date.now() - 1000 * 60 * 1440,
    isRead: true,
    actionType: 'services',
    actionText: 'সেফটি স্ট্যান্ডার্ড',
    actionTextEn: 'Safety Standards',
    tag: 'ভেরিফাইড',
    tagEn: 'Verified'
  },
  {
    id: 'notif-5',
    type: 'system',
    title: '📞 ২৪/৭ কাস্টমার সাপোর্ট হটলাইন',
    titleEn: '24/7 Customer Support Hotline',
    message: 'জরুরি এসি, ইলেকট্রিক বা প্লাম্বিং সমস্যার জন্য হটলাইনে সরাসরি কল করতে পারেন: ০৯৬১২-০০০০০০।',
    messageEn: 'Directly call our 24/7 emergency hotline for instant assistance: 09612-000000.',
    time: '২ দিন আগে',
    timeEn: '2 days ago',
    timestamp: Date.now() - 1000 * 60 * 2880,
    isRead: true,
    actionType: 'hotline',
    actionText: 'হটলাইনে কল',
    actionTextEn: 'Call Hotline',
    tag: 'জরুরি সেবা',
    tagEn: 'Hotline'
  }
];

// Helper to play soft chime sound
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // ignore
  }
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReferral?: () => void;
  onOpenOrders?: () => void;
  onOpenOffers?: () => void;
  onOpenServices?: () => void;
  onOpenProduct?: (productId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenReferral,
  onOpenOrders,
  onOpenOffers,
  onOpenServices,
  onOpenProduct,
}) => {
  const { t, language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('asb_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'product' | 'offer' | 'order' | 'system'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('asb_notif_sound') !== 'disabled';
  });

  // Listen to Firestore updates in real-time
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        if (!snapshot.empty) {
          const list: AppNotification[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.active !== false) {
              list.push(data as AppNotification);
            }
          });

          if (list.length > 0) {
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            // Sync with local read states
            try {
              const saved = localStorage.getItem('asb_notifications_v1');
              if (saved) {
                const parsed = JSON.parse(saved);
                const readSet = new Set(parsed.filter((p: any) => p.isRead).map((p: any) => p.id));
                list.forEach(item => {
                  if (readSet.has(item.id)) {
                    item.isRead = true;
                  }
                });
              }
            } catch {
              // ignore
            }

            setNotifications(list);
            try {
              localStorage.setItem('asb_notifications_v1', JSON.stringify(list));
            } catch {
              // ignore
            }
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'notifications');
      });
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem('asb_notifications_v1', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Click outside to close & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => item.id === id ? { ...item, isRead: true } : item)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    if (soundEnabled) playNotificationChime();
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleResetDefaults = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
    if (soundEnabled) playNotificationChime();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('asb_notif_sound', next ? 'enabled' : 'disabled');
    if (next) playNotificationChime();
  };

  const handleNotificationAction = (item: AppNotification) => {
    handleMarkAsRead(item.id);
    onClose();

    if (item.actionType === 'product' || item.productId) {
      if (item.productId && onOpenProduct) {
        onOpenProduct(item.productId);
      } else {
        const el = document.getElementById('products-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.actionType === 'link' && item.actionUrl) {
      if (item.actionUrl.startsWith('http')) {
        window.open(item.actionUrl, '_blank');
      } else {
        window.location.href = item.actionUrl;
      }
    } else if (item.actionType === 'referral') {
      onOpenReferral?.();
    } else if (item.actionType === 'offers') {
      onOpenOffers?.();
    } else if (item.actionType === 'orders') {
      onOpenOrders?.();
    } else if (item.actionType === 'services') {
      onOpenServices?.();
      const el = document.getElementById('services-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (item.actionType === 'hotline') {
      window.location.href = 'tel:09612000000';
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'product') return item.type === 'product' || Boolean(item.productId);
    if (activeFilter === 'order') return item.type === 'order' || item.type === 'service';
    return item.type === activeFilter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'offer':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'order':
      case 'service':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'referral':
        return <Gift className="w-4 h-4 text-pink-600" />;
      case 'system':
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'offer':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'order':
      case 'service':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'referral':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'system':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <>
      {/* Backdrop overlay for focus & easy closing */}
      <div 
        className="fixed inset-0 bg-black/30 z-50 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Dropdown / Modal */}
      <div
        ref={dropdownRef}
        role="dialog"
        aria-label={t('বিজ্ঞপ্তি ও নোটিফিকেশন', 'Notifications')}
        className="fixed top-16 sm:top-20 right-2 sm:right-6 md:right-16 w-[calc(100vw-16px)] sm:w-[440px] max-w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 font-sans"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Bell className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {t('বিজ্ঞপ্তি ও আপডেট', 'Notifications & Updates')}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white shadow-xs animate-pulse">
                    {unreadCount} {t('নতুন', 'New')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200">
                {t('পণ্য অফার, ডিসকাউন্ট ও জরুরি নোটিফিকেশন', 'Product offers, deals & instant alerts')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={soundEnabled ? t('সাউন্ড বন্ধ করুন', 'Mute Sound') : t('সাউন্ড চালু করুন', 'Enable Sound')}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-emerald-300/60" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={t('বন্ধ করুন', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Quick Actions */}
        <div className="px-3 pt-2.5 pb-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                activeFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {t('সকল', 'All')} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('product')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                activeFilter === 'product'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {t('পণ্য', 'Products')}
            </button>
            <button
              onClick={() => setActiveFilter('offer')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                activeFilter === 'offer'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {t('অফার', 'Offers')}
            </button>
            <button
              onClick={() => setActiveFilter('order')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                activeFilter === 'order'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {t('সার্ভিস', 'Services')}
            </button>
            <button
              onClick={() => setActiveFilter('system')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                activeFilter === 'system'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {t('সিস্টেম', 'System')}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 hover:underline cursor-pointer shrink-0 ml-1"
              title={t('সবগুলো পঠিত হিসেবে চিহ্নিত করুন', 'Mark all as read')}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">{t('পঠিত মার্ক', 'Mark Read')}</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 max-h-[50vh] sm:max-h-[55vh]">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center text-gray-500">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">
                {t('কোনো নতুন বিজ্ঞপ্তি নেই', 'No Notifications Found')}
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mb-4">
                {t(
                  'আপনার জন্য নতুন কোনো পণ্য লিংক বা নোটিফিকেশন আসলে তা এখানে সাথে সাথে দেখতে পাবেন।',
                  'When you receive new product links or booking updates, they will appear here.'
                )}
              </p>
              {notifications.length === 0 && (
                <button
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('নমুনা বিজ্ঞপ্তি দেখান', 'Load Sample Notifications')}</span>
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item, index) => {
              const titleText = language === 'en' ? item.titleEn : item.title;
              const msgText = language === 'en' ? item.messageEn : item.message;
              const timeText = language === 'en' ? item.timeEn : item.time;
              const actionLabel = language === 'en' ? (item.actionTextEn || 'View') : (item.actionText || 'দেখুন');
              const tagLabel = language === 'en' ? (item.tagEn || item.tag) : (item.tag || item.tagEn);

              return (
                <div
                  key={`${item.id || 'notif'}-${index}`}
                  onClick={() => handleNotificationAction(item)}
                  className={`p-3 sm:p-3.5 transition-colors relative flex items-start gap-3 cursor-pointer group ${
                    !item.isRead
                      ? 'bg-emerald-50/60 hover:bg-emerald-100/60'
                      : 'hover:bg-gray-50 bg-white'
                  }`}
                >
                  {/* Unread indicator bar */}
                  {!item.isRead && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                  )}

                  {/* Thumbnail Image or Icon */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={titleText}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${getBadgeStyle(
                        item.type
                      )}`}
                    >
                      {getNotificationIcon(item.type)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-800 transition-colors">
                          {titleText}
                        </span>
                        {tagLabel && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold border ${getBadgeStyle(
                              item.type
                            )}`}
                          >
                            {tagLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {timeText}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {msgText}
                    </p>

                    {/* Action & Dismiss Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100/80">
                      {item.actionType ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(item);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 transition-all cursor-pointer shadow-2xs"
                        >
                          {item.type === 'product' && <ShoppingBag className="w-3 h-3 text-amber-600" />}
                          <span>{actionLabel}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1">
                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(item.id);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-emerald-700 hover:bg-emerald-100/50 transition-colors cursor-pointer"
                            title={t('পঠিত হিসেবে চিহ্নিত করুন', 'Mark as read')}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(item.id, e)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('অল সার্ভিস বিডি নোটিফিকেশন হাব', 'All Service BD Notification Hub')}</span>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-gray-500 hover:text-red-600 hover:underline cursor-pointer"
              >
                {t('সব মুছুন', 'Clear all')}
              </button>
            )}
            <button
              onClick={handleResetDefaults}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer ml-1"
            >
              {t('রিসেট', 'Reset')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
