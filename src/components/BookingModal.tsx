import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Star,
  Loader2,
  Tag,
  Sparkles,
  Check
} from 'lucide-react';
import { Reviews } from './Reviews';
import { 
  ServiceItem, 
  BANGLADESH_DISTRICTS, 
  DHAKA_AREAS, 
  TIME_SLOTS 
} from '../data/marketplaceData';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  selectedLocation: string;
  initialCouponCode?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  onClose,
  selectedLocation,
  initialCouponCode,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [district, setDistrict] = useState(selectedLocation.split(',')[0].trim() || 'ঢাকা (Dhaka)');
  const [area, setArea] = useState(DHAKA_AREAS[0]);
  const [addressDetail, setAddressDetail] = useState('');
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    if (user?.displayName && !customerName) setCustomerName(user.displayName);
    if (user?.phoneNumber && !customerPhone) setCustomerPhone(user.phoneNumber);
  }, [user]);

  // Coupon state
  const [couponInput, setCouponInput] = useState(initialCouponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialCouponCode) {
      handleApplyCouponCode(initialCouponCode);
    }
  }, [initialCouponCode]);

  const handleApplyCouponCode = async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccessMsg(null);

    try {
      const docRef = doc(db, 'coupons', cleanCode);
      const docSnap = await getDoc(docRef);
      let couponData: any = null;

      if (docSnap.exists()) {
        couponData = docSnap.data();
      } else {
        const q = query(collection(db, 'coupons'), where('code', '==', cleanCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          couponData = querySnapshot.docs[0].data();
        }
      }

      if (!couponData && cleanCode === 'ALL20') {
        couponData = { code: 'ALL20', discountType: 'percent', discountValue: 20, active: true, description: t('২০% প্রথম বুকিং ছাড় কুপন', '20% First Booking Coupon') };
      } else if (!couponData && (cleanCode.startsWith('REF-') || cleanCode === 'WELCOME100')) {
        couponData = { code: cleanCode, discountType: 'flat', discountValue: 100, active: true, description: t('রেফারেল ডিসকাউন্ট কুপন (৳১০০ ছাড়)', 'Referral Discount Coupon (৳100 Off)') };
      }

      if (!couponData) {
        setCouponError(t(`'${cleanCode}' কুপন কোডটি সঠিক নয় বা পাওয়া যায়নি।`, `'${cleanCode}' coupon code is invalid or not found.`));
        setAppliedCoupon(null);
        return;
      }

      const discountType = couponData.discountType === 'flat' ? 'flat' : 'percent';
      const discountValue = Number(couponData.discountValue || 0);

      setAppliedCoupon({
        code: couponData.code || cleanCode,
        discountType,
        discountValue,
        description: couponData.description || t('ডিসকাউন্ট কুপন', 'Discount Coupon'),
      });
      const label = discountType === 'percent' ? `${discountValue}%` : `৳${discountValue}`;
      setCouponSuccessMsg(t(`'${cleanCode}' কুপন কোডটি প্রয়োগ করা হয়েছে! (${label} ছাড়)`, `'${cleanCode}' coupon code applied! (${label} off)`));
    } catch (e) {
      console.warn('Coupon check notice:', e);
      if (cleanCode.startsWith('REF-') || cleanCode === 'WELCOME100') {
        setAppliedCoupon({ code: cleanCode, discountType: 'flat', discountValue: 100, description: t('রেফারেল ডিসকাউন্ট কুপন', 'Referral Discount Coupon') });
        setCouponSuccessMsg(t(`'${cleanCode}' কুপন কোড প্রয়োগ করা হয়েছে! (৳১০০ ছাড়)`, `'${cleanCode}' coupon code applied! (৳100 off)`));
      } else {
        setCouponError(t('কুপন যাচাই করতে সমস্যা হয়েছে।', 'Failed to validate coupon code.'));
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  useEffect(() => {
    const checkAvailability = async () => {
      if (!service) return;
      setAvailabilityStatus('checking');
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('serviceId', '==', service.id),
          where('date', '==', date),
          where('timeSlot', '==', timeSlot)
        );
        const querySnapshot = await getDocs(q);
        setAvailabilityStatus(querySnapshot.empty ? 'available' : 'unavailable');
      } catch (error) {
        console.error('Availability check error:', error);
        setAvailabilityStatus('available');
      }
    };

    checkAvailability();
  }, [service?.id, date, timeSlot]);

  if (!service) return null;

  let discountAmount = 0;
  if (appliedCoupon && service) {
    if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((service.startingPrice * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(service.startingPrice, appliedCoupon.discountValue);
    }
  }
  const finalPrice = Math.max(0, service.startingPrice - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (availabilityStatus === 'unavailable') {
      alert(t('এই সময়টি বর্তমানে বুকড, দয়া করে অন্য সময় বা তারিখ বেছে নিন।', 'This time slot is currently booked. Please choose another date or time.'));
      return;
    }
    if (!customerName || !customerPhone) {
      alert(t('দয়া করে আপনার নাম এবং মোবাইল নম্বর দিন।', 'Please enter your name and phone number.'));
      return;
    }

    const generatedId = `ASBD-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(generatedId);
    setIsSubmitted(true);

    // Save to Local Unified Orders
    try {
      const saved = localStorage.getItem('user_unified_orders');
      const existing = saved ? JSON.parse(saved) : [];
      const demoBlacklist = ['ASBD-849201', 'ORD-BD-392104', 'ASBD-710382', 'ORD-BD-281903', 'ORD-BD-148415'];
      const filteredExisting = existing.filter((o: any) => !demoBlacklist.includes(o.id));

      const newBookingRecord = {
        id: generatedId,
        userId: user?.uid || null,
        type: 'service',
        title: service.title,
        category: service.category,
        customerName,
        customerPhone,
        date,
        timeSlot,
        address: `${addressDetail ? addressDetail + ', ' : ''}${area}, ${district}`,
        totalAmount: finalPrice,
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        status: 'pending',
        paymentMethod: t('ক্যাশ অন ডেলিভারি (কাজ শেষে)', 'Cash on Delivery (After Completion)'),
        technician: {
          name: t('আহসান হাবিব', 'Ahsan Habib'),
          phone: '01712-998877',
          rating: 4.9,
          title: t('নির্ধারিত সার্ভিস টেকনিশিয়ান', 'Assigned Service Technician')
        },
        createdAtFormatted: t('আজ', 'Today')
      };
      localStorage.setItem('user_unified_orders', JSON.stringify([newBookingRecord, ...filteredExisting]));

      // Track placed order ID
      const myIdsRaw = localStorage.getItem('user_my_order_ids');
      const myIds = myIdsRaw ? JSON.parse(myIdsRaw) : [];
      localStorage.setItem('user_my_order_ids', JSON.stringify([generatedId, ...myIds.filter((id: string) => !demoBlacklist.includes(id))]));
    } catch {
      // ignore
    }

    // Save to Firebase Firestore asynchronously
    try {
      addDoc(collection(db, 'bookings'), {
        bookingId: generatedId,
        userId: user?.uid || null,
        serviceId: service.id,
        serviceTitle: service.title,
        serviceCategory: service.category,
        startingPrice: service.startingPrice,
        discountAmount,
        finalPrice,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        customerName,
        customerPhone,
        date,
        timeSlot,
        district,
        area,
        addressDetail,
        specialInstructions,
        status: 'pending',
        createdAt: serverTimestamp(),
      }).catch((err) => {
        console.warn('Firestore write notice:', err);
      });
    } catch (e) {
      console.warn('Booking save error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                {t('সেবা বুকিং:', 'Book Service:')} {service.title}
              </h3>
              <p className="text-xs text-emerald-700 font-medium">
                {t('ক্যাটাগরি:', 'Category:')} {service.category} • {t('প্রারম্ভিক ফি:', 'Starting Fee:')} ৳{service.startingPrice}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                {t('আপনার বুকিং সফলভাবে গ্রহণ করা হয়েছে!', 'Your booking has been successfully placed!')}
              </h4>
              <div className="inline-block bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-sm">
                {t('বুকিং আইডি:', 'Booking ID:')} <strong className="text-emerald-800 text-base font-mono">{bookingId}</strong>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {t(`আমাদের অভিজ্ঞ টেকনিশিয়ান আগামী ১৫-২০ মিনিটের মধ্যে আপনার দেওয়া ফোন নম্বর (${customerPhone})-এ যোগাযোগ করবেন।`, `Our expert technician will contact you at ${customerPhone} within 15-20 minutes.`)}
              </p>
              <div className="bg-gray-50 p-4 rounded-xl text-left text-xs space-y-1.5 border border-gray-200">
                <div><strong>{t('সেবা:', 'Service:')}</strong> {service.title}</div>
                <div><strong>{t('তারিখ ও সময়:', 'Date & Time:')}</strong> {date} ({timeSlot})</div>
                <div><strong>{t('ঠিকানা:', 'Address:')}</strong> {addressDetail ? `${addressDetail}, ` : ''}{area}, {district}</div>
                <div><strong>{t('আনুমানিক চার্জ:', 'Estimated Charge:')}</strong> ৳ {service.startingPrice} ({t('সেবা শেষে প্রদানযোগ্য', 'payable after service')})</div>
              </div>

              {/* Rating Section */}
              <div className="bg-white p-4 rounded-xl border border-emerald-100 text-left">
                <h5 className="text-xs font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {t('আপনার অভিজ্ঞতা শেয়ার করুন', 'Share your experience')}
                </h5>
                <Reviews 
                  itemId={service.id} 
                  itemType="service" 
                  initialName={customerName}
                />
              </div>

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {t('ঠিক আছে, ধন্যবাদ', 'Okay, Thank you')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected service alert banner */}
              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {t('কোনো অগ্রিম ফি প্রয়োজন নেই! কাজ যাচাই করার পর ক্যাশ বা বিকাশে পেমেন্ট করবেন।', 'No advance fee required! Pay via Cash or bKash after service completion.')}
                </span>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('কখন সেবা নিতে চান? (তারিখ)', 'When do you want service? (Date)')}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-sans"
                      required
                    />
                    <Calendar className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                    <span>{t('পছন্দের সময় স্লট', 'Preferred Time Slot')}</span>
                    {availabilityStatus === 'checking' && (
                      <span className="text-gray-500 flex items-center gap-1 text-[10px]">
                        <Loader2 className="w-3 h-3 animate-spin" /> {t('চেকিং...', 'Checking...')}
                      </span>
                    )}
                    {availabilityStatus === 'available' && (
                      <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> {t('খালি আছে', 'Available')}
                      </span>
                    )}
                    {availabilityStatus === 'unavailable' && (
                      <span className="text-red-500 flex items-center gap-1 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" /> {t('বুকড', 'Booked')}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:border-emerald-500 font-sans bg-white ${
                        availabilityStatus === 'unavailable' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      disabled={availabilityStatus === 'checking'}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <Clock className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* District & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('জেলা', 'District')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-sans bg-white"
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('এলাকা / থানা', 'Area / Thana')}
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-sans bg-white"
                  >
                    {DHAKA_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address detail */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('বিস্তারিত ঠিকানা (বাসা/ফ্ল্যাট নং, রোড নং, ল্যান্ডমার্ক)', 'Detailed Address (House/Flat No, Road No, Landmark)')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder={t('যেমন: বাসা # ১২, রোড # ৪, ব্লক-বি...', 'e.g. House # 12, Road # 4, Block-B...')}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('আপনার নাম', 'Your Name')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t('যেমন: মোহাম্মদ রানা', 'e.g. Mohammad Rana')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                      required
                    />
                    <User className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('মোবাইল নম্বর', 'Mobile Number')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-sans"
                      required
                    />
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Specific details / issues */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('সমস্যার বিবরণ বা বিশেষ নির্দেশাবলী (ঐচ্ছিক)', 'Issue Details or Special Instructions (Optional)')}
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t('আপনার কাজের নির্দিষ্ট কোনো বিবরণ থাকলে লিখুন...', 'Write any specific instructions or requirements...')}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Coupon Input Section */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('ডিসকাউন্ট বা রেফারেল কুপন কোড:', 'Discount or Referral Coupon Code:')}</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                    {t('৳১০০ বোনাস প্রযোজ্য', '৳100 Bonus Applicable')}
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="p-2.5 bg-white border border-emerald-300 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-emerald-900 uppercase">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            {appliedCoupon.discountType === 'percent' 
                              ? t(`${appliedCoupon.discountValue}% ছাড়`, `${appliedCoupon.discountValue}% Off`)
                              : t(`৳${appliedCoupon.discountValue} ছাড়`, `৳${appliedCoupon.discountValue} Off`)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponInput('');
                        setCouponSuccessMsg(null);
                        setCouponError(null);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t('কুপন কোড লিখুন (যেমন: ALL20 বা REF-123)', 'Enter coupon code (e.g. ALL20 or REF-123)')}
                      className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg uppercase font-mono bg-white focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCouponCode(couponInput)}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isValidatingCoupon ? t('যাচাই...', 'Verifying...') : t('প্রয়োগ', 'Apply')}
                    </button>
                  </div>
                )}

                {couponError && (
                  <div className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-200 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}

                {couponSuccessMsg && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-100/80 p-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{couponSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">{t('পরিশোধযোগ্য ফি', 'Payable Fee')}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-emerald-700 font-black text-lg">
                      ৳ {finalPrice}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳ {service.startingPrice}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500">
                      {service.priceUnit}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    {t('বাতিল', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {t('বুকিং নিশ্চিত করুন', 'Confirm Booking')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

