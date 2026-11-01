import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Phone, 
  Calendar, 
  MapPin, 
  Wrench, 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  Star, 
  HelpCircle, 
  ExternalLink,
  ChevronDown,
  X,
  Truck,
  Check,
  Tag,
  CreditCard,
  Navigation,
  Radio,
  Compass,
  ShoppingCart
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { OrderProgress } from './OrderProgress';
import { ProviderArrivalTracker, ArrivalStage } from './ProviderArrivalTracker';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { POPULAR_PRODUCTS, POPULAR_SERVICES, ProductItem } from '../data/marketplaceData';

export interface UnifiedOrder {
  id: string;
  userId?: string | null;
  type: 'service' | 'hardware';
  title: string;
  category?: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot?: string;
  address: string;
  totalAmount: number;
  status: 'received' | 'pending' | 'confirmed' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  items?: Array<{
    title: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  technician?: {
    name: string;
    phone: string;
    rating: number;
    title: string;
  };
  createdAtFormatted: string;
  createdAtRaw?: any;
}

// Default blacklist of test/demo order IDs
const DEMO_BLACKLIST = ['ASBD-849201', 'ORD-BD-392104', 'ASBD-710382', 'ORD-BD-281903', 'ORD-BD-148415'];

interface OrderHistoryViewProps {
  onReturnHome?: () => void;
  onOpenBookingModal?: (serviceId?: string) => void;
  onOpenCart?: () => void;
  onAddToCart?: (product: ProductItem, quantity?: number) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  onReturnHome,
  onOpenBookingModal,
  onOpenCart,
  onAddToCart,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // State Filter Controls
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [selectedTypeTab, setSelectedTypeTab] = useState<'all' | 'service' | 'hardware'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<UnifiedOrder | null>(null);
  const [activeMapOrder, setActiveMapOrder] = useState<UnifiedOrder | null>(null);

  // Helper to get placed order IDs by this user/device
  const getMyPlacedOrderIds = (): string[] => {
    try {
      const raw = localStorage.getItem('user_my_order_ids');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => !DEMO_BLACKLIST.includes(id));
        }
      }
    } catch {
      // fallback
    }
    return [];
  };

  // Orders State - defaults strictly to empty for new users
  const [orders, setOrders] = useState<UnifiedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('user_unified_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const myIds = getMyPlacedOrderIds();
          const filtered = parsed.filter((o: any) => 
            !DEMO_BLACKLIST.includes(o.id) && (myIds.includes(o.id) || (user?.uid && o.userId === user.uid))
          );
          return filtered;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage whenever orders state updates
  useEffect(() => {
    try {
      const cleanOrders = orders.filter((o) => !DEMO_BLACKLIST.includes(o.id));
      localStorage.setItem('user_unified_orders', JSON.stringify(cleanOrders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Clean up legacy demo orders from localStorage on mount
  useEffect(() => {
    try {
      const orderKey = 'user_unified_orders';
      const savedOrders = localStorage.getItem(orderKey);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          const myIds = getMyPlacedOrderIds();
          const filtered = parsed.filter((o: any) => 
            !DEMO_BLACKLIST.includes(o.id) && (myIds.includes(o.id) || (user?.uid && o.userId === user.uid))
          );
          if (filtered.length !== parsed.length) {
            localStorage.setItem(orderKey, JSON.stringify(filtered));
            setOrders(filtered);
          }
        }
      }

      const idKey = 'user_my_order_ids';
      const savedIds = localStorage.getItem(idKey);
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((id: string) => !DEMO_BLACKLIST.includes(id));
          if (filtered.length !== parsed.length) {
            localStorage.setItem(idKey, JSON.stringify(filtered));
          }
        }
      }
    } catch (e) {
      console.warn('Order cleanup error:', e);
    }
  }, [user?.uid]);

  // Real-time Firestore Listeners - strictly scoped to THIS user's bookings and orders
  useEffect(() => {
    const myPlacedIds = getMyPlacedOrderIds();
    const currentUserId = user?.uid;

    // For brand new users with no placed orders: keep orders strictly empty (no demo/mock data)
    if (!currentUserId && myPlacedIds.length === 0) {
      setIsLoading(false);
      setOrders([]);
      return;
    }

    setIsLoading(true);

    // 1. Listen to service bookings matching user's account or placed order IDs
    const bookingsUnsub = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const myBookings: UnifiedOrder[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const orderId = data.bookingId || docSnap.id;
        const orderUserId = data.userId;
        const isMine = (currentUserId && orderUserId === currentUserId) || myPlacedIds.includes(orderId);

        if (isMine && !DEMO_BLACKLIST.includes(orderId)) {
          myBookings.push({
            id: orderId,
            userId: orderUserId || null,
            type: 'service',
            title: data.serviceTitle || 'সার্ভিস বুকিং',
            category: data.serviceCategory || 'হোম সার্ভিস',
            customerName: data.customerName || 'গ্রাহক',
            customerPhone: data.customerPhone || '',
            date: data.date || 'আজ',
            timeSlot: data.timeSlot || 'সকাল ১০:০০ - ১২:০০',
            address: `${data.addressDetail ? data.addressDetail + ', ' : ''}${data.area || ''}, ${data.district || ''}`,
            totalAmount: data.finalPrice || data.startingPrice || 0,
            status: (data.status as any) || 'pending',
            paymentMethod: 'ক্যাশ অন ডেলিভারি (কাজ শেষে)',
            technician: data.technician || {
              name: 'আহসান হাবিব',
              phone: '01712-998877',
              rating: 4.9,
              title: 'নির্ধারিত সার্ভিস টেকনিশিয়ান'
            },
            createdAtFormatted: data.createdAt ? 'আজ' : 'সাম্প্রতিক'
          });
        }
      });

      // 2. Listen to hardware orders matching user's account or placed order IDs
      const ordersUnsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const myHardwareOrders: UnifiedOrder[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const orderId = data.orderId || docSnap.id;
          const orderUserId = data.userId;
          const isMine = (currentUserId && orderUserId === currentUserId) || myPlacedIds.includes(orderId);

          if (isMine && !DEMO_BLACKLIST.includes(orderId)) {
            const itemsList = Array.isArray(data.items) ? data.items : [];
            const mainTitle = itemsList.length > 0
              ? itemsList.map((i: any) => i.title).join(', ')
              : 'হার্ডওয়্যার পণ্য অর্ডার';

            myHardwareOrders.push({
              id: orderId,
              userId: orderUserId || null,
              type: 'hardware',
              title: mainTitle,
              customerName: data.customerName || 'গ্রাহক',
              customerPhone: data.customerPhone || '',
              date: 'আজ',
              address: data.address || 'ঢাকা, বাংলাদেশ',
              totalAmount: data.total || 0,
              status: data.status === 'received' ? 'pending' : (data.status as any) || 'pending',
              paymentMethod: data.paymentMethod === 'bkash' ? 'বিকাশ (bKash)' : data.paymentMethod === 'nagad' ? 'নগদ (Nagad)' : 'ক্যাশ অন ডেলিভারি',
              items: itemsList,
              createdAtFormatted: 'আজ'
            });
          }
        });

        // Merge user's actual orders with local placed records without duplicates
        setOrders((prev) => {
          const firestoreIds = new Set([
            ...myBookings.map((b) => b.id),
            ...myHardwareOrders.map((o) => o.id)
          ]);

          const validLocal = prev.filter((item) => 
            !DEMO_BLACKLIST.includes(item.id) && 
            !firestoreIds.has(item.id) && 
            (myPlacedIds.includes(item.id) || (currentUserId && item.userId === currentUserId))
          );

          return [...myBookings, ...myHardwareOrders, ...validLocal];
        });

        setIsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'orders');
        setIsLoading(false);
      });

      return () => ordersUnsub();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
      setIsLoading(false);
    });

    return () => {
      bookingsUnsub();
    };
  }, [user?.uid]);

  // Filtered list derived from tabs & search
  // Filtered and Sorted list
  const filteredOrders = orders
    .filter((order) => {
      // Status Filter
      if (selectedStatusTab !== 'all' && order.status !== selectedStatusTab) {
        return false;
      }
      // Type Filter
      if (selectedTypeTab !== 'all' && order.type !== selectedTypeTab) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchTitle = order.title.toLowerCase().includes(q);
        const matchPhone = order.customerPhone.includes(q);
        const matchName = order.customerName.toLowerCase().includes(q);
        return matchId || matchTitle || matchPhone || matchName;
      }
      return true;
    })
    .sort((a, b) => {
      // Helper to handle Bangla digits for sorting if needed, but string compare usually works if format is same
      // However, 'আজ' should be treated as the newest
      const dateA = a.date === 'আজ' ? '9999-99-99' : a.date;
      const dateB = b.date === 'আজ' ? '9999-99-99' : b.date;
      
      if (sortBy === 'recent') {
        return dateB.localeCompare(dateA);
      } else {
        return dateA.localeCompare(dateB);
      }
    });

  // Action: Cancel Order / Booking
  const handleCancelOrder = async (orderId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই অর্ডার/বুকিংটি বাতিল করতে চান?')) {
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      );

      // Attempt updating Firestore if exists
      try {
        if (orderId.startsWith('ASBD-')) {
          await updateDoc(doc(db, 'bookings', orderId), { status: 'cancelled' });
        } else if (orderId.startsWith('ORD-')) {
          await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' });
        }
      } catch {
        // local update suffices
      }

      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      }
    }
  };

  // Action: Reorder Logic
  const handleReorder = (order: UnifiedOrder) => {
    if (order.type === 'hardware') {
      if (!onAddToCart || !onOpenCart) return;
      
      let addedAny = false;
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          // Find the product in marketplace data by title
          const product = POPULAR_PRODUCTS.find(p => 
            p.title === item.title || p.englishTitle === item.title
          );
          if (product) {
            onAddToCart(product, item.quantity);
            addedAny = true;
          }
        });
      }

      if (addedAny) {
        onOpenCart();
      } else {
        alert('দুঃখিত, এই পণ্যগুলো বর্তমানে পাওয়া যাচ্ছে না।');
      }
    } else {
      // Service reorder
      if (!onOpenBookingModal) return;
      
      const service = POPULAR_SERVICES.find(s => s.title === order.title);
      if (service) {
        onOpenBookingModal(service.id);
      } else {
        // Fallback to searching by title keywords or just open modal with default
        onOpenBookingModal();
      }
    }
  };

  // Helper status badge builder
  const renderStatusBadge = (status: UnifiedOrder['status']) => {
    switch (status) {
      case 'received':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>অপেক্ষমাণ (Pending)</span>
          </span>
        );
      case 'assigned':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs">
            <User className="w-3.5 h-3.5 text-sky-700" />
            <span>নিশ্চিতকৃত (Confirmed)</span>
          </span>
        );
      case 'on_the_way':
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin" />
            <span>প্রক্রিয়াধীন (In Progress)</span>
          </span>
        );
      case 'completed':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>সম্পন্ন (Completed)</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-900 border border-red-300 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-red-700" />
            <span>বাতিল (Cancelled)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-800 border border-gray-300 shadow-2xs">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Helper progress timeline calculation
  const getTimelineStep = (status: UnifiedOrder['status']) => {
    if (status === 'cancelled') return 0;
    if (status === 'pending') return 1;
    if (status === 'in_progress') return 2;
    if (status === 'completed') return 3;
    return 1;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner & Stats Summary */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold backdrop-blur-xs border border-emerald-600/50">
              <ClipboardList className="w-4 h-4 text-emerald-300" />
              <span>অর্ডার ও বুকিং ট্র্যাকিং</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              আমার অর্ডার হিস্টোরি (Order History)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xl">
              আপনার সমস্ত সার্ভিস বুকিং ও হার্ডওয়্যার অর্ডারের লাইভ স্ট্যাটাস আপডেট, টেকনিশিয়ান ডিটেইলস এবং পেমেন্ট সামারি ট্র্যাকিং।
            </p>
          </div>

          {/* Quick Counter Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
              <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                {orders.length}
              </span>
              <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                সর্বমোট
              </span>
            </div>

            <div className="bg-amber-500/20 backdrop-blur-md p-3 rounded-2xl border border-amber-300/30 text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-200 font-mono block">
                {orders.filter((o) => o.status === 'pending' || o.status === 'in_progress').length}
              </span>
              <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider block">
                চলতি
              </span>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-md p-3 rounded-2xl border border-emerald-300/30 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-200 font-mono block">
                {orders.filter((o) => o.status === 'completed').length}
              </span>
              <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                সম্পন্ন
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
        {/* Status Filters Horizontal Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 max-w-full">
            <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-emerald-700" /> স্ট্যাটাস:
            </span>

            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatusTab === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              সব ({orders.length})
            </button>

            <button
              onClick={() => setSelectedStatusTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              অপেক্ষমাণ ({orders.filter((o) => o.status === 'pending').length})
            </button>

            <button
              onClick={() => setSelectedStatusTab('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === 'in_progress'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              প্রক্রিয়াধীন ({orders.filter((o) => o.status === 'in_progress').length})
            </button>

            <button
              onClick={() => setSelectedStatusTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              সম্পন্ন ({orders.filter((o) => o.status === 'completed').length})
            </button>

            <button
              onClick={() => setSelectedStatusTab('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === 'cancelled'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              বাতিল ({orders.filter((o) => o.status === 'cancelled').length})
            </button>
          </div>

          {/* Type Filter Toggle Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              onClick={() => setSelectedTypeTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTypeTab === 'all'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              সব প্রকার
            </button>

            <button
              onClick={() => setSelectedTypeTab('service')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedTypeTab === 'service'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              সার্ভিস বুকিং
            </button>

            <button
              onClick={() => setSelectedTypeTab('hardware')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedTypeTab === 'hardware'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              পণ্য অর্ডার
            </button>
          </div>
        </div>

        {/* Search & Sort Input Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অর্ডার আইডি (যেমন: ASBD-XXXXXX, ORD-BD-XXXXXX) বা নাম/ফোন দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 focus:border-emerald-600 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
            />
            <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shrink-0">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
              className="bg-transparent text-xs font-bold text-gray-700 outline-hidden cursor-pointer"
            >
              <option value="recent">সর্বশেষ আগে (Recent)</option>
              <option value="oldest">পুরাতন আগে (Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Orders List Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <ClipboardList className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? `"${searchQuery}" অনুসন্ধানের জন্য কোনো অর্ডার মেলেনি।`
                : 'আপনার এই ফিল্টারে বর্তমানে কোনো বুকিং বা পণ্য অর্ডার নেই।'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusTab('all');
                  setSelectedTypeTab('all');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}

            <button
              onClick={() => {
                if (onReturnHome) onReturnHome();
              }}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Wrench className="w-4 h-4" />
              <span>সেবা বা পণ্য বুক করুন</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isService = order.type === 'service';
            const stepNum = getTimelineStep(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all shadow-xs hover:shadow-md overflow-hidden"
              >
                {/* Top Card Bar */}
                <div className="p-4 sm:p-5 border-b border-gray-100 bg-emerald-50/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl text-white font-bold flex items-center justify-center ${
                        isService ? 'bg-emerald-700' : 'bg-teal-700'
                      }`}
                    >
                      {isService ? <Wrench className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-gray-900 tracking-tight">
                          #{order.id}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {isService ? 'সার্ভিস বুকিং' : 'হার্ডওয়্যার অর্ডার'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-700" />
                        <span>তারিখ: {order.date}</span>
                        {order.timeSlot && <span>• সময়: {order.timeSlot}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {renderStatusBadge(order.status)}

                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => setActiveMapOrder(order)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border border-emerald-700/50"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                        <span>লাইভ ম্যাপ</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>ডিটেইলস</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {order.status === 'completed' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border border-emerald-600"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>পুনরায় অর্ডার</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 max-w-xl">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {order.title}
                      </h3>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">
                        মোট চার্জ/মূল্য
                      </span>
                      <span className="text-lg font-black text-emerald-900 font-mono">
                        ৳ {order.totalAmount.toLocaleString('bn-BD')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        {order.paymentMethod || 'ক্যাশ অন ডেলিভারি'}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Order Progress Component */}
                  <OrderProgress
                    orderId={order.id}
                    status={order.status}
                    type={order.type}
                    variant="compact"
                    technician={order.technician}
                    showSimulateButton={false}
                  />

                  {/* Technician / Provider Info Box (If assigned) */}
                  {order.technician && (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center">
                          {order.technician.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                            <span>{order.technician.name}</span>
                            <span className="flex items-center text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                              ★ {order.technician.rating}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-800 font-medium">
                            {order.technician.title}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${order.technician.phone}`}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>কল করুন ({order.technician.phone})</span>
                      </a>
                    </div>
                  )}

                  {/* Hardware Items Summary (if hardware order) */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                      <span className="font-bold text-gray-700 block">অর্ডার আইটেমস ({order.items.length} টি):</span>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span>• {item.title} x {item.quantity}</span>
                          <span className="font-mono font-semibold">৳ {(item.price * item.quantity).toLocaleString('bn-BD')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>ভেরিফাইড বুকিং garantía</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          বাতিল করুন
                        </button>
                      )}

                      <a
                        href="tel:09612000000"
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>সহায়তা</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Detailed Order Receipt Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-emerald-200">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    অর্ডার রসিদ / ইনভয়েস ডিটেইলস
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-mono">
                    আইডি: #{selectedOrderDetails.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Full Real-time Order Progress Component */}
              <OrderProgress
                orderId={selectedOrderDetails.id}
                status={selectedOrderDetails.status}
                type={selectedOrderDetails.type}
                variant="full"
                technician={selectedOrderDetails.technician}
                address={selectedOrderDetails.address}
                customerName={selectedOrderDetails.customerName}
                customerPhone={selectedOrderDetails.customerPhone}
                showSimulateButton={false}
                onStatusChange={(newStatus) => {
                  setOrders((prev) =>
                    prev.map((o) => (o.id === selectedOrderDetails.id ? { ...o, status: newStatus } : o))
                  );
                  setSelectedOrderDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
                }}
              />

              {/* Status Header Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">
                    বর্তমান স্ট্যাটাস
                  </span>
                  <div className="mt-0.5">{renderStatusBadge(selectedOrderDetails.status)}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">
                    অর্ডার তারিখ
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {selectedOrderDetails.date}
                  </span>
                </div>
              </div>

              {/* Service/Product Summary */}
              <div className="space-y-1.5 border-b border-gray-100 pb-3">
                <h4 className="font-black text-gray-900 text-base">
                  {selectedOrderDetails.title}
                </h4>
                {selectedOrderDetails.category && (
                  <p className="text-xs text-emerald-800 font-bold">
                    ক্যাটাগরি: {selectedOrderDetails.category}
                  </p>
                )}
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>গ্রাহকের বিবরণ:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">নাম:</span>
                    <p className="font-bold text-gray-900">{selectedOrderDetails.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ফোন:</span>
                    <p className="font-mono font-bold text-gray-900">{selectedOrderDetails.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">ঠিকানা:</span>
                  <p className="font-medium text-gray-800">{selectedOrderDetails.address}</p>
                </div>
              </div>

              {/* Items Breakdown if Hardware */}
              {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-gray-800">পণ্য তালিকা:</h5>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                    {selectedOrderDetails.items.map((it, i) => (
                      <div key={i} className="p-3 bg-white flex justify-between text-xs">
                        <div>
                          <span className="font-bold text-gray-900 block">{it.title}</span>
                          <span className="text-[11px] text-gray-500 font-mono">
                            ৳ {it.price.toLocaleString('bn-BD')} x {it.quantity}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-900">
                          ৳ {(it.price * it.quantity).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Receipt Breakdown */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>পেমেন্ট মাধ্যম:</span>
                  <span className="font-bold text-gray-900">{selectedOrderDetails.paymentMethod || 'ক্যাশ অন ডেলিভারি'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি / সার্ভিস ফি:</span>
                  <span className="font-bold text-emerald-800">ফ্রি</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-sm text-gray-900">
                  <span>সর্বমোট প্রদেয় টাকা:</span>
                  <span className="text-emerald-950 text-base font-mono">
                    ৳ {selectedOrderDetails.totalAmount.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Support Call Box */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-700" />
                  <span>যেকোনো প্রশ্ন বা জরুরি সহায়তায় কল করুন</span>
                </div>
                <a
                  href="tel:09612000000"
                  className="px-2.5 py-1 bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                >
                  ০৯৬১২-০০০০০০
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              {selectedOrderDetails.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrderDetails.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 cursor-pointer"
                >
                  অর্ডার বাতিল করুন
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {selectedOrderDetails.status === 'completed' && (
                  <button
                    onClick={() => {
                      handleReorder(selectedOrderDetails);
                      setSelectedOrderDetails(null);
                    }}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>পুনরায় অর্ডার</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Dedicated Interactive Provider Live Map Tracking Modal */}
      {activeMapOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-200 flex flex-col relative">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between sticky top-0 z-30 border-b border-emerald-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-emerald-200">
                  <Navigation className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    প্রোভাইডার আগমন লাইভ ট্র্যাকিং ম্যাপ
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-mono">
                    আইডি: #{activeMapOrder.id} • {activeMapOrder.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveMapOrder(null)}
                className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Provider Arrival Tracker */}
            <div className="p-3 sm:p-5">
              <ProviderArrivalTracker
                orderId={activeMapOrder.id}
                orderTitle={activeMapOrder.title}
                customerAddress={activeMapOrder.address}
                customerName={activeMapOrder.customerName}
                customerPhone={activeMapOrder.customerPhone}
                technician={activeMapOrder.technician}
                initialStage={
                  activeMapOrder.status === 'completed'
                    ? 'completed'
                    : activeMapOrder.status === 'in_progress'
                    ? 'in_service'
                    : 'on_the_way'
                }
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setActiveMapOrder(null)}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryView;
