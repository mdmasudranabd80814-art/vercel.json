import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  ShoppingBag, 
  Wrench, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  ChevronRight, 
  DollarSign, 
  User, 
  Phone, 
  MapPin, 
  Sparkles, 
  Tag, 
  Check, 
  AlertCircle,
  Package,
  Layers,
  BarChart3,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { CATEGORIES, ServiceItem, ProductItem, POPULAR_SERVICES, POPULAR_PRODUCTS } from '../data/marketplaceData';

interface SellerHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded?: () => void;
  onProductAdded?: () => void;
}

export const SellerHubModal: React.FC<SellerHubModalProps> = ({
  isOpen,
  onClose,
  onServiceAdded,
  onProductAdded,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'products' | 'earnings'>('orders');
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  // Real-time Orders & Bookings from Firestore
  const [liveBookings, setLiveBookings] = useState<any[]>([]);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);

  // Forms State - Add Service
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceEnglishTitle, setServiceEnglishTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState(CATEGORIES[0]?.id || 'electrician');
  const [servicePrice, setServicePrice] = useState('');
  const [servicePriceUnit, setServicePriceUnit] = useState('বুকিং ফি');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceFeatures, setServiceFeatures] = useState('');
  const [servicePhone, setServicePhone] = useState('');
  const [serviceImage, setServiceImage] = useState('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80');

  // Forms State - Add Product
  const [productTitle, setProductTitle] = useState('');
  const [productEnglishTitle, setProductEnglishTitle] = useState('');
  const [productCategory, setProductCategory] = useState('টুলস ও হার্ডওয়্যার');
  const [productPrice, setProductPrice] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productWarranty, setProductWarranty] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productSpecs, setProductSpecs] = useState('');
  const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Real-time listener for Service Bookings
    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
        setLiveBookings(items);
      },
      (error) => {
        console.warn('Bookings listener notice:', error);
      }
    );

    // Real-time listener for Product Orders
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
        setLiveOrders(items);
      },
      (error) => {
        console.warn('Orders listener notice:', error);
      }
    );

    // Real-time listener for User Posted Services
    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
        setUserServices(items);
      },
      (error) => {
        console.warn('Services listener notice:', error);
      }
    );

    // Real-time listener for User Posted Products
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
        setUserProducts(items);
      },
      (error) => {
        console.warn('Products listener notice:', error);
      }
    );

    return () => {
      unsubBookings();
      unsubOrders();
      unsubServices();
      unsubProducts();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Order / Booking Status Change by Seller
  const handleUpdateOrderStatus = async (docId: string, collectionName: 'bookings' | 'orders', newStatus: string) => {
    try {
      const ref = doc(db, collectionName, docId);
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBySeller: user?.email || 'Seller',
      });

      // Send real-time notification to notification collection
      await addDoc(collection(db, 'notifications'), {
        orderId: docId,
        collectionName,
        status: newStatus,
        title: newStatus === 'accepted' ? 'অর্ডার গ্রহণ করা হয়েছে!' : newStatus === 'processing' ? 'মাল প্রসেসিং চলছে' : newStatus === 'dispatched' ? 'ডেলিভারির জন্য পাঠানো হয়েছে' : 'কাজ সম্পন্ন হয়েছে',
        message: `আপনার অর্ডারটি বিক্রেতা কর্তৃক '${newStatus}' স্ট্যাটাসে আপডেট করা হয়েছে।`,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg(t('স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!', 'Status updated successfully!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(t('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।', 'Failed to update order status.'));
    }
  };

  // Submit New Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle) return;
    setSubmitting(true);

    const featureList = serviceFeatures.split('\n').filter((f) => f.trim().length > 0);
    const selectedCatObj = CATEGORIES.find((c) => c.id === serviceCategory) || CATEGORIES[0];

    const newServiceData = {
      id: `srv-user-${Date.now()}`,
      title: serviceTitle,
      englishTitle: serviceEnglishTitle || serviceTitle,
      category: selectedCatObj.name,
      categoryId: selectedCatObj.id,
      startingPrice: Number(servicePrice) || 500,
      priceUnit: servicePriceUnit,
      duration: serviceDuration,
      description: serviceDesc || 'উন্নত মানের পেশাদার সার্ভিসপ্রোভাইডার দ্বারা নিখুঁত কাজ।',
      features: featureList,
      rating: 5.0,
      reviewCount: 1,
      badge: t('নতুন সার্ভিস', 'New Service'),
      image: serviceImage,
      sellerUid: user?.uid || 'guest-seller',
      sellerName: user?.displayName || user?.email || 'স্বাধীন বিক্রেতা',
      sellerPhone: servicePhone,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'services'), newServiceData);

      // Also persist to localStorage for offline
      try {
        const saved = localStorage.getItem('user_posted_services');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('user_posted_services', JSON.stringify([newServiceData, ...existing]));
      } catch {}

      setSuccessMsg(t('নতুন সার্ভিস সফলভাবে প্রকাশিত হয়েছে!', 'New service posted successfully!'));
      setShowAddServiceForm(false);
      setServiceTitle('');
      setServiceDesc('');
      if (onServiceAdded) onServiceAdded();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Service post error:', e);
      alert(t('সার্ভিস পোস্ট করতে ব্যর্থ হয়েছে।', 'Failed to post service.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit New Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle) return;
    setSubmitting(true);

    const specList = productSpecs.split('\n').filter((s) => s.trim().length > 0);

    const newProductData = {
      id: `prod-user-${Date.now()}`,
      title: productTitle,
      englishTitle: productEnglishTitle || productTitle,
      category: productCategory,
      price: Number(productPrice) || 1000,
      originalPrice: Number(productOriginalPrice) || 1200,
      discountBadge: '১০% ছাড়',
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      warranty: productWarranty,
      description: productDesc || 'উন্নত স্থায়িত্ব এবং সেরা কোয়ালিটির আসল পণ্য।',
      specs: specList,
      image: productImage,
      sellerUid: user?.uid || 'guest-seller',
      sellerName: user?.displayName || user?.email || 'স্বাধীন বিক্রেতা',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'products'), newProductData);

      // Also persist to localStorage
      try {
        const saved = localStorage.getItem('user_posted_products');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('user_posted_products', JSON.stringify([newProductData, ...existing]));
      } catch {}

      setSuccessMsg(t('নতুন পণ্য সফলভাবে বিক্রির জন্য যুক্ত হয়েছে!', 'New product listed for sale!'));
      setShowAddProductForm(false);
      setProductTitle('');
      setProductDesc('');
      if (onProductAdded) onProductAdded();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Product post error:', e);
      alert(t('প্রোডাক্ট পোস্ট করতে ব্যর্থ হয়েছে।', 'Failed to post product.'));
    } finally {
      setSubmitting(false);
    }
  };

  const pendingBookingsCount = liveBookings.filter((b) => b.status === 'pending' || b.status === 'received').length;
  const pendingOrdersCount = liveOrders.filter((o) => o.status === 'pending' || o.status === 'received').length;
  const totalPendingAlerts = pendingBookingsCount + pendingOrdersCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-emerald-100 flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 font-bold shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  {t('বিক্রেতা ও সার্ভিস প্রোভাইডার হাব', 'Seller & Provider Hub')}
                </h3>
                <span className="bg-emerald-500 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  {t('সক্রিয় বিক্রেতা', 'Active Seller')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                {t('কাজ নিন, নতুন সার্ভিস পোস্ট করুন এবং পণ্য বেচাকেনা করুন', 'Accept jobs, post new services, and trade products')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 p-2 bg-emerald-50/80 border-b border-emerald-100 overflow-x-auto shrink-0 custom-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-emerald-100/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t('আগত অর্ডার ও নোটিফিকেশন', 'Incoming Orders & Alerts')}</span>
            {totalPendingAlerts > 0 && (
              <span className="bg-red-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                {totalPendingAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-emerald-100/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t('আমার সার্ভিসসমূহ', 'My Services')} ({userServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-emerald-100/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('আমার প্রোডাক্টসমূহ (বেচাকেনা)', 'My Products')} ({userProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'earnings'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-emerald-100/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('আয় ও রিপোর্ট', 'Earnings & Sales')}</span>
          </button>
        </div>

        {/* Global Success Notification */}
        {successMsg && (
          <div className="m-3 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* TAB 1: INCOMING ORDERS & NOTIFICATIONS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">
                      {t('লাইভ কাস্টমার বুকিং ও প্রোডাক্ট অর্ডার নোটিফিকেশন', 'Live Orders & Booking Notifications')}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {t('কাস্টমার সার্ভিস অর্ডার করলে এখানে রিয়েল-টাইমে নোটিফিকেশন পাবেন। একসেপ্ট করে কাস্টমারের কাছে পৌঁছে দিন।', 'Get real-time alerts when customers place orders. Accept & dispatch items.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                    {t('পেন্ডিং নোটিফিকেশন:', 'Pending Alerts:')} <strong>{totalPendingAlerts}</strong>
                  </span>
                </div>
              </div>

              {/* Service Bookings List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-700" />
                  {t('সার্ভিস বুকিং রিকোয়েস্টসমূহ', 'Service Booking Requests')} ({liveBookings.length})
                </h4>

                {liveBookings.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
                    {t('এখনো কোনো সার্ভিস বুকিং আসেনি। নতুন সার্ভিস পোস্ট করুন!', 'No booking requests yet. Post a service to get bookings!')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {liveBookings.map((b) => (
                      <div
                        key={b.firestoreId}
                        className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs space-y-3 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              {b.bookingId || b.id || 'ASBD-SRV'}
                            </span>
                            <span className="text-xs font-extrabold text-gray-900">
                              {b.serviceTitle || t('সার্ভিস কাজ', 'Service Job')}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            b.status === 'pending' || b.status === 'received'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : b.status === 'accepted'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : b.status === 'processing'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : b.status === 'dispatched' || b.status === 'on_the_way'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {b.status === 'pending' || b.status === 'received'
                              ? t('নতুন রিকোয়েস্ট (পেন্ডিং)', 'New Request (Pending)')
                              : b.status === 'accepted'
                              ? t('একসেপ্ট করা হয়েছে', 'Accepted')
                              : b.status === 'processing'
                              ? t('কাজ প্রসেসিং হচ্ছে', 'Processing')
                              : b.status === 'dispatched' || b.status === 'on_the_way'
                              ? t('টেকনিশিয়ান রওনা দিয়েছে', 'Technician On The Way')
                              : b.status === 'completed'
                              ? t('সম্পন্ন হয়েছে', 'Completed')
                              : t('বাতিলকৃত', 'Cancelled')}
                          </span>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('গ্রাহকের নাম ও ফোন', 'Customer')}</span>
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>{b.customerName || 'Customer'}</span>
                            </div>
                            <div className="font-mono text-emerald-800 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>{b.customerPhone || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('তারিখ ও সময়', 'Schedule')}</span>
                            <div className="font-semibold text-gray-800">
                              {b.date} ({b.timeSlot || 'সকাল ১০টা'})
                            </div>
                            <div className="text-[11px] text-emerald-800 font-bold">
                              {t('ফি:', 'Fee:')} ৳ {b.finalPrice || b.startingPrice || 500}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('ঠিকানা', 'Address')}</span>
                            <div className="text-gray-700 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <span>{b.addressDetail ? `${b.addressDetail}, ` : ''}{b.area || ''}, {b.district || ''}</span>
                            </div>
                          </div>
                        </div>

                        {/* Seller Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                          {(b.status === 'pending' || b.status === 'received' || !b.status) && (
                            <button
                              onClick={() => handleUpdateOrderStatus(b.firestoreId, 'bookings', 'accepted')}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{t('একসেপ্ট করুন (Accept)', 'Accept Order')}</span>
                            </button>
                          )}

                          {b.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(b.firestoreId, 'bookings', 'processing')}
                              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Clock className="w-4 h-4" />
                              <span>{t('কাজ প্রসেস শুরু করুন', 'Start Processing')}</span>
                            </button>
                          )}

                          {b.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(b.firestoreId, 'bookings', 'on_the_way')}
                              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Truck className="w-4 h-4" />
                              <span>{t('টেকনিশিয়ান পাঠিয়ে দিন (Dispatch)', 'Dispatch Technician')}</span>
                            </button>
                          )}

                          {b.status === 'on_the_way' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(b.firestoreId, 'bookings', 'completed')}
                              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('কাজ সম্পূর্ণ মার্ক করুন (Complete)', 'Mark Completed')}</span>
                            </button>
                          )}

                          {b.status !== 'cancelled' && b.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(b.firestoreId, 'bookings', 'cancelled')}
                              className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              {t('বাতিল করুন', 'Reject/Cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hardware Product Orders List */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  {t('প্রোডাক্ট কাস্টমার অর্ডারসমূহ (বেচাকেনা)', 'Hardware Product Orders')} ({liveOrders.length})
                </h4>

                {liveOrders.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
                    {t('এখনো কোনো প্রোডাক্ট বিক্রি বা অর্ডার আসেনি। নতুন প্রোডাক্ট বিক্রির জন্য পোস্ট করুন!', 'No product orders yet. Post products to sell!')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {liveOrders.map((o) => (
                      <div
                        key={o.firestoreId}
                        className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs space-y-3 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              {o.orderId || o.id || 'ORD-BD'}
                            </span>
                            <span className="text-xs font-extrabold text-gray-900">
                              {o.items?.map((i: any) => i.title).join(', ') || t('পণ্য অর্ডার', 'Product Order')}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            o.status === 'pending' || o.status === 'received'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : o.status === 'accepted'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : o.status === 'processing'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : o.status === 'dispatched'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {o.status === 'pending' || o.status === 'received'
                              ? t('নতুন কাস্টমার অর্ডার', 'New Order (Pending)')
                              : o.status === 'accepted'
                              ? t('একসেপ্ট করা হয়েছে', 'Accepted')
                              : o.status === 'processing'
                              ? t('পণ্য প্যাকেজিং চলছে', 'Processing')
                              : o.status === 'dispatched'
                              ? t('কুরিয়ারে পাঠানো হয়েছে', 'Dispatched')
                              : o.status === 'completed'
                              ? t('ডেলিভারি সম্পন্ন', 'Delivered')
                              : t('বাতিলকৃত', 'Cancelled')}
                          </span>
                        </div>

                        {/* Order info */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-gray-500 font-medium block">{t('মোট মূল্য:', 'Total Amount:')}</span>
                            <strong className="text-emerald-800 font-bold text-sm">৳ {o.total || o.subtotal || 0}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">{t('পেমেন্ট মোড:', 'Payment Mode:')}</span>
                            <span className="font-semibold text-gray-800">{o.paymentMethod || 'ক্যাশ অন ডেলিভারি'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                          {(o.status === 'pending' || o.status === 'received' || !o.status) && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.firestoreId, 'orders', 'accepted')}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{t('একসেপ্ট করুন (Accept)', 'Accept Order')}</span>
                            </button>
                          )}

                          {o.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.firestoreId, 'orders', 'processing')}
                              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Clock className="w-4 h-4" />
                              <span>{t('পণ্য প্যাকেজিং শুরু করুন', 'Start Processing')}</span>
                            </button>
                          )}

                          {o.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.firestoreId, 'orders', 'dispatched')}
                              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Truck className="w-4 h-4" />
                              <span>{t('মাল কুরিয়ারে পাঠান (Dispatch)', 'Dispatch / Ship Item')}</span>
                            </button>
                          )}

                          {o.status === 'dispatched' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.firestoreId, 'orders', 'completed')}
                              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('ডেলিভারি সম্পন্ন মার্ক করুন', 'Mark Delivered')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY SERVICES (POST NEW SERVICE) */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-gray-900">
                    {t('আপনার পোস্ট করা সার্ভিসসমূহ', 'Your Posted Services')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t('নতুন কাজ নিতে বা নিজের সার্ভিস কাস্টমারের জন্য পোস্ট করুন', 'Post new services for customers to book')}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddServiceForm ? t('ফর্ম বন্ধ করুন', 'Close Form') : t('+ নতুন সার্ভিস পোস্ট করুন', '+ Post New Service')}</span>
                </button>
              </div>

              {/* Add New Service Form Modal */}
              {showAddServiceForm && (
                <form onSubmit={handleCreateService} className="bg-emerald-50/80 p-4 sm:p-6 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in">
                  <h5 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    {t('নতুন সার্ভিস পোস্ট ফর্ম', 'Post New Service Form')}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('সার্ভিসের নাম (বাংলা)', 'Service Name (Bangla)')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={serviceTitle}
                        onChange={(e) => setServiceTitle(e.target.value)}
                        placeholder="যেমন: ডোর প্লাম্বিং ও ট্যাপ লিক ফিক্স"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('সার্ভিসের নাম (English)', 'Service Name (English)')}
                      </label>
                      <input
                        type="text"
                        value={serviceEnglishTitle}
                        onChange={(e) => setServiceEnglishTitle(e.target.value)}
                        placeholder="e.g. Doorstep Plumbing & Leak Fix"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('ক্যাটাগরি', 'Category')}
                      </label>
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {language === 'en' ? c.englishName : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('প্রারম্ভিক প্রাইস (৳)', 'Starting Price (৳)')}
                      </label>
                      <input
                        type="number"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('সময়সীমা', 'Duration')}
                      </label>
                      <input
                        type="text"
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(e.target.value)}
                        placeholder="যেমন: ১-২ ঘণ্টা"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('বিস্তারিত বিবরণ (Description)', 'Service Description')}
                    </label>
                    <textarea
                      value={serviceDesc}
                      onChange={(e) => setServiceDesc(e.target.value)}
                      placeholder="আপনার কাজের অভিজ্ঞতা ও সার্টিফাইড দক্ষতা সম্পর্কে লিখুন..."
                      rows={2}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('সার্ভিস সুবিধাসমূহ (প্রতি লাইনে একটি)', 'Service Features (One per line)')}
                    </label>
                    <textarea
                      value={serviceFeatures}
                      onChange={(e) => setServiceFeatures(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('যোগাযোগ নম্বর', 'Contact Phone')}
                      </label>
                      <input
                        type="tel"
                        value={servicePhone}
                        onChange={(e) => setServicePhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('ছবি লিংক (Image URL)', 'Image URL')}
                      </label>
                      <input
                        type="url"
                        value={serviceImage}
                        onChange={(e) => setServiceImage(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {submitting ? t('পাবলিস হচ্ছে...', 'Posting...') : t('সার্ভিসটি লাইভ পাবলিস করুন', 'Publish Service Live')}
                  </button>
                </form>
              )}

              {/* Display User Services List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userServices.map((s) => (
                  <div key={s.firestoreId || s.id} className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex gap-3">
                    <img src={s.image} alt={s.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                        {s.category}
                      </span>
                      <h5 className="font-bold text-xs text-gray-900 truncate">{s.title}</h5>
                      <span className="text-xs font-black text-emerald-800 block mt-1">৳ {s.startingPrice} {s.priceUnit}</span>
                      <p className="text-[11px] text-gray-500 truncate mt-1">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MY PRODUCTS (BUY & SELL PRODUCTS) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-gray-900">
                    {t('পণ্য বেচাকেনা ও আপনার লিস্টেড আইটেম', 'Your Buy & Sell Listed Products')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t('টুলস, হার্ডওয়্যার বা যেকোনো প্রয়োজনীয় পণ্য বিক্রি করতে যুক্ত করুন', 'List tools, hardware, or materials to sell directly')}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddProductForm(!showAddProductForm)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddProductForm ? t('ফর্ম বন্ধ করুন', 'Close Form') : t('+ নতুন প্রোডাক্ট যোগ করুন', '+ Add Product to Sell')}</span>
                </button>
              </div>

              {/* Add Product Form */}
              {showAddProductForm && (
                <form onSubmit={handleCreateProduct} className="bg-emerald-50/80 p-4 sm:p-6 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in">
                  <h5 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    {t('পণ্য বেচাকেনা ফর্ম', 'Product Sell Listing Form')}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('পণ্যের নাম (বাংলা)', 'Product Name (Bangla)')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        placeholder="যেমন: ১৯ পিস প্রফেশনাল রেঞ্চ টুলকিট"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('পণ্যের নাম (English)', 'Product Name (English)')}
                      </label>
                      <input
                        type="text"
                        value={productEnglishTitle}
                        onChange={(e) => setProductEnglishTitle(e.target.value)}
                        placeholder="e.g. 19 Pcs Professional Wrench Toolkit"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('ক্যাটাগরি', 'Category')}
                      </label>
                      <input
                        type="text"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('বিক্রয় মূল্য (৳)', 'Sale Price (৳)')}
                      </label>
                      <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('আসল মূল্য (৳)', 'Original Price (৳)')}
                      </label>
                      <input
                        type="number"
                        value={productOriginalPrice}
                        onChange={(e) => setProductOriginalPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('ওয়ারেন্টি তথ্য', 'Warranty Info')}
                    </label>
                    <input
                      type="text"
                      value={productWarranty}
                      onChange={(e) => setProductWarranty(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('পণ্যের বিবরণ', 'Product Description')}
                    </label>
                    <textarea
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('স্পেসিফিকেশন (প্রতি লাইনে একটি)', 'Specifications (One per line)')}
                    </label>
                    <textarea
                      value={productSpecs}
                      onChange={(e) => setProductSpecs(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {submitting ? t('যুক্ত হচ্ছে...', 'Listing...') : t('পণ্যটি বিক্রির জন্য লাইভ যুক্ত করুন', 'List Product For Sale')}
                  </button>
                </form>
              )}

              {/* Display User Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userProducts.map((p) => (
                  <div key={p.firestoreId || p.id} className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex gap-3">
                    <img src={p.image} alt={p.title} className="w-20 h-20 object-contain rounded-xl shrink-0 bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                        {p.category}
                      </span>
                      <h5 className="font-bold text-xs text-gray-900 truncate">{p.title}</h5>
                      <span className="text-xs font-black text-emerald-800 block mt-1">৳ {p.price}</span>
                      <p className="text-[11px] text-gray-500 truncate mt-1">{p.warranty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EARNINGS & STATS */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">{t('মোট আয়', 'Total Earnings')}</span>
                  <span className="text-2xl font-black text-emerald-900 font-mono">৳১২,৪৫০</span>
                  <span className="text-[10px] text-emerald-700 block">{t('ক্যাশ ও ডিজিটাল পেমেন্ট মিলিয়ে', 'Cash & digital payments')}</span>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                  <span className="text-xs font-bold text-blue-800 uppercase block">{t('সম্পন্ন কাজ / কাজ সম্পন্ন', 'Completed Jobs')}</span>
                  <span className="text-2xl font-black text-blue-900 font-mono">১৮ টি</span>
                  <span className="text-[10px] text-blue-700 block">{t('১০০% পজিটিভ কাস্টমার রিভিউ', '100% positive ratings')}</span>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                  <span className="text-xs font-bold text-purple-800 uppercase block">{t('গড় রেটিং', 'Average Rating')}</span>
                  <span className="text-2xl font-black text-purple-900 font-mono">★ ৪.৯ / ৫.০</span>
                  <span className="text-[10px] text-purple-700 block">{t('ভেরিফাইড সার্ভিস প্রোভাইডার', 'Verified Service Provider')}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500">
            {t('বিক্রেতা হেল্পলাইন:', 'Seller Helpline:')} <strong className="text-emerald-800">০৯৬১২-০০০০০০</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('বন্ধ করুন', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
