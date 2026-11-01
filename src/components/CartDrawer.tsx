import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Check, 
  ShoppingBag,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ProductItem } from '../data/marketplaceData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  setDoc 
} from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrder?: number;
  description?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // Customer Checkout Details State
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDistrict, setDeliveryDistrict] = useState('ঢাকা (Dhaka)');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Keep customer name synced if user logs in
  React.useEffect(() => {
    if (user?.displayName && !customerName) {
      setCustomerName(user.displayName);
    }
    if (user?.phoneNumber && !customerPhone) {
      setCustomerPhone(user.phoneNumber);
    }
  }, [user]);

  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Compute discount based on validated applied coupon
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) {
      discountAmount = 0;
    } else if (appliedCoupon.discountType === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const deliveryFee = subtotal > 1500 || subtotal === 0 ? 0 : 60; // Free delivery over 1500 Tk
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const fmtPrice = (val: number) => language === 'en' ? val.toLocaleString('en-US') : val.toLocaleString('bn-BD');

  // Validate promotional code against Firestore 'coupons' collection
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccessMsg(null);

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('অনুগ্রহ করে একটি কুপন কোড লিখুন।');
      return;
    }

    setIsValidatingCoupon(true);
    const path = 'coupons';

    try {
      // 1. Try direct doc lookup by ID equal to coupon code
      const docRef = doc(db, path, cleanCode);
      const docSnap = await getDoc(docRef);

      let couponData: any = null;

      if (docSnap.exists()) {
        couponData = docSnap.data();
      } else {
        // 2. Query 'coupons' collection where 'code' field matches cleanCode
        const q = query(collection(db, path), where('code', '==', cleanCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          couponData = querySnapshot.docs[0].data();
        }
      }

      // 3. Auto-seed standard default coupon ALL20 in Firestore if not already present
      if (!couponData && cleanCode === 'ALL20') {
        couponData = {
          code: 'ALL20',
          discountType: 'percent',
          discountValue: 20,
          minOrder: 0,
          active: true,
          description: '২০% মূল্যছাড় (প্রথম সেবা বা অর্ডারে)'
        };
        try {
          await setDoc(doc(db, path, 'ALL20'), couponData);
        } catch {
          // Ignore write failure if read-only rules apply
        }
      }

      if (!couponData) {
        setCouponError(`'${cleanCode}' কুপন কোডটি সঠিক নয় বা পাওয়া যায়নি।`);
        setAppliedCoupon(null);
        return;
      }

      if (couponData.active === false) {
        setCouponError(`'${cleanCode}' কুপন কোডটির মেয়াদ শেষ হয়ে গেছে।`);
        setAppliedCoupon(null);
        return;
      }

      const minOrder = couponData.minOrder || couponData.minSubtotal || 0;
      if (subtotal < minOrder) {
        setCouponError(
          `এই কুপনটি প্রয়োগ করতে সর্বনিম্ন ৳${minOrder.toLocaleString('bn-BD')} টাকার পন্য অর্ডার করতে হবে।`
        );
        setAppliedCoupon(null);
        return;
      }

      const discountType: 'percent' | 'flat' = couponData.discountType === 'flat' ? 'flat' : 'percent';
      const discountValue = Number(
        couponData.discountValue ?? couponData.discountPercent ?? couponData.discountAmount ?? 0
      );

      const validatedCoupon: AppliedCoupon = {
        code: couponData.code || cleanCode,
        discountType,
        discountValue,
        minOrder,
        description: couponData.description || '',
      };

      setAppliedCoupon(validatedCoupon);
      const label = discountType === 'percent' ? `${discountValue}%` : `৳${discountValue}`;
      setCouponSuccessMsg(`'${validatedCoupon.code}' কুপন কোড সফলভাবে সক্রিয় হয়েছে! (${label} ছাড়)`);
    } catch (error) {
      console.error('Error validating coupon in Firestore:', error);
      setCouponError('ফায়ারস্টোর থেকে কুপন যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Log error already caught
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccessMsg(null);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutError(null);

    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();
    const trimmedAddress = deliveryAddress.trim();

    if (!trimmedName) {
      setCheckoutError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 11) {
      setCheckoutError('অনুগ্রহ করে সঠিক মোবাইল নম্বর লিখুন (যেমন: 01712345678)।');
      return;
    }

    if (!trimmedAddress) {
      setCheckoutError('অনুগ্রহ করে আপনার ডেলিভারি ঠিকানা লিখুন (বাসা/রোড, এলাকা)।');
      return;
    }

    const generatedId = `ORD-BD-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = `${trimmedAddress}, ${deliveryDistrict}`;
    setOrderId(generatedId);
    setIsOrdered(true);

    // Save to Local Unified Orders & Placed IDs
    try {
      const saved = localStorage.getItem('user_unified_orders');
      const existing = saved ? JSON.parse(saved) : [];
      // Clean legacy demo IDs
      const demoBlacklist = ['ASBD-849201', 'ORD-BD-392104', 'ASBD-710382', 'ORD-BD-281903', 'ORD-BD-148415'];
      const filteredExisting = existing.filter((o: any) => !demoBlacklist.includes(o.id));

      const newHardwareRecord = {
        id: generatedId,
        userId: user?.uid || null,
        type: 'hardware',
        title: cartItems.map((i) => i.product.title).join(', '),
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        date: 'আজ',
        address: fullAddress,
        totalAmount: total,
        status: 'pending',
        paymentMethod: paymentMethod === 'bkash' ? 'বিকাশ (bKash)' : paymentMethod === 'nagad' ? 'নগদ (Nagad)' : 'ক্যাশ অন ডেলিভারি',
        items: cartItems.map((item) => ({
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category,
        })),
        createdAtFormatted: 'আজ',
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount,
      };
      localStorage.setItem('user_unified_orders', JSON.stringify([newHardwareRecord, ...filteredExisting]));

      // Track placed order ID
      const myIdsRaw = localStorage.getItem('user_my_order_ids');
      const myIds = myIdsRaw ? JSON.parse(myIdsRaw) : [];
      localStorage.setItem('user_my_order_ids', JSON.stringify([generatedId, ...myIds.filter((id: string) => !demoBlacklist.includes(id))]));
    } catch {
      // ignore
    }

    const path = 'orders';
    try {
      addDoc(collection(db, path), {
        orderId: generatedId,
        userId: user?.uid || null,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        address: fullAddress,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category,
        })),
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        deliveryFee,
        total,
        paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
      }).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, path);
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  };

  const handleFinish = () => {
    onClearCart();
    setIsOrdered(false);
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccessMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                আপনার শপিং ব্যাগ ({cartItems.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {isOrdered ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  অর্ডারটি সফল হয়েছে!
                </h4>
                <div className="inline-block bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-sm">
                  অর্ডার ট্র্যাকিং নম্বর: <strong className="text-emerald-800 font-mono">{orderId}</strong>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 max-w-xs mx-auto">
                  আমরা খুব দ্রুত আপনার ঠিকানায় পণ্যগুলো পৌঁছে দেওয়ার প্রস্তুতি নিচ্ছি। ডেলিভারির সময় আপনাকে ফোন করা হবে।
                </p>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-left border border-gray-200 space-y-1">
                  <div><strong>মোট পরিশোধযোগ্য:</strong> ৳ {total.toLocaleString('bn-BD')}</div>
                  {appliedCoupon && (
                    <div><strong>প্রযুক্ত কুপন:</strong> {appliedCoupon.code} (৳{discountAmount.toLocaleString('bn-BD')} ছাড়)</div>
                  )}
                  <div><strong>পেমেন্ট মোড:</strong> {paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : paymentMethod === 'bkash' ? 'বিকাশ পেমেন্ট' : 'নগদ পেমেন্ট'}</div>
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  মার্কেটপ্লেসে ফিরুন
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-14 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium text-sm">
                  আপনার ব্যাগ বর্তমানে খালি রয়েছে
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  পণ্য ব্রাউজ করুন
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-200 bg-white"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-1 border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {item.product.title}
                        </h4>
                        <div className="text-emerald-700 font-extrabold text-xs mt-0.5">
                          ৳ {item.product.price.toLocaleString('bn-BD')}
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-gray-100 text-gray-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-gray-100 text-gray-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 cursor-pointer ml-auto"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promotional Code Input Box */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>প্রোমোশনাল কুপন কোড:</span>
                    </span>
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Firestore কুপনস
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="p-2.5 bg-white border border-emerald-300 rounded-xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-emerald-900 uppercase">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              {appliedCoupon.discountType === 'percent'
                                ? `${appliedCoupon.discountValue}% ছাড়`
                                : `৳${appliedCoupon.discountValue} ছাড়`}
                            </span>
                          </div>
                          {appliedCoupon.description && (
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              {appliedCoupon.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer transition-colors ml-2"
                        title="কুপন মুছুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="কুপন কোড লিখুন (যেমন: ALL20)"
                          disabled={isValidatingCoupon}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-600 uppercase font-mono bg-white"
                        />
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      </div>
                      <button
                        type="submit"
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {isValidatingCoupon ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>যাচাই...</span>
                          </>
                        ) : (
                          <span>প্রয়োগ</span>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Coupon Validation Messages */}
                  {couponError && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {couponSuccessMsg && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-100/70 border border-emerald-200 p-2 rounded-lg font-semibold">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                      <span>{couponSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {/* Customer Delivery Information */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ডেলিভারি তথ্য (Delivery Info)</span>
                    </span>
                    <span className="text-[10px] text-red-500 font-bold">* আবশ্যক</span>
                  </div>

                  {checkoutError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        পূর্ণ নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        মোবাইল নম্বর <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden text-gray-900 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="বাসা নং, রোড নং, এলাকা (যেমন: বাসা ১২, রোড ৪, মিরপুর-১০)"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      জেলা / শহর
                    </label>
                    <select
                      value={deliveryDistrict}
                      onChange={(e) => setDeliveryDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-hidden text-gray-900 cursor-pointer"
                    >
                      <option value="ঢাকা (Dhaka)">ঢাকা (Dhaka)</option>
                      <option value="চট্টগ্রাম (Chittagong)">চট্টগ্রাম (Chittagong)</option>
                      <option value="রাজশাহী (Rajshahi)">রাজশাহী (Rajshahi)</option>
                      <option value="খুলনা (Khulna)">খুলনা (Khulna)</option>
                      <option value="বরিশাল (Barishal)">বরিশাল (Barishal)</option>
                      <option value="সিলেট (Sylhet)">সিলেট (Sylhet)</option>
                      <option value="রংপুর (Rangpur)">রংপুর (Rangpur)</option>
                      <option value="ময়মনসিংহ (Mymensingh)">ময়মনসিংহ (Mymensingh)</option>
                    </select>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    পেমেন্ট পদ্ধতি নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      ক্যাশ অন ডেলিভারি
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-emerald-600 bg-pink-50 text-pink-700 font-bold ring-1 ring-pink-500'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      বিকাশ (bKash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'nagad'
                          ? 'border-emerald-600 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      নগদ (Nagad)
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 text-xs border border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>সাবটোটাল</span>
                    <span>৳ {subtotal.toLocaleString('bn-BD')}</span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>ডিসকাউন্ট ({appliedCoupon.code})</span>
                      <span>- ৳ {discountAmount.toLocaleString('bn-BD')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-700">ফ্রি</strong> : `৳ ${deliveryFee}`}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-sm text-gray-900">
                    <span>সর্বমোট পরিশোধযোগ্য</span>
                    <span className="text-emerald-800 text-base">
                      ৳ {total.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {!isOrdered && cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>অর্ডার কনফার্ম করুন (৳ {total.toLocaleString('bn-BD')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>নিরাপদ চেকআউট ও আসল পণ্যের নিশ্চয়তা</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
