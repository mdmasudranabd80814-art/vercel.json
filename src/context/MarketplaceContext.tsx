import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ServiceItem, ProductItem } from '../data/marketplaceData';
import { CartItem } from '../components/CartDrawer';
import { ToastNotification } from '../components/ToastContainer';
import { useAuth } from './AuthContext';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { DynamicHomepageContent } from '../App';
import { getPendingReferralCode, setPendingReferralCode } from '../utils/referral';

interface MarketplaceContextType {
  // Navigation & Search
  activeNav: string;
  setActiveNav: (nav: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;

  // Cart
  cartItems: CartItem[];
  handleAddToCart: (product: ProductItem, quantity?: number) => void;
  handleUpdateQuantity: (productId: string, quantity: number) => void;
  handleRemoveFromCart: (productId: string) => void;
  handleClearCart: () => void;
  totalCartCount: number;

  // Modals
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isHowItWorksOpen: boolean;
  setIsHowItWorksOpen: (open: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isReferralOpen: boolean;
  setIsReferralOpen: (open: boolean) => void;
  isSellerHubOpen: boolean;
  setIsSellerHubOpen: (open: boolean) => void;
  
  // Booking State
  activeBookingService: ServiceItem | null;
  setActiveBookingService: (service: ServiceItem | null) => void;
  activeDetailProduct: ProductItem | null;
  setActiveDetailProduct: (product: ProductItem | null) => void;
  initialBookingCoupon: string | undefined;
  setInitialBookingCoupon: (coupon: string | undefined) => void;
  referralBannerCode: string | null;

  // Toasts
  toasts: ToastNotification[];
  addToast: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  handleDismissToast: (id: string) => void;

  // Config
  homeContent: DynamicHomepageContent;
  loading: boolean;
  config: any;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const DEFAULT_HOME_CONTENT: DynamicHomepageContent = {
  heroTitle: 'আপনার সব সেবা, এক জায়গায়',
  heroSubtitle: 'হাজারো বিশ্বস্ত সেবা এখন আপনার হাতের মুঠোয় • ১০০০+ বিশ্বস্ত সার্ভিস প্রোভাইডার • ২৪/৭ সাপোর্ট • নিরাপদ ও নির্ভরযোগ্য',
  superPackagePrice: '৳১৪৯৯',
  services: [
    { name: 'ইলেকট্রিশিয়ান সার্ভিস', price: '৳৪৫০', icon: 'Zap' },
    { name: 'প্লাম্বিং ও পাইপ মেরামত', price: '৳ ৫০০', icon: 'Wrench' },
    { name: 'হোম ডিপ ক্লিনিং', price: '৳১৯৯৯', icon: 'Paintbrush' },
    { name: 'অভিজ্ঞ হোম টিউটর', price: '৳৩৫০০', icon: 'GraduationCap' },
  ],
  showPayments: true,
  footerText: 'বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন সার্ভিস মার্কেটপ্লেস। বাসা-বাড়ি ও অফিসের প্রয়োজনীয় ইলেকট্রিক্যাল, প্লাম্বিং, ডিপ ক্লিনিং, এসি মেরামত এবং হোম টিউটর সার্ভিস খুব সহজেই বুক করুন।',
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { config, loading } = useSiteConfig();

  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('ঢাকা, বাংলাদেশ');
  
  const [homeContent, setHomeContent] = useState<DynamicHomepageContent>(DEFAULT_HOME_CONTENT);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isSellerHubOpen, setIsSellerHubOpen] = useState(false);

  const [activeBookingService, setActiveBookingService] = useState<ServiceItem | null>(null);
  const [activeDetailProduct, setActiveDetailProduct] = useState<ProductItem | null>(null);
  const [initialBookingCoupon, setInitialBookingCoupon] = useState<string | undefined>(undefined);
  const [referralBannerCode, setReferralBannerCode] = useState<string | null>(null);

  // Referral load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || params.get('referral');
    if (refCode) {
      setPendingReferralCode(refCode);
      setReferralBannerCode(refCode.toUpperCase());
    } else {
      const pending = getPendingReferralCode();
      if (pending) setReferralBannerCode(pending.toUpperCase());
    }
  }, []);

  // Sync Homepage Content
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'homepage_content', 'main'), (snapshot) => {
      if (snapshot.exists()) setHomeContent(snapshot.data() as DynamicHomepageContent);
    });
    return () => unsub();
  }, []);

  // Cart Helpers
  const handleAddToCart = (product: ProductItem, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => setCartItems([]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Toast Helpers
  const addToast = (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { ...notification, id, timestamp: new Date() };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  };

  const handleDismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Listeners for order updates (simplified for context)
  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      // logic for toasts here if needed, but for now we keep it simple
    });
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      // logic for toasts here
    });
    return () => { unsubBookings(); unsubOrders(); };
  }, [user]);

  const value = {
    activeNav, setActiveNav,
    searchQuery, setSearchQuery,
    selectedCategoryId, setSelectedCategoryId,
    selectedLocation, setSelectedLocation,
    cartItems, handleAddToCart, handleUpdateQuantity, handleRemoveFromCart, handleClearCart, totalCartCount,
    isLocationModalOpen, setIsLocationModalOpen,
    isCartOpen, setIsCartOpen,
    isHowItWorksOpen, setIsHowItWorksOpen,
    isLoginOpen, setIsLoginOpen,
    isReferralOpen, setIsReferralOpen,
    isSellerHubOpen, setIsSellerHubOpen,
    activeBookingService, setActiveBookingService,
    activeDetailProduct, setActiveDetailProduct,
    initialBookingCoupon, setInitialBookingCoupon,
    referralBannerCode,
    toasts, addToast, handleDismissToast,
    homeContent, loading, config
  };

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) throw new Error('useMarketplace must be used within a MarketplaceProvider');
  return context;
};
