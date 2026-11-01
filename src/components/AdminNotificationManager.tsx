import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Tag, 
  ShoppingBag, 
  Wrench, 
  Gift, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle, 
  X, 
  Eye, 
  Send, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  Link, 
  Image as ImageIcon,
  Check,
  Search,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { POPULAR_PRODUCTS, POPULAR_SERVICES, ProductItem } from '../data/marketplaceData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export interface AdminNotification {
  id: string;
  type: 'product' | 'offer' | 'service' | 'referral' | 'system';
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  tag?: string;
  tagEn?: string;
  actionType: 'product' | 'link' | 'offers' | 'services' | 'referral' | 'hotline';
  actionText?: string;
  actionTextEn?: string;
  actionUrl?: string;
  productId?: string;
  imageUrl?: string;
  active: boolean;
  time?: string;
  timeEn?: string;
  timestamp: number;
  isRead?: boolean;
}

const DEFAULT_ADMIN_NOTIFICATIONS: AdminNotification[] = [
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
    tag: '২০% ছাড়',
    tagEn: '20% OFF',
    actionType: 'offers',
    actionText: 'অফারটি দেখুন',
    actionTextEn: 'View Offer',
    active: true,
    time: '১০ মিনিট আগে',
    timeEn: '10 min ago',
    timestamp: Date.now() - 1000 * 60 * 10,
    isRead: false
  },
  {
    id: 'notif-2',
    type: 'service',
    title: '⚡ দ্রুত সার্ভিস গ্যারান্টি: ৩০ মিনিটে টেকনিশিয়ান',
    titleEn: 'Fast Service Guarantee: Technician in 30 Mins',
    message: 'আপনার এলাকায় অভিজ্ঞ টেকনিশিয়ান প্রস্তুত আছেন। অর্ডার সম্পন্ন হলে ৩০ মিনিটের মধ্যে সার্ভিস টিম পৌঁছাবে।',
    messageEn: 'Skilled technicians are on standby in your area. Service provider arrives within 30 minutes.',
    tag: 'সার্ভিস আপডেট',
    tagEn: 'Service Update',
    actionType: 'services',
    actionText: 'সেবা সমূহ বুক করুন',
    actionTextEn: 'Book Services',
    active: true,
    time: '১ ঘণ্টা আগে',
    timeEn: '1 hour ago',
    timestamp: Date.now() - 1000 * 60 * 60,
    isRead: false
  },
  {
    id: 'notif-3',
    type: 'referral',
    title: '🎁 রেফারেল বোনাস ৳১০০ নগদ ক্যাশব্যাক',
    titleEn: 'Referral Bonus ৳100 Cashback',
    message: 'বন্ধুদের All Service BD রেফার করুন এবং প্রতি সফল রেফার বা বুকিংয়ে পান ৳১০০ ক্যাশব্যাক ডিসকাউন্ট ভাউচার!',
    messageEn: 'Refer friends to All Service BD and receive ৳100 voucher for each referral!',
    tag: '৳১০০ বোনাস',
    tagEn: '৳100 Bonus',
    actionType: 'referral',
    actionText: 'রেফার লিংক দেখুন',
    actionTextEn: 'View Refer Link',
    active: true,
    time: '৩ ঘণ্টা আগে',
    timeEn: '3 hours ago',
    timestamp: Date.now() - 1000 * 60 * 180,
    isRead: false
  },
  {
    id: 'notif-4',
    type: 'system',
    title: '🛡️ ১০০% ভেরিফাইড কারিগর ও নিরাপত্তা গ্যারান্টি',
    titleEn: '100% Verified Technicians & Safety Guarantee',
    message: 'All Service BD-এর সকল টেকনিশিয়ান জাতীয় পরিচয়পত্র ও পুলিশ ক্লিয়ারেন্স ভেরিফাইড। নিশ্চিন্তে সেবা নিন।',
    messageEn: 'Every All Service BD technician is NID verified and police cleared. Enjoy safe service.',
    tag: 'নিরাপত্তা',
    tagEn: 'Safety',
    actionType: 'services',
    actionText: 'সেফটি স্ট্যান্ডার্ড',
    actionTextEn: 'Safety Standards',
    active: true,
    time: '১ দিন আগে',
    timeEn: '1 day ago',
    timestamp: Date.now() - 1000 * 60 * 1440,
    isRead: true
  }
];

export const AdminNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
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
    return DEFAULT_ADMIN_NOTIFICATIONS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminNotification | null>(null);
  const [previewItem, setPreviewItem] = useState<AdminNotification | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<AdminNotification>>({
    type: 'product',
    title: '',
    titleEn: '',
    message: '',
    messageEn: '',
    tag: '',
    tagEn: '',
    actionType: 'product',
    actionText: 'পণ্যটি কিনুন',
    actionTextEn: 'Buy Product',
    actionUrl: '',
    productId: '',
    imageUrl: '',
    active: true
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync to Firestore & localStorage
  const syncNotifications = async (list: AdminNotification[]) => {
    setNotifications(list);
    try {
      localStorage.setItem('asb_notifications_v1', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }

    // Also push to Firestore collection 'notifications'
    try {
      for (const item of list) {
        await setDoc(doc(db, 'notifications', item.id), {
          ...item,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Could not sync notification to Firestore (will use local):', err);
    }
  };

  // Listen to Firestore real-time updates
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: AdminNotification[] = [];
          snapshot.forEach((d) => {
            remoteList.push(d.data() as AdminNotification);
          });
          if (remoteList.length > 0) {
            remoteList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            setNotifications(remoteList);
            try {
              localStorage.setItem('asb_notifications_v1', JSON.stringify(remoteList));
              window.dispatchEvent(new Event('storage'));
            } catch {
              // ignore
            }
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'notifications');
      });
      return () => unsub();
    } catch (err) {
      // offline fallback
    }
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    const defaultProduct = POPULAR_PRODUCTS[0];
    setEditingItem(null);
    setFormData({
      type: 'product',
      title: `⚡ নতুন পণ্য: ${defaultProduct.title} স্টকে এসেছে!`,
      titleEn: `New Product: ${defaultProduct.englishTitle} Available Now!`,
      message: `${defaultProduct.description} - এখনই অর্ডার করে দ্রুত ডেলিভারি গ্রহণ করুন।`,
      messageEn: `${defaultProduct.englishTitle} in stock with warranty. Order now for express delivery.`,
      tag: 'নতুন পণ্য',
      tagEn: 'New Product',
      actionType: 'product',
      productId: defaultProduct.id,
      actionText: `পণ্যটি কিনুন ৳${defaultProduct.price}`,
      actionTextEn: `Buy Product ৳${defaultProduct.price}`,
      actionUrl: '',
      imageUrl: defaultProduct.image,
      active: true
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: AdminNotification) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Quick preset broadcast from a product
  const handleQuickProductBroadcast = (product: ProductItem) => {
    const newNotif: AdminNotification = {
      id: `notif-prod-${Date.now()}`,
      type: 'product',
      title: `🔥 হট ডিল: ${product.title} এ পাচ্ছেন ${product.discountBadge || 'বিশেষ ছাড়'}!`,
      titleEn: `Hot Deal: ${product.englishTitle} with Special Discount!`,
      message: `${product.description} মূল মূল্য ৳${product.originalPrice}, বর্তমান বিশেষ অফার মূল্য মাত্র ৳${product.price}।`,
      messageEn: `${product.englishTitle} at discounted price ৳${product.price}. In stock with warranty.`,
      tag: product.discountBadge || 'হট ডিল',
      tagEn: 'Hot Deal',
      actionType: 'product',
      productId: product.id,
      actionText: `এখনই কিনুন ৳${product.price}`,
      actionTextEn: `Buy Now ৳${product.price}`,
      imageUrl: product.image,
      active: true,
      time: 'সবেমাত্র যুক্ত',
      timeEn: 'Just now',
      timestamp: Date.now(),
      isRead: false
    };

    const updated = [newNotif, ...notifications];
    syncNotifications(updated);
    showToast(`"${product.title}" এর জন্য নতুন নোটিফিকেশন ব্রডকাস্ট পাঠানো হয়েছে!`);
  };

  // Handle Save (Create or Update)
  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.message?.trim()) {
      showToast('দয়া করে নোটিফিকেশনের শিরোনাম ও বিবরণ পূরণ করুন');
      return;
    }

    setIsLoading(true);
    try {
      if (editingItem) {
        // Update existing
        const updatedItem: AdminNotification = {
          ...editingItem,
          ...formData,
          title: formData.title.trim(),
          message: formData.message.trim(),
          timestamp: Date.now()
        } as AdminNotification;

        const updated = notifications.map(n => n.id === editingItem.id ? updatedItem : n);
        await syncNotifications(updated);
        showToast('নোটিফিকেশন সফলভাবে আপডেট করা হয়েছে');
      } else {
        // Create new
        const newItem: AdminNotification = {
          id: `notif-${Date.now()}`,
          type: formData.type || 'product',
          title: formData.title.trim(),
          titleEn: formData.titleEn?.trim() || formData.title.trim(),
          message: formData.message.trim(),
          messageEn: formData.messageEn?.trim() || formData.message.trim(),
          tag: formData.tag?.trim() || 'আপডেট',
          tagEn: formData.tagEn?.trim() || 'Update',
          actionType: formData.actionType || 'product',
          actionText: formData.actionText?.trim() || 'দেখুন',
          actionTextEn: formData.actionTextEn?.trim() || 'View',
          actionUrl: formData.actionUrl?.trim() || '',
          productId: formData.productId?.trim() || '',
          imageUrl: formData.imageUrl?.trim() || '',
          active: formData.active !== false,
          time: 'সবেমাত্র',
          timeEn: 'Just now',
          timestamp: Date.now(),
          isRead: false
        };

        const updated = [newItem, ...notifications];
        await syncNotifications(updated);
        showToast('নতুন নোটিফিকেশন সকল গ্রাহকদের কাছে ব্রডকাস্ট করা হয়েছে!');
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      showToast('নোটিফিকেশন সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle active/inactive
  const handleToggleActive = (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (!target) return;
    const newStatus = !target.active;
    const updated = notifications.map(n => n.id === id ? { ...n, active: newStatus } : n);
    syncNotifications(updated);
    showToast(newStatus ? 'নোটিফিকেশন গ্রাহকদের জন্য সক্রিয় করা হয়েছে' : 'নোটিফিকেশন নিষ্ক্রিয় করা হয়েছে');
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি এই নোটিফিকেশনটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    const updated = notifications.filter(n => n.id !== id);
    await syncNotifications(updated);
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch {
      // ignore
    }
    showToast('নোটিফিকেশন মুছে ফেলা হয়েছে');
  };

  // When admin selects a product in the dropdown
  const handleSelectProductChange = (prodId: string) => {
    const found = POPULAR_PRODUCTS.find(p => p.id === prodId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        type: 'product',
        actionType: 'product',
        productId: found.id,
        imageUrl: found.image,
        title: prev.title || `⚡ বিশেষ অফার: ${found.title}`,
        titleEn: prev.titleEn || `Special Offer: ${found.englishTitle}`,
        actionText: `পণ্যটি কিনুন ৳${found.price}`,
        actionTextEn: `Buy Product ৳${found.price}`,
        tag: found.discountBadge || 'পণ্য অফার'
      }));
    } else {
      setFormData(prev => ({ ...prev, productId: prodId }));
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q)) ||
        (item.productId && item.productId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* 1. Header Banner & Quick Action */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-700/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20 shadow-inner">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">
                নোটিফিকেশন ব্রডকাস্ট ও ম্যানেজমেন্ট সেন্টার
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-emerald-950">
                লাইভ পুশ
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              এখান থেকে সকল গ্রাহকের নোটিফিকেশন প্যানেলে সরাসরি নতুন অফার, পণ্য লিংক, ডিসকাউন্ট ও জরুরি নোটিশ পাঠানো এবং এডিট করা যায়।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => syncNotifications(DEFAULT_ADMIN_NOTIFICATIONS)}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer flex items-center gap-1.5"
            title="নমুনা নোটিফিকেশন রিস্টোর করুন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>নমুনা ডেটা</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>নতুন নোটিফিকেশন পাঠান</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">মোট নোটিফিকেশন</span>
            <Bell className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{notifications.length}</p>
          <span className="text-[10px] text-gray-400">সিস্টেম ও অ্যাডমিন ব্রডকাস্ট</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">সক্রিয় ব্রডকাস্ট</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">
            {notifications.filter(n => n.active).length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">গ্রাহকদের কাছে দৃশ্যমান</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">পণ্য লিংক নোটিফিকেশন</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {notifications.filter(n => n.type === 'product' || n.productId).length}
          </p>
          <span className="text-[10px] text-amber-700 font-semibold">সরাসরি প্রোডাক্ট ব্রডকাস্ট</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">ডিসকাউন্ট ও অফার</span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">
            {notifications.filter(n => n.type === 'offer').length}
          </p>
          <span className="text-[10px] text-purple-600 font-semibold">কুপন ও ছাড় নোটিফিকেশন</span>
        </div>
      </div>

      {/* 3. Quick 1-Click Product Broadcast Carousel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="font-black text-sm text-gray-900">
              এক-ক্লিকে পণ্য প্রোমো ব্রডকাস্ট (১-Click Instant Product Broadcast)
            </h4>
          </div>
          <span className="text-[11px] text-gray-500">
            পণ্য সিলেক্ট করলেই স্বয়ংক্রিয়ভাবে নোটিফিকেশন তৈরি হয়ে গ্রাহকদের কাছে চলে যাবে
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {POPULAR_PRODUCTS.slice(0, 4).map((prod) => (
            <div
              key={prod.id}
              className="p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-200/80 transition-all flex items-center justify-between gap-3 group"
            >
              <img
                src={prod.image}
                alt={prod.title}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-900 truncate group-hover:text-emerald-800">
                  {prod.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-emerald-700">৳{prod.price}</span>
                  {prod.discountBadge && (
                    <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                      {prod.discountBadge}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickProductBroadcast(prod)}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-all shadow-xs flex items-center gap-1"
                title="গ্রাহকদের নোটিফিকেশন পাঠান"
              >
                <Send className="w-3 h-3" />
                <span>পাঠান</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Controls & Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটিফিকেশন খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'সকল' },
            { id: 'product', label: 'পণ্য লিংক' },
            { id: 'offer', label: 'অফার' },
            { id: 'service', label: 'সার্ভিস' },
            { id: 'referral', label: 'রেফারেল' },
            { id: 'system', label: 'সিস্টেম' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Notification Items List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-sm">কোনো নোটিফিকেশন পাওয়া যায়নি</p>
              <p className="text-xs mt-1">নতুন নোটিফিকেশন তৈরি করতে উপরের বাটনে ক্লিক করুন।</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  item.active ? 'hover:bg-gray-50/80 bg-white' : 'bg-gray-50/50 opacity-60'
                }`}
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Thumbnail / Icon */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-gray-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                      {item.type === 'product' && <ShoppingBag className="w-5 h-5 text-amber-600" />}
                      {item.type === 'offer' && <Tag className="w-5 h-5 text-purple-600" />}
                      {item.type === 'service' && <Wrench className="w-5 h-5 text-emerald-600" />}
                      {item.type === 'referral' && <Gift className="w-5 h-5 text-pink-600" />}
                      {item.type === 'system' && <ShieldCheck className="w-5 h-5 text-blue-600" />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-sm text-gray-900">
                        {item.title}
                      </span>

                      {item.tag && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {item.tag}
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'product' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        item.type === 'offer' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                        item.type === 'service' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {item.type}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-600 animate-pulse' : 'bg-gray-500'}`} />
                        {item.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-2 max-w-3xl">
                      {item.message}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      {item.productId && (
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          <ShoppingBag className="w-3 h-3 text-emerald-600" />
                          লিংকড প্রোডাক্ট: {item.productId}
                        </span>
                      )}

                      {item.actionUrl && (
                        <span className="inline-flex items-center gap-1 font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          <Link className="w-3 h-3 text-gray-500" />
                          {item.actionUrl}
                        </span>
                      )}

                      {item.actionText && (
                        <span className="font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          বাটন: "{item.actionText}"
                        </span>
                      )}

                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time || 'সদ্য'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-2 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-gray-200"
                    title="গ্রাহক প্রিভিউ দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      item.active
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    {item.active ? 'পজ করুন' : 'চালু করুন'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200"
                    title="এডিট করুন"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-red-200"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingItem ? 'নোটিফিকেশন এডিট করুন' : 'নতুন গ্রাহক নোটিফিকেশন তৈরি করুন'}
                </h3>
                <p className="text-xs text-gray-500">
                  পণ্য লিংক, স্পেশাল অফার কিংবা জরুরি সার্ভিস আপডেট সরাসরি গ্রাহকদের কাছে পাঠান
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveNotification} className="space-y-4 text-xs font-sans">
              {/* Type and Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    নোটিফিকেশন টাইপ *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 bg-gray-50 font-semibold"
                  >
                    <option value="product">পণ্য লিংক ও প্রমোশন (Product Link)</option>
                    <option value="offer">ডিসকাউন্ট ও কুপন অফার (Special Offer)</option>
                    <option value="service">সার্ভিস বুকিং আপডেট (Service Update)</option>
                    <option value="referral">রেফারেল বোনাস (Referral Reward)</option>
                    <option value="system">সিস্টেম ও সাধারণ নোটিশ (System Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    অ্যাকশন বাটন টাইপ (Action) *
                  </label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 bg-gray-50 font-semibold"
                  >
                    <option value="product">নির্দিষ্ট পণ্য ওপেন করবে (Open Product Modal)</option>
                    <option value="offers">অফার সেকশনে নিয়ে যাবে (Open Offers)</option>
                    <option value="services">সার্ভিস সেকশনে স্ক্রল করবে (Go to Services)</option>
                    <option value="referral">রেফারেল পপআপ ওপেন করবে (Open Referral)</option>
                    <option value="link">কাস্টম ওয়েব লিংক (External/Internal URL)</option>
                    <option value="hotline">হটলাইনে সরাসরি কল (Call 24/7 Hotline)</option>
                  </select>
                </div>
              </div>

              {/* Product Selector if type is product */}
              {formData.actionType === 'product' && (
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                      <span>মার্কেটপ্লেসের পণ্য নির্বাচন করুন (Select Product)</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-medium">
                      সিলেক্ট করলে স্বয়ংক্রিয়ভাবে টাইটেল, ছবি ও বাটন পূরণ হবে
                    </span>
                  </div>

                  <select
                    value={formData.productId || ''}
                    onChange={(e) => handleSelectProductChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="">-- যেকোনো একটি পণ্য বেছে নিন --</option>
                    {POPULAR_PRODUCTS.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.title} (৳{prod.price}) - {prod.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Link if actionType is link */}
              {formData.actionType === 'link' && (
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    কাস্টম ওয়েব/প্রোডাক্ট লিংক URL *
                  </label>
                  <input
                    type="url"
                    value={formData.actionUrl || ''}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    placeholder="https://example.com বা /products/drill"
                    className="w-full px-3 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-emerald-500/20 bg-gray-50"
                  />
                </div>
              )}

              {/* Bangla Title */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  নোটিফিকেশন শিরোনাম (Bangla) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: ⚡ নতুন পণ্য: কর্ডলেস পাওয়ার ড্রিল স্টকে এসেছে!"
                  className="w-full px-3 py-2 border rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* English Title */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  শিরোনাম (English)
                </label>
                <input
                  type="text"
                  value={formData.titleEn || ''}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="e.g. Special Offer: 20% Off on Cordless Drill"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Message Details (Bangla) */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  বিস্তারিত বিবরণ / বার্তা (Bangla) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.message || ''}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="গ্রাহকদের যে তথ্যটি পাঠাতে চান..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-gray-800"
                />
              </div>

              {/* Message Details (English) */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  বিস্তারিত বিবরণ (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.messageEn || ''}
                  onChange={(e) => setFormData({ ...formData, messageEn: e.target.value })}
                  placeholder="English message description for foreign language users..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-gray-800"
                />
              </div>

              {/* Tag and Action Button Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    ট্যাগ / ব্যাজ (Tag Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="যেমন: নতুন পণ্য / ২০% ছাড় / ধামাকা অফার"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    অ্যাকশন বাটনের টেক্সট (Button Label)
                  </label>
                  <input
                    type="text"
                    value={formData.actionText || ''}
                    onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                    placeholder="যেমন: পণ্যটি কিনুন / অফার দেখুন"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
                  <span>পণ্য / ব্যানারের ছবি লিংক (Image URL)</span>
                  <span className="text-gray-400 font-normal">ঐচ্ছিক</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Active status */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>অবিলম্বে গ্রাহকদের জন্য সক্রিয় রাখুন (Publish Immediately)</span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black shadow-md cursor-pointer flex items-center gap-2 transition-transform hover:scale-102"
                >
                  <Send className="w-4 h-4" />
                  <span>{editingItem ? 'পরিবর্তন সংরক্ষণ করুন' : 'এখনই ব্রডকাস্ট পাঠান'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
              <Eye className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">গ্রাহক প্রিভিউ (Customer Preview)</h4>
                <p className="text-[11px] text-gray-500">গ্রাহকদের কাছে নোটিফিকেশনটি এভাবে প্রদর্শিত হবে:</p>
              </div>
            </div>

            {/* Rendered Notification Card */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
              {previewItem.imageUrl ? (
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-300/60 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                  <Bell className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="font-bold text-xs text-gray-900">
                    {previewItem.title}
                  </span>
                  {previewItem.tag && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                      {previewItem.tag}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-2.5">
                  {previewItem.message}
                </p>

                {previewItem.actionText && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs"
                  >
                    <span>{previewItem.actionText}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-700 animate-in fade-in duration-150">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
