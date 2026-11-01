import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  X, 
  PlusCircle, 
  Percent, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  LogOut,
  ChevronRight,
  Gift,
  Share2,
  Copy,
  Check,
  Globe,
  ClipboardList,
  Store,
  Sparkles,
  FileCheck,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  ShieldAlert,
  FileText,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserReferralCode } from '../utils/referral';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
  serviceCategory: string;
  platformCommission: number;
  providerEarnings: number;
  commissionRate: number;
}

export interface NIDSubmissionRecord {
  id: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  nidNumber: string;
  fullName: string;
  frontPhoto?: string | null;
  backPhoto?: string | null;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface NIDVerificationData {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  nidNumber: string;
  fullName: string;
  frontPhoto: string | null;
  backPhoto: string | null;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  submissions?: NIDSubmissionRecord[];
}

const DEFAULT_TRANSACTIONS: Transaction[] = [];

const SAMPLE_NID_FRONT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%23065F46"/><rect x="12" y="12" width="376" height="226" rx="12" fill="%23ECFDF5" stroke="%2334D399" stroke-width="2"/><text x="140" y="45" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23065F46">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text><text x="150" y="65" font-family="sans-serif" font-size="11" fill="%23047857">Government of the People's Republic of Bangladesh</text><text x="165" y="85" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23DC2626">NATIONAL ID CARD / জাতীয় পরিচয় পত্র</text><rect x="30" y="105" width="90" height="110" rx="8" fill="%23D1FAE5" stroke="%2310B981" stroke-width="2"/><circle cx="75" cy="140" r="28" fill="%23059669"/><path d="M45 200 C45 175, 105 175, 105 200 Z" fill="%23047857"/><text x="140" y="125" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23111827">নাম: মোঃ মাসুদ রানা</text><text x="140" y="145" font-family="sans-serif" font-size="11" fill="%23374151">Name: Md Masud Rana</text><text x="140" y="165" font-family="sans-serif" font-size="11" fill="%23374151">পিতা: আব্দুল জব্বার</text><text x="140" y="185" font-family="sans-serif" font-size="11" fill="%23374151">মা: রহিমা বেগম</text><text x="140" y="210" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23065F46">NID NO: 19952691482003891</text></svg>`;

const SAMPLE_NID_BACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="none"><rect width="400" height="250" rx="16" fill="%23065F46"/><rect x="12" y="12" width="376" height="226" rx="12" fill="%23F3F4F6" stroke="%23D1D5DB" stroke-width="2"/><rect x="25" y="30" width="350" height="40" rx="4" fill="%231F2937"/><text x="35" y="55" font-family="monospace" font-size="10" fill="%23F9FAFB">||||| ||| ||||||| |||| |||||| ||||| |||| |||||||| |||||||</text><text x="30" y="95" font-family="sans-serif" font-size="11" fill="%23374151">ঠিকানা: গ্রাম/রাস্তা: ধানমন্ডি ২৭, ডাকঘর: ধানমন্ডি,</text><text x="30" y="115" font-family="sans-serif" font-size="11" fill="%23374151">উপজেলা: ধানমন্ডি, জেলা: ঢাকা</text><text x="30" y="140" font-family="sans-serif" font-size="11" fill="%23374151">রক্তের গ্রুপ / Blood Group: O+</text><text x="30" y="160" font-family="sans-serif" font-size="11" fill="%23374151">প্রদানের তারিখ: 12/05/2018</text><rect x="250" y="145" width="120" height="70" rx="4" fill="%23E5E7EB" stroke="%239CA3AF"/><text x="260" y="185" font-family="monospace" font-size="9" fill="%234B5563">&lt;&lt;BAN9526914820&lt;&lt;</text></svg>`;

const INITIAL_NID_SUBMISSIONS: NIDSubmissionRecord[] = [];

export const UserProfile: React.FC<{ 
  onClose?: () => void; 
  onOpenReferralModal?: () => void; 
  onOpenSellerHub?: () => void;
  onOpenOrders?: () => void;
}> = ({ onClose, onOpenReferralModal, onOpenSellerHub, onOpenOrders }) => {
  const { user, logoutUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const referralCode = getUserReferralCode(user || {});
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://allservicebd.com';
  const referralLink = `${baseUrl}/?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 1. Wallet Balance & Total Spent from localStorage "user_wallet"
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('user_wallet');
      if (saved) {
        const num = parseFloat(saved);
        if (!isNaN(num)) return num;
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.balance === 'number') return parsed.balance;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [totalSpent, setTotalSpent] = useState<number>(() => {
    try {
      const savedOrders = localStorage.getItem('user_unified_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          // Filter out demo orders
          const demoIds = ['ASBD-849201', 'ORD-BD-392104', 'ASBD-710382', 'ORD-BD-281903', 'ORD-BD-148415'];
          return orders
            .filter((o: any) => !demoIds.includes(o.id))
            .filter((o: any) => o.status === 'completed' || o.status === 'delivered')
            .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        }
      }
      
      const saved = localStorage.getItem('user_total_spent');
      if (saved) {
        const num = parseFloat(saved);
        if (!isNaN(num)) return num;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  // 1.1 Loyalty Points Calculation (10 points per ৳100 spent)
  const loyaltyPoints = Math.floor(totalSpent / 100) * 10;
  const pointsToNextCoupon = 500;
  const progressToNextCoupon = (loyaltyPoints % pointsToNextCoupon) / pointsToNextCoupon * 100;
  const pointsRemaining = pointsToNextCoupon - (loyaltyPoints % pointsToNextCoupon);

  // Commission Config (e.g. 15% platform, 85% provider)
  const [commissionRate, setCommissionRate] = useState<number>(() => {
    try {
      const config = localStorage.getItem('commission_config');
      if (config) {
        const parsed = JSON.parse(config);
        if (typeof parsed.platformRate === 'number') return parsed.platformRate;
        if (typeof parsed.platformPercent === 'number') return parsed.platformPercent;
        const num = parseFloat(config);
        if (!isNaN(num)) return num;
      }
      return 15;
    } catch {
      return 15;
    }
  });

  // History transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('user_wallet_history');
      return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  });

  // Modals inside Profile
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('1000');
  const [notification, setNotification] = useState<string | null>(null);

  // Sync wallet balance to localStorage
  useEffect(() => {
    localStorage.setItem('user_wallet', walletBalance.toString());
    localStorage.setItem('user_total_spent', totalSpent.toString());

    // Sync Loyalty Points to Firestore for leaderboard
    if (user?.uid) {
      const syncLoyalty = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous User',
            photoURL: user.photoURL || '',
            loyaltyPoints: loyaltyPoints,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Leaderboard sync error:', err);
        }
      };
      syncLoyalty();
    }
  }, [walletBalance, totalSpent, loyaltyPoints, user]);

  // Clean up legacy demo data from localStorage on mount
  useEffect(() => {
    try {
      // Clean Orders
      const orderKey = 'user_unified_orders';
      const savedOrders = localStorage.getItem(orderKey);
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          const demoIds = ['ASBD-849201', 'ORD-BD-392104', 'ASBD-710382', 'ORD-BD-281903', 'ORD-BD-148415'];
          const filtered = orders.filter((o: any) => !demoIds.includes(o.id));
          if (filtered.length !== orders.length) {
            localStorage.setItem(orderKey, JSON.stringify(filtered));
            // Force totalSpent update
            const newTotal = filtered
              .filter((o: any) => o.status === 'completed' || o.status === 'delivered')
              .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
            setTotalSpent(newTotal);
          }
        }
      }

      // Clean NID
      const nidKey = `nid_verification_${user?.uid || 'default'}`;
      const savedNid = localStorage.getItem(nidKey);
      if (savedNid) {
        const parsed = JSON.parse(savedNid);
        if (parsed.submissions && Array.isArray(parsed.submissions)) {
          const demoNidIds = ['NID-SUB-20261028-01'];
          const filtered = parsed.submissions.filter((s: any) => !demoNidIds.includes(s.id));
          if (filtered.length !== parsed.submissions.length) {
            parsed.submissions = filtered;
            if (filtered.length === 0) parsed.status = 'unverified';
            localStorage.setItem(nidKey, JSON.stringify(parsed));
            setNidData(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Cleanup error:', e);
    }
  }, [user?.uid]);

  // Leaderboard state
  const [topMembers, setTopMembers] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('loyaltyPoints', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const members = querySnapshot.docs.map(doc => doc.data());
        setTopMembers(members);
      } catch (err) {
        console.warn('Error fetching leaderboard:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, [loyaltyPoints]); // Re-fetch when current user points change to show updated rank

  const getAchievements = (points: number = 0) => {
    if (points >= 5000) return [t('এলিট মেম্বার', 'Elite Tier'), t('৫০+ বুকিং সম্পন্ন', '50+ Bookings'), t('সেরা ১% গ্রাহক', 'Top 1% Member')];
    if (points >= 2000) return [t('প্লাটিনাম মেম্বার', 'Platinum Tier'), t('২৫+ বুকিং সম্পন্ন', '25+ Bookings'), t('নির্ভরযোগ্য ক্রেতা', 'Reliable Buyer')];
    if (points >= 1000) return [t('গোল্ড মেম্বার', 'Gold Tier'), t('১০+ বুকিং সম্পন্ন', '10+ Bookings'), t('সক্রিয় গ্রাহক', 'Active User')];
    return [t('সিলভার মেম্বার', 'Silver Tier'), t('কমিউনিটি মেম্বার', 'Community Member')];
  };

  // Sync totalSpent from user_unified_orders changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedOrders = localStorage.getItem('user_unified_orders');
        if (savedOrders) {
          const orders = JSON.parse(savedOrders);
          if (Array.isArray(orders)) {
            const newTotal = orders
              .filter((o: any) => o.status === 'completed' || o.status === 'delivered')
              .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
            setTotalSpent(newTotal);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also poll slightly if needed, or just rely on storage event and manual updates
    const interval = setInterval(handleStorageChange, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Sync transactions to localStorage
  useEffect(() => {
    localStorage.setItem('user_wallet_history', JSON.stringify(transactions));
  }, [transactions]);

  // Toast Notification
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // NID Verification State Persistence
  const nidStorageKey = `nid_verification_${user?.uid || 'default'}`;
  const [nidData, setNidData] = useState<NIDVerificationData>(() => {
    try {
      const saved = localStorage.getItem(nidStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out demo submissions
        if (parsed.submissions && Array.isArray(parsed.submissions)) {
          const demoNidIds = ['NID-SUB-20261028-01'];
          parsed.submissions = parsed.submissions.filter((s: any) => !demoNidIds.includes(s.id));
          if (parsed.submissions.length === 0 && (parsed.status === 'rejected' || parsed.status === 'verified')) {
             // If only demo submissions existed, reset status
             parsed.status = 'unverified';
          }
        }
        if (!parsed.submissions || !Array.isArray(parsed.submissions) || parsed.submissions.length === 0) {
          parsed.submissions = INITIAL_NID_SUBMISSIONS;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      status: 'unverified',
      nidNumber: '',
      fullName: user?.displayName || '',
      frontPhoto: null,
      backPhoto: null,
      submissions: INITIAL_NID_SUBMISSIONS,
    };
  });

  const [nidFullNameInput, setNidFullNameInput] = useState(nidData.fullName || user?.displayName || '');
  const [nidNumberInput, setNidNumberInput] = useState(nidData.nidNumber || '');
  const [frontPhotoInput, setFrontPhotoInput] = useState<string | null>(nidData.frontPhoto || null);
  const [backPhotoInput, setBackPhotoInput] = useState<string | null>(nidData.backPhoto || null);
  const [nidError, setNidError] = useState('');
  const [isSubmittingNid, setIsSubmittingNid] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string } | null>(null);

  // Sync NID Data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(nidStorageKey, JSON.stringify(nidData));
    } catch (e) {
      console.error(e);
    }
  }, [nidData, nidStorageKey]);

  // Fetch NID Data from Firestore if user logged in
  useEffect(() => {
    if (!user?.uid) return;
    const fetchNidDoc = async () => {
      try {
        const docRef = doc(db, 'nid_verifications', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as NIDVerificationData;
          if (!data.submissions || !Array.isArray(data.submissions) || data.submissions.length === 0) {
            data.submissions = INITIAL_NID_SUBMISSIONS;
          }
          setNidData(data);
          setNidFullNameInput(data.fullName || '');
          setNidNumberInput(data.nidNumber || '');
          setFrontPhotoInput(data.frontPhoto || null);
          setBackPhotoInput(data.backPhoto || null);
        }
      } catch (err) {
        console.warn('Firestore fetch notice:', err);
      }
    };
    fetchNidDoc();
  }, [user?.uid]);

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNidError(t('ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে', 'File size must be max 5MB'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (side === 'front') {
        setFrontPhotoInput(result);
      } else {
        setBackPhotoInput(result);
      }
      setNidError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Sample Photo shortcut
  const handleUseSamplePhotos = () => {
    setFrontPhotoInput(SAMPLE_NID_FRONT);
    setBackPhotoInput(SAMPLE_NID_BACK);
    if (!nidNumberInput) {
      setNidNumberInput('19952691482003891');
    }
    if (!nidFullNameInput) {
      setNidFullNameInput(user?.displayName || 'মোঃ মাসুদ রানা');
    }
    setNidError('');
    showNotification(t('স্যাম্পল এনআইডি ছবি লোড করা হয়েছে!', 'Sample NID photos loaded!'));
  };

  // Submit NID Verification Form
  const handleSubmitNid = async (e: React.FormEvent) => {
    e.preventDefault();
    setNidError('');

    if (!nidFullNameInput.trim()) {
      setNidError(t('আপনার পূর্ণ নাম প্রদান করুন', 'Please enter full name'));
      return;
    }
    if (!nidNumberInput.trim() || nidNumberInput.trim().length < 10) {
      setNidError(t('সঠিক ১০ বা ১৭ ডিজিটের NID নম্বর দিন', 'Enter valid 10 or 17 digit NID number'));
      return;
    }
    if (!frontPhotoInput) {
      setNidError(t('NID এর সামনের পাতার ছবি আপলোড করুন', 'Upload NID front photo'));
      return;
    }
    if (!backPhotoInput) {
      setNidError(t('NID এর পেছনের পাতার ছবি আপলোড করুন', 'Upload NID back photo'));
      return;
    }

    setIsSubmittingNid(true);

    const submissionTime = new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const newAttempt: NIDSubmissionRecord = {
      id: `NID-SUB-${Date.now().toString().slice(-6)}`,
      submittedAt: submissionTime,
      status: 'pending',
      nidNumber: nidNumberInput.trim(),
      fullName: nidFullNameInput.trim(),
      frontPhoto: frontPhotoInput,
      backPhoto: backPhotoInput,
    };

    const currentSubmissions = nidData.submissions || INITIAL_NID_SUBMISSIONS;
    const updatedSubmissions = [newAttempt, ...currentSubmissions];

    const newNidRecord: NIDVerificationData = {
      status: 'pending',
      nidNumber: nidNumberInput.trim(),
      fullName: nidFullNameInput.trim(),
      frontPhoto: frontPhotoInput,
      backPhoto: backPhotoInput,
      submittedAt: submissionTime,
      submissions: updatedSubmissions,
    };

    setNidData(newNidRecord);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'nid_verifications', user.uid), newNidRecord);
      } catch (err) {
        console.warn('Firestore write notice:', err);
      }
    }

    setIsSubmittingNid(false);
    showNotification(t('এনআইডি ভেরিফিকেশন আবেদন জমা হয়েছে! বর্তমান স্ট্যাটাস: অপেক্ষমাণ (Pending)', 'NID Verification submitted! Status: Pending'));
  };

  // Toggle/Set Demo NID status (pending / verified / rejected / unverified)
  const handleDemoSetStatus = async (status: 'pending' | 'verified' | 'rejected' | 'unverified') => {
    const timeNow = new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
    let existingSubmissions = [...(nidData.submissions || INITIAL_NID_SUBMISSIONS)];

    if (status === 'verified') {
      if (existingSubmissions.length > 0) {
        existingSubmissions[0] = {
          ...existingSubmissions[0],
          status: 'verified',
          verifiedAt: timeNow,
        };
      } else {
        existingSubmissions.unshift({
          id: `NID-SUB-${Date.now().toString().slice(-6)}`,
          submittedAt: timeNow,
          status: 'verified',
          nidNumber: nidData.nidNumber || '19952691482003891',
          fullName: nidData.fullName || user?.displayName || 'মোঃ মাসুদ রানা',
          frontPhoto: nidData.frontPhoto || SAMPLE_NID_FRONT,
          backPhoto: nidData.backPhoto || SAMPLE_NID_BACK,
          verifiedAt: timeNow,
        });
      }
    } else if (status === 'rejected') {
      if (existingSubmissions.length > 0) {
        existingSubmissions[0] = {
          ...existingSubmissions[0],
          status: 'rejected',
          rejectionReason: t('যাচাইকালে ছবির মান অস্পষ্ট পাওয়া গেছে, অনুগ্রহ করে স্পষ্ট ছবি আপলোড করুন।', 'Image quality was unclear, please upload clear photos.'),
        };
      } else {
        existingSubmissions.unshift({
          id: `NID-SUB-${Date.now().toString().slice(-6)}`,
          submittedAt: timeNow,
          status: 'rejected',
          nidNumber: nidData.nidNumber || '19952691482003891',
          fullName: nidData.fullName || user?.displayName || 'মোঃ মাসুদ রানা',
          frontPhoto: nidData.frontPhoto || SAMPLE_NID_FRONT,
          backPhoto: nidData.backPhoto || SAMPLE_NID_BACK,
          rejectionReason: t('যাচাইকালে ছবির মান অস্পষ্ট পাওয়া গেছে, অনুগ্রহ করে স্পষ্ট ছবি আপলোড করুন।', 'Image quality was unclear, please upload clear photos.'),
        });
      }
    } else if (status === 'pending') {
      if (existingSubmissions.length > 0) {
        existingSubmissions[0] = {
          ...existingSubmissions[0],
          status: 'pending',
        };
      }
    }

    const updated: NIDVerificationData = {
      ...nidData,
      status,
      verifiedAt: status === 'verified' ? timeNow : undefined,
      rejectionReason: status === 'rejected' ? t('যাচাইকালে ছবির মান অস্পষ্ট পাওয়া গেছে', 'Image quality unclear') : undefined,
      submissions: existingSubmissions,
    };

    setNidData(updated);
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'nid_verifications', user.uid), updated);
      } catch (err) {
        console.warn('Firestore write notice:', err);
      }
    }
    showNotification(
      status === 'verified'
        ? t('এনআইডি স্ট্যাটাস "ভেরিফাইড" করা হয়েছে!', 'NID status set to Verified!')
        : status === 'pending'
        ? t('এনআইডি স্ট্যাটাস "অপেক্ষমাণ" করা হয়েছে!', 'NID status set to Pending!')
        : status === 'rejected'
        ? t('এনআইডি স্ট্যাটাস "প্রত্যাখ্যাত" করা হয়েছে!', 'NID status set to Rejected!')
        : t('এনআইডি তথ্য রিসেট করা হয়েছে', 'NID data reset')
    );
  };

  // Add Money / Recharge Logic
  const handleRecharge = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    const newBal = walletBalance + amount;
    setWalletBalance(newBal);

    const newTxn: Transaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      title: 'Wallet Recharge (টাকা যোগ)',
      date: 'Just now',
      amount: amount,
      type: 'credit',
      serviceCategory: 'Recharge',
      platformCommission: 0,
      providerEarnings: amount,
      commissionRate: 0
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setIsAddMoneyModalOpen(false);
    showNotification(`৳${amount} সফলভাবে ওয়ালেটে যোগ হয়েছে!`);
  };

  // User Profile details
  const userName = user?.displayName || 'Customer';
  const userPhone = 'Not Provided';
  const userEmail = user?.email || '';

  return (
    <div className="space-y-4 text-gray-900">
      {/* User Information Header */}
      <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-100">
        <div className="w-13 h-13 rounded-full bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center border-2 border-white shadow-sm shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden flex-1">
          <h4 className="font-extrabold text-gray-900 text-base leading-tight truncate">
            {userName}
          </h4>
          <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>{userPhone}</span>
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
              ✓ ভেরিফাইড মেম্বার
            </span>

            {/* NID Status Pill in User Header */}
            {nidData.status === 'verified' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>NID ভেরিফাইড</span>
              </span>
            ) : nidData.status === 'pending' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>NID অপেক্ষমাণ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                <ShieldAlert className="w-3 h-3 text-gray-500" />
                <span>NID অপরীক্ষিত</span>
              </span>
            )}

            <span className="text-[11px] text-gray-500 truncate">
              {userEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Loyalty Points Section */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm leading-tight">
                {t('লয়্যালটি পয়েন্ট (Loyalty Points)', 'Loyalty Points')}
              </h4>
              <p className="text-[10px] font-bold text-indigo-700">
                {t('প্রতি ১০০ টাকায় ১০ পয়েন্ট', '10 points per ৳100 spent')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-indigo-900 font-mono">
              {language === 'en' ? loyaltyPoints : loyaltyPoints.toLocaleString('bn-BD')}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 ml-1 uppercase">Points</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">
              {t('পরবর্তী ডিসকাউন্ট কুপন', 'Next Discount Coupon')}
            </span>
            <span className="text-indigo-700">
              {language === 'en' ? pointsRemaining : pointsRemaining.toLocaleString('bn-BD')} {t('পয়েন্ট বাকি', 'points left')}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-100">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.4)]"
              style={{ width: `${progressToNextCoupon}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-400 font-medium text-center">
            {t('৫০০ পয়েন্টে পাবেন ৳৫০ ডিসকাউন্ট কুপন!', 'Earn 500 points to get a ৳50 discount coupon!')}
          </p>
        </div>
      </div>

      {/* Top Loyalty Members Leaderboard */}
      <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Gift className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="font-extrabold text-gray-900 text-sm">
            {t('সেরা লয়্যালটি মেম্বার (Leaderboard)', 'Top Loyalty Members')}
          </h4>
        </div>

        <div className="space-y-2">
          {loadingLeaderboard && topMembers.length === 0 ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-full bg-gray-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : topMembers.length > 0 ? (
            topMembers.map((member, index) => (
              <div 
                key={member.uid} 
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default group relative ${
                  member.uid === user?.uid 
                    ? 'bg-indigo-50 border-indigo-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    index === 0 ? 'bg-amber-400 text-amber-950' :
                    index === 1 ? 'bg-slate-300 text-slate-800' :
                    index === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-white">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <span className={`text-xs font-bold truncate max-w-[120px] ${
                    member.uid === user?.uid ? 'text-indigo-900' : 'text-gray-700'
                  }`}>
                    {member.displayName}
                    {member.uid === user?.uid && (
                      <span className="ml-1.5 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full uppercase">You</span>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-700 font-mono">
                    {language === 'en' ? member.loyaltyPoints : member.loyaltyPoints.toLocaleString('bn-BD')}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 ml-1 uppercase">Pts</span>
                </div>

                {/* Achievements Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 group-hover:opacity-100 z-50 w-48 pointer-events-none transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2.5 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-800 relative">
                    <div className="font-bold text-[10px] border-b border-white/10 pb-1.5 mb-1.5 flex items-center gap-1.5 text-amber-400">
                      <Sparkles className="w-3 h-3" />
                      {t('অর্জনসমূহ (Achievements)', 'Achievements')}
                    </div>
                    <ul className="space-y-1">
                      {getAchievements(member.loyaltyPoints).map((ach, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[9px] font-medium leading-tight">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {ach}
                        </li>
                      ))}
                    </ul>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-[6px] border-transparent border-b-gray-900" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-gray-400 py-2">
              {t('কোনো মেম্বার পাওয়া যায়নি', 'No members found yet')}
            </p>
          )}
        </div>
        
        <p className="text-[9px] text-center text-gray-400 font-medium pt-1">
          {t('সেরা মেম্বারদের জন্য রয়েছে আকর্ষণীয় গিফট কুপন!', 'Top members get exclusive gift coupons!')}
        </p>
      </div>

      {/* SELLER HUB & MY ORDERS QUICK ACCESS CARDS INSIDE PROFILE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Seller & Service Provider Hub */}
        {onOpenSellerHub && (
          <div 
            onClick={() => {
              if (onClose) onClose();
              onOpenSellerHub();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-900 text-white shadow-md border border-emerald-600/50 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-600/40">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-300" />
                {t('বিক্রেতা ও সার্ভিসপ্রোভাইডার হাব', 'Seller & Provider Hub')}
              </span>
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs group-hover:bg-amber-300">
                {t('হাব খুলুন ➔', 'Open Hub ➔')}
              </span>
            </div>
            <p className="text-xs font-bold text-white mt-2 leading-snug">
              {t('কাজ গ্রহণ করুন, নতুন সার্ভিস পোস্ট করুন ও পণ্য কেনাবেচা করুন', 'Accept Orders, Post Services & Sell Products')}
            </p>
          </div>
        )}

        {/* 2. My Orders & Booking Tracker */}
        <div 
          onClick={() => {
            if (onClose) onClose();
            if (onOpenOrders) onOpenOrders();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md border border-blue-700/50 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-blue-700/40">
            <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5 text-blue-300" />
              {t('আমার অর্ডার ও ট্র্যাক', 'My Orders & Track')}
            </span>
            <span className="bg-blue-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs group-hover:bg-blue-300">
              {t('অর্ডার দেখুন ➔', 'View Orders ➔')}
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2 leading-snug">
            {t('আপনার সকল সার্ভিস বুকিং ও লাইভ ডেলিভারি স্ট্যাটাস দেখুন', 'View all your service bookings and live delivery tracking')}
          </p>
        </div>
      </div>

      {/* NID VERIFICATION SECTION */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/90 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                {t('জাতীয় পরিচয়পত্র (NID) ভেরিফিকেশন', 'NID Verification')}
              </h3>
              <p className="text-[11px] font-medium text-gray-500">
                {t('আপনার পরিচয় নিশ্চিত করুন ও নিরবচ্ছিন্ন সেবা উপভোগ করুন', 'Verify identity to unlock premium features')}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {nidData.status === 'verified' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t('ভেরিফাইড (Verified)', 'Verified')}</span>
            </span>
          ) : nidData.status === 'pending' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('অপেক্ষমাণ (Pending)', 'Pending')}</span>
            </span>
          ) : nidData.status === 'rejected' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('প্রত্যাখ্যাত', 'Rejected')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gray-200 text-gray-700">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
              <span>{t('অপরীক্ষিত', 'Unverified')}</span>
            </span>
          )}
        </div>

        {/* Content based on status */}
        {nidData.status === 'verified' ? (
          /* VERIFIED STATUS VIEW */
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-100" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span>{t('আপনার এনআইডি সফলভাবে ভেরিফাইড হয়েছে', 'Your NID is Verified')}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                    ✓ Verified Profile
                  </span>
                </h4>
                <p className="text-xs text-emerald-800">
                  {t('আপনার তথ্য সুরক্ষিত আছে। আপনি সার্ভিস বুকিং ও ডিল সম্পন্ন করার জন্য সম্পূর্ণ উপযুক্ত।', 'Your ID details are verified and secure.')}
                </p>
              </div>
            </div>

            {/* Verified Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200/80">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{t('এনআইডি নম্বর', 'NID Number')}</span>
                <span className="font-mono font-extrabold text-gray-900 text-sm">
                  {nidData.nidNumber ? `${nidData.nidNumber.slice(0, 4)}************${nidData.nidNumber.slice(-4)}` : '1995************3891'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200/80">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{t('এনআইডি অনুযায়ী নাম', 'NID Name')}</span>
                <span className="font-bold text-gray-900">{nidData.fullName || userName}</span>
              </div>
            </div>

            {/* Photos Preview Triggers */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {nidData.frontPhoto && (
                  <button
                    type="button"
                    onClick={() => setPreviewImageModal({ url: nidData.frontPhoto!, title: t('NID সামনের পাতা', 'NID Front Photo') })}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 rounded-lg text-[11px] font-bold border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('সামনের ছবি দেখুন', 'View Front')}</span>
                  </button>
                )}
                {nidData.backPhoto && (
                  <button
                    type="button"
                    onClick={() => setPreviewImageModal({ url: nidData.backPhoto!, title: t('NID পেছনের পাতা', 'NID Back Photo') })}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 rounded-lg text-[11px] font-bold border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('পেছনের ছবি দেখুন', 'View Back')}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDemoSetStatus('unverified')}
                className="text-[11px] text-emerald-700 hover:text-emerald-950 font-semibold underline cursor-pointer"
              >
                {t('পুনরায় তথ্য এডিট করুন', 'Re-submit NID')}
              </button>
            </div>
          </div>
        ) : nidData.status === 'pending' ? (
          /* PENDING STATUS VIEW */
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                <Clock className="w-5 h-5 text-amber-100" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-amber-950 text-sm">
                  {t('আপনার এনআইডি আবেদন পর্যালোচনার অধীন (Under Review)', 'NID Submission Under Review')}
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {t('আপনার জমাকৃত NID কার্ড এবং ছবি যাচাই করা হচ্ছে। সাধারণত ১২-২৪ ঘণ্টার মধ্যে এটি অনুমোদিত হয়।', 'Our admin team is verifying your NID documents.')}
                </p>
              </div>
            </div>

            {/* Submitted Info Preview */}
            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">{t('এনআইডি নম্বর:', 'NID Number:')}</span>
                <span className="font-mono font-bold text-gray-900">{nidData.nidNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">{t('এনআইডি নাম:', 'NID Name:')}</span>
                <span className="font-bold text-gray-900">{nidData.fullName}</span>
              </div>
              {nidData.submittedAt && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{t('জমাদানের সময়:', 'Submitted At:')}</span>
                  <span className="text-gray-600 font-mono">{nidData.submittedAt}</span>
                </div>
              )}
            </div>

            {/* Photos Preview Buttons */}
            {(nidData.frontPhoto || nidData.backPhoto) && (
              <div className="pt-1 flex items-center gap-2">
                {nidData.frontPhoto && (
                  <button
                    type="button"
                    onClick={() => setPreviewImageModal({ url: nidData.frontPhoto!, title: t('NID সামনের পাতা', 'NID Front Photo') })}
                    className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold border border-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('সামনের পাতা', 'Front')}</span>
                  </button>
                )}
                {nidData.backPhoto && (
                  <button
                    type="button"
                    onClick={() => setPreviewImageModal({ url: nidData.backPhoto!, title: t('NID পেছনের পাতা', 'NID Back Photo') })}
                    className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold border border-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('পেছনের পাতা', 'Back')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* UNVERIFIED / FORM SUBMISSION VIEW */
          <form onSubmit={handleSubmitNid} className="space-y-4">
            {nidError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{nidError}</span>
              </div>
            )}



            {/* Name & NID Number Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('এনআইডি কার্ড অনুযায়ী পূর্ণ নাম', 'Full Name on NID')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nidFullNameInput}
                  onChange={(e) => setNidFullNameInput(e.target.value)}
                  placeholder={t('যেমন: মোঃ মাসুদ রানা', 'e.g. Md Masud Rana')}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('এনআইডি (NID) নম্বর', 'NID Number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nidNumberInput}
                  onChange={(e) => setNidNumberInput(e.target.value)}
                  placeholder={t('১০ বা ১৭ ডিজিটের এনআইডি নম্বর', '10 or 17 digit NID number')}
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Front & Back Photo Upload Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front Photo Card */}
              <div className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl p-3 bg-gray-50/70 text-center transition-colors relative space-y-2">
                <span className="text-xs font-bold text-gray-800 block text-left">
                  {t('১. সামনের পাতার ছবি (Front Photo)', '1. Front Photo')} <span className="text-red-500">*</span>
                </span>

                {frontPhotoInput ? (
                  <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-white shadow-2xs group">
                    <img
                      src={frontPhotoInput}
                      alt="NID Front"
                      className="w-full h-28 object-contain bg-slate-900/5 p-1"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal({ url: frontPhotoInput, title: t('NID সামনের পাতা', 'NID Front Photo') })}
                        className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-emerald-50 text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrontPhotoInput(null)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3 px-2 rounded-lg bg-white border border-gray-200 hover:bg-emerald-50/50 transition-colors">
                    <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-emerald-800 block">
                      {t('ছবি নির্বাচন করুন', 'Upload Front Photo')}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">JPG, PNG (সর্বোচ্চ 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'front')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Back Photo Card */}
              <div className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl p-3 bg-gray-50/70 text-center transition-colors relative space-y-2">
                <span className="text-xs font-bold text-gray-800 block text-left">
                  {t('২. পেছনের পাতার ছবি (Back Photo)', '2. Back Photo')} <span className="text-red-500">*</span>
                </span>

                {backPhotoInput ? (
                  <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-white shadow-2xs group">
                    <img
                      src={backPhotoInput}
                      alt="NID Back"
                      className="w-full h-28 object-contain bg-slate-900/5 p-1"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal({ url: backPhotoInput, title: t('NID পেছনের পাতা', 'NID Back Photo') })}
                        className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-emerald-50 text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackPhotoInput(null)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3 px-2 rounded-lg bg-white border border-gray-200 hover:bg-emerald-50/50 transition-colors">
                    <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-emerald-800 block">
                      {t('ছবি নির্বাচন করুন', 'Upload Back Photo')}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">JPG, PNG (সর্বোচ্চ 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'back')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1 flex items-center justify-end">

              <button
                type="submit"
                disabled={isSubmittingNid}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-200" />
                <span>
                  {isSubmittingNid
                    ? t('জমাদান হচ্ছে...', 'Submitting...')
                    : t('ভেরিফিকেশনের জন্য জমা দিন', 'Submit NID Verification')}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* PREVIOUS NID SUBMISSION RECORDS SECTION */}
        <div className="mt-4 pt-4 border-t border-emerald-100/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                {t('পূর্ববর্তী এনআইডি সাবমিশন রেকর্ডস', 'Previous NID Submission Records')}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
              {nidData.submissions?.length || 0} {t('টি আবেদন', 'Attempts')}
            </span>
          </div>

          {/* Submissions List */}
          {(!nidData.submissions || nidData.submissions.length === 0) ? (
            <div className="p-3 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
              {t('এখনও কোনো এনআইডি সাবমিশন রেকর্ড পাওয়া যায়নি।', 'No previous NID submission records found.')}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {nidData.submissions.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className="p-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50/80 to-white hover:border-emerald-300 transition-all shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        {rec.id}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{rec.submittedAt}</span>
                      </span>
                    </div>

                    {/* Status badge */}
                    {rec.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                        <span>{t('ভেরিফাইড (Verified)', 'Verified')}</span>
                      </span>
                    ) : rec.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>{t('অপেক্ষমাণ (Pending)', 'Pending')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white shadow-2xs">
                        <AlertCircle className="w-3 h-3 text-red-200" />
                        <span>{t('প্রত্যাখ্যাত (Rejected)', 'Rejected')}</span>
                      </span>
                    )}
                  </div>

                  {/* Submission Attempt details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">{t('এনআইডি নাম:', 'NID Name:')}</span>
                      <span className="font-bold text-gray-800 text-[11px] truncate block">{rec.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">{t('NID নম্বর:', 'NID Number:')}</span>
                      <span className="font-mono font-bold text-gray-900 text-[11px]">
                        {rec.nidNumber ? `${rec.nidNumber.slice(0, 4)}************${rec.nidNumber.slice(-4)}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Rejection reason if applicable */}
                  {rec.status === 'rejected' && rec.rejectionReason && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-start gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-red-900">{t('প্রত্যাখ্যানের কারণ:', 'Reason for Rejection:')}</span>
                        <span>{rec.rejectionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* View submitted images for this record */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      {rec.frontPhoto && (
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal({ url: rec.frontPhoto!, title: `${t('NID সামনের পাতা', 'NID Front')} (${rec.id})` })}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded font-bold border border-emerald-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-700" />
                          <span>{t('সামনের পাতা', 'Front Image')}</span>
                        </button>
                      )}
                      {rec.backPhoto && (
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal({ url: rec.backPhoto!, title: `${t('NID পেছনের পাতা', 'NID Back')} (${rec.id})` })}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded font-bold border border-emerald-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-700" />
                          <span>{t('পেছনের পাতা', 'Back Image')}</span>
                        </button>
                      )}
                    </div>

                    {rec.verifiedAt && (
                      <span className="text-[10px] font-semibold text-emerald-700">
                        ✓ {t('অনুমোদিত:', 'Approved:')} {rec.verifiedAt}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX PREVIEW MODAL FOR NID PHOTOS */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>{previewImageModal.title}</span>
              </h4>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-gray-100 rounded-xl flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-h-[55vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewImageModal(null)}
                className="px-4 py-1.5 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-900 cursor-pointer"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 1 & 2: "My Wallet" Card with Wallet icon and 2 Values: Wallet Balance and Total Spent */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/90 shadow-xs relative overflow-hidden">
        {/* Background Accent Pill */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0f4d2a] text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base leading-tight">My Wallet</h3>
              <p className="text-[11px] font-medium text-emerald-800">অল সার্ভিস বিডি ওয়ালেট</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddMoneyModalOpen(true)}
            className="px-3 py-1.5 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>রিচার্জ</span>
          </button>
        </div>

        {/* 2 REQUIRED VALUES: Wallet Balance and Total Spent */}
        <div className="grid grid-cols-2 gap-3 pt-3.5">
          {/* Value 1: Wallet Balance */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Wallet Balance
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 font-mono tracking-tight">
              ৳{walletBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">ব্যবহারযোগ্য ব্যালেন্স</p>
          </div>

          {/* Value 2: Total Spent */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Total Spent
            </p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">
              ৳{totalSpent.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">সর্বমোট সেবা ব্যয়</p>
          </div>
        </div>

        {/* Commission split indicator info badge */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-100/50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="text-[11px] font-semibold">
              অটো কমিশন স্প্লিট: <strong>{commissionRate}% প্ল্যাটফর্ম / {100 - commissionRate}% সার্ভিস প্রোভাইডার</strong>
            </span>
          </div>
        </div>

        {/* History Modal trigger inside Wallet */}
        <div className="pt-3.5 flex items-center justify-between">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="w-full py-2.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Wallet &gt; লেনদেনের ইতিহাস দেখুন (History Modal)</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* REFERRAL SYSTEM CARD */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-600/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 font-black flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white leading-tight">রেফার করুন ও ৳১০০ বোনাস পান</h4>
              <p className="text-[10px] text-emerald-100 font-medium">রেফারেল কোড: <strong className="font-mono text-amber-300">{referralCode}</strong></p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onClose) onClose();
              if (onOpenReferralModal) onOpenReferralModal();
            }}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>কুপন দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-3 py-1.5 bg-emerald-950/60 border border-emerald-600/80 rounded-xl font-mono text-emerald-100 text-[11px] truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'কপি!' : 'লিংক কপি'}</span>
          </button>
        </div>
      </div>

      {/* LANGUAGE SETTING IN PROFILE */}
      <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">{t('অ্যাপের ভাষা সেটিং', 'App Language Setting')}</h4>
              <p className="text-[10px] text-gray-500">{t('ভাষা নির্বাচন করুন (Choose Language)', 'Select system display language')}</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold select-none">
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                language === 'bn'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <span>🇧🇩</span>
              <span className="text-[11px]">বাংলা</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <span>🇬🇧</span>
              <span className="text-[11px]">English</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Extra Actions */}
      <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 text-gray-600">
          <span>নিরাপত্তা স্ট্যাটাস:</span>
          <span className="font-bold text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> ১০০% সুরক্ষিত অ্যাকাউন্ট
          </span>
        </div>
        <div className="flex items-center justify-between py-1 text-gray-600 border-t border-gray-200/60 pt-2">
          <span>পেমেন্ট গেটওয়ে:</span>
          <span className="font-semibold text-gray-800">বিকাশ, নগদ, ডেবিট/ক্রেডিট কার্ড</span>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-1">
        <button
          onClick={async () => {
            if (logoutUser) await logoutUser();
            if (onClose) onClose();
          }}
          className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>অ্যাকাউন্ট থেকে লগআউট করুন</span>
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-[#0f4d2a] text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-300 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WALLET > HISTORY MODAL ONLY */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] shadow-2xl border border-emerald-100 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 bg-[#0f4d2a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-800 text-emerald-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Wallet &gt; Transaction History</h3>
                  <p className="text-[11px] text-emerald-200 font-medium">
                    অটো কমিশন স্প্লিট হিস্ট্রি (Commission Split Breakdown)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Formula Banner */}
            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs flex items-center justify-between">
              <span className="text-emerald-900 font-bold">
                কমিশন রুল: {commissionRate}% অল সার্ভিস বিডি • {100 - commissionRate}% প্রোভাইডার
              </span>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                অটো স্প্লিট সক্রিয়
              </span>
            </div>

            {/* Transaction List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-gray-200">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">এখনও কোনো লেনদেনের ইতিহাস নেই।</p>
                </div>
              ) : (
                transactions.map((txn) => {
                  const isDebit = txn.type === 'debit';
                  const effectiveCommission = isDebit ? (txn.amount * commissionRate) / 100 : 0;
                  const effectiveProvider = isDebit ? txn.amount - effectiveCommission : txn.amount;

                  return (
                    <div
                      key={txn.id}
                      className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors bg-white shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                              isDebit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-gray-900">{txn.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5 font-mono">
                              <span>{txn.id}</span>
                              <span>•</span>
                              <span>{txn.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-black font-mono text-sm block ${
                              isDebit ? 'text-gray-900' : 'text-emerald-700'
                            }`}
                          >
                            {isDebit ? '-' : '+'}৳{txn.amount.toLocaleString()}
                          </span>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 mt-0.5">
                            সফল
                          </span>
                        </div>
                      </div>

                      {/* COMMISSION AUTO SPLIT BREAKDOWN */}
                      {isDebit && (
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <span className="text-gray-500 font-medium block">
                              প্ল্যাটফর্ম ফি ({commissionRate}%):
                            </span>
                            <span className="font-mono font-bold text-emerald-800">
                              ৳{effectiveCommission.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-gray-500 font-medium block">
                              সার্ভিস প্রোভাইডার ({100 - commissionRate}%):
                            </span>
                            <span className="font-mono font-bold text-gray-800">
                              ৳{effectiveProvider.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">
                সর্বমোট লেনদেন: <strong>{transactions.length} টি</strong>
              </span>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MONEY / RECHARGE MODAL */}
      {isAddMoneyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-gray-900">ওয়ালেট রিচার্জ (Add Money)</h3>
              </div>
              <button
                onClick={() => setIsAddMoneyModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">টাকার পরিমাণ নির্বাচন করুন</label>
              <div className="grid grid-cols-3 gap-2">
                {['500', '1000', '2000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rechargeAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="অন্য পরিমাণ লিখুন"
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                বিকাশ (bKash) ও নগদ (Nagad) এর মাধ্যমে তাৎক্ষণিক ব্যালেন্স জমা হবে।
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsAddMoneyModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleRecharge(parseFloat(rechargeAmount) || 0)}
                className="flex-1 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                রিচার্জ নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
