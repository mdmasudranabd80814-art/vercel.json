import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Users, 
  Bell, 
  CreditCard, 
  Settings, 
  Lock, 
  LogOut, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Power, 
  PhoneCall, 
  MapPin, 
  Save, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Menu, 
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  PackageCheck,
  Zap,
  Home,
  KeyRound
} from 'lucide-react';
import { POPULAR_SERVICES, POPULAR_PRODUCTS, ServiceItem, ProductItem } from '../data/marketplaceData';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AdminNotificationManager } from './AdminNotificationManager';

interface AdminPanelProps {
  onLogout: () => void;
  onGoHome: () => void;
  adminEmail?: string;
}

export interface BookingRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  area: string;
  amount: number;
  status: 'Pending' | 'Accepted' | 'On Way' | 'Completed' | 'Cancelled';
  date: string;
  paymentMethod?: string;
}

const DEFAULT_BOOKINGS: BookingRecord[] = [
  {
    id: 'BK-1081',
    customerName: 'আব্দুল করিম',
    customerPhone: '01711223344',
    serviceTitle: 'এসি সার্ভিসিং ও মেরামত',
    area: 'মিরপুর-১০, ঢাকা',
    amount: 1499,
    status: 'Pending',
    date: 'আজ, সকাল ১০:৩০',
    paymentMethod: 'bKash'
  },
  {
    id: 'BK-1080',
    customerName: 'তানজিলা হক',
    customerPhone: '01822334455',
    serviceTitle: 'হোম ক্লিনিং সার্ভিস',
    area: 'উত্তরা সেক্টর ৭, ঢাকা',
    amount: 1999,
    status: 'Accepted',
    date: 'আজ, সকাল ৯:১৫',
    paymentMethod: 'Cash on Delivery'
  },
  {
    id: 'BK-1079',
    customerName: 'মাহমুদুল হাসান',
    customerPhone: '01933445566',
    serviceTitle: 'ইলেকট্রিশিয়ান সার্ভিস',
    area: 'ধানমন্ডি ১৫, ঢাকা',
    amount: 450,
    status: 'Completed',
    date: 'গতকাল, বিকাল ৫:০০',
    paymentMethod: 'Nagad'
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onGoHome, adminEmail }) => {
  const currentAdminEmail = adminEmail || localStorage.getItem('adminEmail') || 'admin@allservicebd.com';
  const officialTerminalUrl = 'https://all-service-bd-1.vercel.app/admin';

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('new_admin_active_tab') || 'dashboard';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Services State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_popular_services');
      return saved ? JSON.parse(saved) : POPULAR_SERVICES;
    } catch {
      return POPULAR_SERVICES;
    }
  });

  // 2. Products State
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_popular_products');
      return saved ? JSON.parse(saved) : POPULAR_PRODUCTS;
    } catch {
      return POPULAR_PRODUCTS;
    }
  });

  // 3. Bookings State
  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_bookings');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
    } catch {
      return DEFAULT_BOOKINGS;
    }
  });

  // 4. Homepage Configuration State
  const [homepageConfig, setHomepageConfig] = useState({
    heroHeadline: 'আপনার সব সেবা, এক জায়গায়',
    heroSubtitle: 'হাজারো বিশ্বস্ত সেবা এখন আপনার হাতের মুঠোয় • ১০০০+ বিশ্বস্ত সার্ভিস প্রোভাইডার • ২৪/৭ সাপোর্ট • নিরাপদ ও নির্ভরযোগ্য',
    promoCode: 'ALL20',
    heroBadge: 'প্রথম সেবায় ২০% ছাড়',
    hotline: '০৯৬১২-০০০০০০',
    whatsapp: '+8801712345678',
    officeAddress: 'লেভেল-৫, মিরপুর ডিওএইচএস, ঢাকা-১২১৬',
    footerAbout: 'বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন সার্ভিস মার্কেটপ্লেস। বাসা-বাড়ি ও অফিসের প্রয়োজনীয় ইলেকট্রিক্যাল, প্লাম্বিং, ডিপ ক্লিনিং, এসি মেরামত এবং হোম টিউটর সার্ভিস খুব সহজেই বুক করুন।'
  });

  // 5. Payment Gateways State
  const [paymentConfig, setPaymentConfig] = useState({
    bkash: { enabled: true, number: '01812-345678', type: 'Merchant' },
    nagad: { enabled: true, number: '01711-223344', type: 'Merchant' },
    rocket: { enabled: true, number: '01912-887766', type: 'Personal' },
    cod: { enabled: true }
  });

  // 6. Users State
  const [usersList, setUsersList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_users');
      return saved ? JSON.parse(saved) : [
        { id: 'USR-101', name: 'আব্দুল করিম', phone: '01711223344', email: 'karim@gmail.com', area: 'মিরপুর, ঢাকা', orders: 4, blocked: false },
        { id: 'USR-102', name: 'তানজিলা হক', phone: '01822334455', email: 'tanjila@gmail.com', area: 'উত্তরা, ঢাকা', orders: 2, blocked: false },
        { id: 'USR-103', name: 'মাহমুদুল হাসান', phone: '01933445566', email: 'hasan@gmail.com', area: 'ধানমন্ডি, ঢাকা', orders: 6, blocked: false }
      ];
    } catch {
      return [];
    }
  });

  // 7. Security / Password State
  const [currentPassword, setCurrentPassword] = useState(() => {
    return localStorage.getItem('adminCustomPassword') || 'Admin@2027';
  });
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showPass, setShowPass] = useState(false);

  // New Service / Booking Modals
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('ক্লিনিং');
  const [newServicePrice, setNewServicePrice] = useState('450');

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('new_admin_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    try {
      const savedHome = localStorage.getItem('homepage_full_config');
      if (savedHome) {
        setHomepageConfig(prev => ({ ...prev, ...JSON.parse(savedHome) }));
      }
      const savedPay = localStorage.getItem('payment_config');
      if (savedPay) {
        setPaymentConfig(prev => ({ ...prev, ...JSON.parse(savedPay) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyTerminalLink = () => {
    navigator.clipboard.writeText(officialTerminalUrl);
    setCopiedLink(true);
    showToast('টার্মিনাল লিংক ক্লিপবোর্ডে কপি হয়েছে!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Toggle Service
  const handleToggleService = (serviceId: string) => {
    const updated = services.map(s => {
      if (s.id === serviceId) {
        const next = !(s as any).disabled;
        return { ...s, disabled: next };
      }
      return s;
    });
    setServices(updated);
    localStorage.setItem('allservice_popular_services', JSON.stringify(updated));
    showToast('সার্ভিস স্ট্যাটাস সফলভাবে আপডেট হয়েছে!');
  };

  // Save Homepage Settings
  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('homepage_full_config', JSON.stringify(homepageConfig));
    try {
      await setDoc(doc(db, 'homepage_content', 'main'), {
        heroTitle: homepageConfig.heroHeadline,
        heroSubtitle: homepageConfig.heroSubtitle,
        superPackagePrice: '৳১৪৯৯',
        footerText: homepageConfig.footerAbout,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('Firebase sync warning:', err);
    }
    showToast('হোম পেজ তথ্য সফলভাবে সংরক্ষিত ও কার্যকর হয়েছে!');
  };

  // Save Payments
  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('payment_config', JSON.stringify(paymentConfig));
    showToast('পেমেন্ট গেটওয়ে তথ্য সংরক্ষিত হয়েছে!');
  };

  // Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassInput.trim().length < 4) {
      showToast('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!');
      return;
    }
    if (newPassInput.trim() !== confirmPassInput.trim()) {
      showToast('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }
    const finalPass = newPassInput.trim();
    localStorage.setItem('adminCustomPassword', finalPass);
    localStorage.setItem('adminPass', finalPass);
    setCurrentPassword(finalPass);
    setNewPassInput('');
    setConfirmPassInput('');
    showToast(`নতুন এডমিন পাসওয়ার্ড সফলভাবে "${finalPass}" সেট হয়েছে!`);
  };

  // Booking status updater
  const handleUpdateBookingStatus = (id: string, status: BookingRecord['status']) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    localStorage.setItem('allservice_bookings', JSON.stringify(updated));
    showToast(`বুকিং #${id} স্ট্যাটাস ${status} করা হয়েছে!`);
  };

  // Delete booking
  const handleDeleteBooking = (id: string) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem('allservice_bookings', JSON.stringify(updated));
    showToast(`বুকিং মুছে ফেলা হয়েছে!`);
  };

  // User blocker
  const handleToggleUserBlock = (userId: string) => {
    const updated = usersList.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u);
    setUsersList(updated);
    localStorage.setItem('allservice_users', JSON.stringify(updated));
    showToast('ইউজার স্ট্যাটাস পরিবর্তন হয়েছে!');
  };

  // Add new service
  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const newSrv: ServiceItem = {
      id: `srv-custom-${Date.now()}`,
      title: newServiceName.trim(),
      category: newServiceCategory,
      categoryId: 'cleaning',
      badge: 'নতুন',
      rating: 5.0,
      reviewCount: 1,
      description: 'অল সার্ভিস বিডি ভেরিফাইড এক্সপার্ট সার্ভিস',
      startingPrice: parseFloat(newServicePrice) || 500,
      priceUnit: 'বুক করুন',
      duration: '১-২ ঘণ্টা',
      features: ['অভিজ্ঞ টেকনিশিয়ান', 'উন্নত যন্ত্রপাতি', 'দ্রুত সেবা'],
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80'
    };
    const updated = [newSrv, ...services];
    setServices(updated);
    localStorage.setItem('allservice_popular_services', JSON.stringify(updated));
    setIsAddServiceModalOpen(false);
    setNewServiceName('');
    showToast(`নতুন সেবা "${newSrv.title}" যোগ করা হয়েছে!`);
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'বুকিং ও অর্ডার', labelEn: 'Bookings', icon: ShoppingBag, badge: `${bookings.filter(b => b.status === 'Pending').length}` },
    { id: 'services', label: 'সেবা সমূহ (অন/অফ)', labelEn: 'Services', icon: Layers, badge: `${services.length}` },
    { id: 'products', label: 'পণ্য সামগ্রী', labelEn: 'Products', icon: PackageCheck, badge: `${products.length}` },
    { id: 'homepage', label: 'হোম পেজ কন্ট্রোল', labelEn: 'Homepage', icon: Home },
    { id: 'payments', label: 'পেমেন্ট মেথড', labelEn: 'Payments', icon: CreditCard },
    { id: 'users', label: 'গ্রাহক / ইউজার', labelEn: 'Users', icon: Users, badge: `${usersList.length}` },
    { id: 'notifications', label: 'নোটিফিকেশন সেন্টার', labelEn: 'Notifications', icon: Bell },
    { id: 'security', label: 'পাসওয়ার্ড ও নিরাপত্তা', labelEn: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-emerald-800 rounded-lg hover:bg-gray-100 cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight leading-none">
                All Service BD
              </h1>
              <p className="text-[11px] font-bold text-emerald-700 tracking-wide mt-0.5">
                নতুন সুপার এডমিন প্যানেল
              </p>
            </div>
          </div>
        </div>

        {/* Right Topbar Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* View Website Button */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
            title="গ্রাহক ওয়েবসাইট দেখুন"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ওয়েবসাইট দেখুন</span>
          </button>

          {/* Admin Email Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-mono">{currentAdminEmail}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
            title="এডমিন লগআউট"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed lg:static top-0 left-0 bottom-0 z-50
          w-64 bg-emerald-950 text-white shrink-0 flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl lg:shadow-none
        `}>
          <div>
            <div className="p-4 border-b border-emerald-900/60 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                এডমিন মেনুবার
              </span>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
              {navMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-left
                      ${isActive 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-white text-emerald-950' : 'bg-emerald-900 text-emerald-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar User Info */}
          <div className="p-4 border-t border-emerald-900/80 bg-black/20 text-xs">
            <p className="font-bold text-white truncate">Super Admin</p>
            <p className="text-[11px] font-mono text-emerald-300 truncate">{currentAdminEmail}</p>
            <button
              onClick={handleCopyTerminalLink}
              className="mt-2 text-[10px] text-emerald-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>টার্মিনাল লিংক কপি করুন</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">

          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Banner Alert */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-200 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>নতুন সিস্টেম সক্রিয়</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">স্বাগতম, সুপার এডমিন!</h2>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                    All Service BD মার্কেটপ্লেসের সকল সার্ভিস, বুকিং ও সেটিংস এখন সহজে পরিচালনা করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="px-4 py-2 bg-white text-emerald-950 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
                  >
                    বুকিং দেখুন ({bookings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="px-4 py-2 bg-emerald-700/80 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors border border-white/20 cursor-pointer"
                  >
                    পাসওয়ার্ড সেট
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500">মোট বুকিং</span>
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{bookings.length} টি</h3>
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">
                    পেন্ডিং: {bookings.filter(b => b.status === 'Pending').length} টি
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500">মোট সার্ভিস</span>
                    <Layers className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{services.length} টি</h3>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">মার্কেটপ্লেসে লাইভ আছে</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500">মোট পণ্য</span>
                    <PackageCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{products.length} টি</h3>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">স্টক এভেইলেবল</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500">নিবন্ধিত গ্রাহক</span>
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{usersList.length} জন</h3>
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">সক্রিয় অ্যাকাউন্ট</p>
                </div>
              </div>

              {/* Recent Bookings Table Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>সাম্প্রতিক বুকিং তালিকা</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    সকল বুকিং দেখুন →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5">অর্ডার আইডি</th>
                        <th className="px-4 py-2.5">গ্রাহক</th>
                        <th className="px-4 py-2.5">সার্ভিস</th>
                        <th className="px-4 py-2.5">মূল্য</th>
                        <th className="px-4 py-2.5">স্ট্যাটাস</th>
                        <th className="px-4 py-2.5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3 font-mono font-bold text-emerald-800">{b.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900">{b.customerName}</p>
                            <p className="text-[11px] text-gray-500">{b.customerPhone}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">{b.serviceTitle}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">৳ {b.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              b.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                              b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {b.status === 'Pending' ? 'পেন্ডিং' :
                               b.status === 'Accepted' ? 'গৃহীত' :
                               b.status === 'Completed' ? 'সম্পন্ন' : b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as any)}
                              className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white"
                            >
                              <option value="Pending">পেন্ডিং</option>
                              <option value="Accepted">এক্সেপ্টেড</option>
                              <option value="On Way">অন দ্য ওয়ে</option>
                              <option value="Completed">সম্পন্ন</option>
                              <option value="Cancelled">বাতিল</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: BOOKINGS & ORDERS */}
          {/* ============================================================== */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">বুকিং ও অর্ডার ব্যবস্থাপনা</h3>
                  <p className="text-xs text-gray-500">গ্রাহকদের সার্ভিস বুকিং ও পণ্যের অর্ডারের স্ট্যাটাস নিয়ন্ত্রণ করুন</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl self-start">
                  মোট বুকিং: {bookings.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-emerald-50 text-emerald-950 text-xs uppercase font-bold border-b border-emerald-100">
                    <tr>
                      <th className="px-4 py-3">বুকিং আইডি</th>
                      <th className="px-4 py-3">গ্রাহকের নাম ও ফোন</th>
                      <th className="px-4 py-3">সার্ভিসের নাম</th>
                      <th className="px-4 py-3">ঠিকানা</th>
                      <th className="px-4 py-3">মূল্য</th>
                      <th className="px-4 py-3">স্ট্যাটাস পরিবর্তন</th>
                      <th className="px-4 py-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">{b.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-gray-900">{b.customerName}</p>
                          <p className="text-[11px] text-gray-500">{b.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-800">{b.serviceTitle}</td>
                        <td className="px-4 py-3.5 text-gray-600 text-xs">{b.area}</td>
                        <td className="px-4 py-3.5 font-black text-emerald-700">৳ {b.amount}</td>
                        <td className="px-4 py-3.5">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as any)}
                            className="px-2.5 py-1.5 text-xs font-bold border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Pending">পেন্ডিং (Pending)</option>
                            <option value="Accepted">গৃহীত (Accepted)</option>
                            <option value="On Way">অন দ্য ওয়ে (On Way)</option>
                            <option value="Completed">সম্পন্ন (Completed)</option>
                            <option value="Cancelled">বাতিল (Cancelled)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SERVICES MANAGEMENT (ON/OFF TOGGLE) */}
          {/* ============================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">সেবা নিয়ন্ত্রণ (Services ON/OFF)</h3>
                  <p className="text-xs text-gray-500">প্রতিটি সেবা চালু বা বন্ধ করুন। বন্ধ করলে হোমপেজে লাল রঙের "সাময়িক বন্ধ" দেখাবে।</p>
                </div>
                <button
                  onClick={() => setIsAddServiceModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সেবা যোগ করুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((srv) => {
                  const isDisabled = !!(srv as any).disabled;
                  return (
                    <div 
                      key={srv.id} 
                      className={`p-4 bg-white rounded-2xl border shadow-xs transition-all flex flex-col justify-between ${
                        isDisabled ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {srv.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDisabled ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {isDisabled ? 'বন্ধ (OFF)' : 'সক্রিয় (ON)'}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">{srv.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{srv.description}</p>
                        <p className="text-sm font-black text-emerald-700 mt-2">৳ {srv.startingPrice}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-medium">হোমপেজ প্রদর্শন:</span>
                        <button
                          type="button"
                          onClick={() => handleToggleService(srv.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isDisabled 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{isDisabled ? 'চালু করুন (Turn ON)' : 'বন্ধ করুন (Turn OFF)'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: PRODUCTS MANAGEMENT */}
          {/* ============================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">মার্কেটপ্লেস পণ্য তালিকা</h3>
                  <p className="text-xs text-gray-500">হোমপেজের পণ্যসমূহ এবং স্টক নিয়ন্ত্রণ করুন</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl">
                  মোট পণ্য: {products.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-4 flex flex-col justify-between">
                    <div>
                      <div className="h-36 bg-gray-50 rounded-xl mb-3 flex items-center justify-center p-2">
                        <img src={p.image} alt={p.title} className="h-full w-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1.5 line-clamp-1">{p.title}</h4>
                      <p className="text-emerald-700 font-black text-base mt-1">৳ {p.price}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-600 font-bold">স্টকে আছে</span>
                      <span className="text-[10px] text-gray-400 font-mono">আইডি: {p.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: HOMEPAGE BANNER & TEXT CONTROL */}
          {/* ============================================================== */}
          {activeTab === 'homepage' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs max-w-3xl space-y-5">
              <div>
                <h3 className="font-black text-gray-900 text-lg">হোম পেজ ব্যানার ও তথ্য পরিবর্তন</h3>
                <p className="text-xs text-gray-500">হেডলাইন, সাবটাইটেল, কুপন কোড ও যোগাযোগের তথ্য আপডেট করুন।</p>
              </div>

              <form onSubmit={handleSaveHomepage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase">ব্যানার মেইন হেডলাইন</label>
                  <input
                    type="text"
                    value={homepageConfig.heroHeadline}
                    onChange={(e) => setHomepageConfig({ ...homepageConfig, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase">ব্যানার সাবটাইটেল</label>
                  <textarea
                    rows={2}
                    value={homepageConfig.heroSubtitle}
                    onChange={(e) => setHomepageConfig({ ...homepageConfig, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 uppercase">প্রোমো কুপন কোড (Promo Code)</label>
                    <input
                      type="text"
                      value={homepageConfig.promoCode}
                      onChange={(e) => setHomepageConfig({ ...homepageConfig, promoCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 uppercase">ডিসকাউন্ট ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      value={homepageConfig.heroBadge}
                      onChange={(e) => setHomepageConfig({ ...homepageConfig, heroBadge: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 uppercase">হটলাইন নম্বর</label>
                    <input
                      type="text"
                      value={homepageConfig.hotline}
                      onChange={(e) => setHomepageConfig({ ...homepageConfig, hotline: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 uppercase">হোয়াটসঅ্যাপ নম্বর</label>
                    <input
                      type="text"
                      value={homepageConfig.whatsapp}
                      onChange={(e) => setHomepageConfig({ ...homepageConfig, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 uppercase">ফুটার বর্ণনা (About Us Text)</label>
                  <textarea
                    rows={3}
                    value={homepageConfig.footerAbout}
                    onChange={(e) => setHomepageConfig({ ...homepageConfig, footerAbout: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>হোম পেজ তথ্য সেভ করুন</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: PAYMENT GATEWAYS */}
          {/* ============================================================== */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs max-w-2xl space-y-5">
              <div>
                <h3 className="font-black text-gray-900 text-lg">পেমেন্ট গেটওয়ে কন্ট্রোল</h3>
                <p className="text-xs text-gray-500">বিকাশ, নগদ ও রকেট ওয়ালেট নম্বর এবং ক্যাশ অন ডেলিভারি অন/অফ করুন</p>
              </div>

              <form onSubmit={handleSavePayments} className="space-y-4 text-xs">
                {/* bKash */}
                <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-pink-900 text-sm">বিকাশ (bKash)</h4>
                    <p className="text-[11px] text-gray-500">মার্চেন্ট / পার্সোনাল নম্বর</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={paymentConfig.bkash.number}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        bkash: { ...paymentConfig.bkash, number: e.target.value }
                      })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white font-mono font-bold text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPaymentConfig({
                        ...paymentConfig,
                        bkash: { ...paymentConfig.bkash, enabled: !paymentConfig.bkash.enabled }
                      })}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        paymentConfig.bkash.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {paymentConfig.bkash.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Nagad */}
                <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-orange-900 text-sm">নগদ (Nagad)</h4>
                    <p className="text-[11px] text-gray-500">মার্চেন্ট / পার্সোনাল নম্বর</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={paymentConfig.nagad.number}
                      onChange={(e) => setPaymentConfig({
                        ...paymentConfig,
                        nagad: { ...paymentConfig.nagad, number: e.target.value }
                      })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white font-mono font-bold text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPaymentConfig({
                        ...paymentConfig,
                        nagad: { ...paymentConfig.nagad, enabled: !paymentConfig.nagad.enabled }
                      })}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        paymentConfig.nagad.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {paymentConfig.nagad.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* COD */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">ক্যাশ অন ডেলিভারি (Cash on Delivery)</h4>
                    <p className="text-[11px] text-gray-500">সার্ভিস সম্পন্ন হওয়ার পর নগদ পরিশোধ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentConfig({
                      ...paymentConfig,
                      cod: { enabled: !paymentConfig.cod.enabled }
                    })}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-xs ${
                      paymentConfig.cod.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {paymentConfig.cod.enabled ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>পেমেন্ট সেটিংস সেভ করুন</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: USERS & CUSTOMERS */}
          {/* ============================================================== */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">গ্রাহক ও ইউজার নিয়ন্ত্রণ</h3>
                  <p className="text-xs text-gray-500">নিবন্ধিত কাস্টমারদের লিস্ট এবং অর্ডার অ্যাক্সেস কন্ট্রোল</p>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl">
                  মোট ইউজার: {usersList.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">ইউজার আইডি</th>
                      <th className="px-4 py-3">নাম</th>
                      <th className="px-4 py-3">ফোন নম্বর</th>
                      <th className="px-4 py-3">এলাকা</th>
                      <th className="px-4 py-3">অর্ডার সংখ্যা</th>
                      <th className="px-4 py-3">স্ট্যাটাস</th>
                      <th className="px-4 py-3 text-right">ব্লক / আনব্লক</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-800">{u.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{u.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{u.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{u.area}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{u.orders} টি</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.blocked ? 'ব্লকড (Blocked)' : 'সক্রিয় (Active)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleUserBlock(u.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              u.blocked 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {u.blocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: NOTIFICATION CENTER */}
          {/* ============================================================== */}
          {activeTab === 'notifications' && (
            <AdminNotificationManager />
          )}

          {/* ============================================================== */}
          {/* TAB 9: SECURITY & PASSWORD SETTINGS */}
          {/* ============================================================== */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs max-w-2xl space-y-6">
              <div>
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-700" />
                  <span>এডমিন পাসওয়ার্ড পরিবর্তন ও টার্মিনাল লিংক</span>
                </h3>
                <p className="text-xs text-gray-500">আপনার এডমিন পাসওয়ার্ড পরিবর্তন করুন এবং অফিসিয়াল লিংকটি সুরক্ষিত রাখুন</p>
              </div>

              {/* Official Terminal Link Card */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                  একক অফিসিয়াল টার্মিনাল লিংক
                </span>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono font-bold text-xs sm:text-sm text-emerald-950 truncate">
                    {officialTerminalUrl}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyTerminalLink}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Current Password Info */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-700">বর্তমান এডমিন পাসওয়ার্ড:</p>
                  <p className="text-xs text-gray-400">লগইন করার জন্য ব্যবহৃত হয়</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-800 text-sm bg-white px-3 py-1 rounded-xl border border-gray-200">
                    {showPass ? currentPassword : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2 border-t border-gray-100">
                <h4 className="font-bold text-sm text-gray-900">নতুন পাসওয়ার্ড সেট করুন</h4>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">নতুন পাসওয়ার্ড</label>
                  <input
                    type="text"
                    required
                    minLength={4}
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="যেমন: Admin@2027"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">কনফার্ম নতুন পাসওয়ার্ড</label>
                  <input
                    type="text"
                    required
                    minLength={4}
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="আবার নতুন পাসওয়ার্ড লিখুন"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>নতুন পাসওয়ার্ড সংরক্ষণ করুন</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD NEW SERVICE */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-gray-900 text-base">নতুন সেবা যোগ করুন</h4>
              <button 
                onClick={() => setIsAddServiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewService} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase">সেবার নাম (Title)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: এসি ডিপ জেট ওয়াশ"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase">ক্যাটাগরি</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
                >
                  <option value="ক্লিনিং">ক্লিনিং (Cleaning)</option>
                  <option value="এসি ও মেরামত">এসি ও মেরামত (AC Repair)</option>
                  <option value="ইলেকট্রিশিয়ান">ইলেকট্রিশিয়ান (Electrician)</option>
                  <option value="প্লাম্বার">প্লাম্বার (Plumber)</option>
                  <option value="হোম সার্ভিস">হোম সার্ভিস (Home Shifting)</option>
                  <option value="টিউটর">টিউটর (Tutor)</option>
                  <option value="বিউটি ও স্পা">বিউটি ও স্পা (Beauty)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase">শুরুর মূল্য (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="450"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
