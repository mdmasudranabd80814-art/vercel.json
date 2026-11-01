import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Users, 
  Sparkles, 
  Ticket, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Send,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getUserReferralCode, 
  getSavedUserCoupons, 
  CouponItem 
} from '../utils/referral';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingWithCoupon?: (code: string) => void;
  onOpenCartWithCoupon?: (code: string) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  onOpenBookingWithCoupon,
  onOpenCartWithCoupon,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);

  const referralCode = getUserReferralCode(user || {});
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://allservicebd.com';
  const referralLink = `${baseUrl}/?ref=${referralCode}`;

  useEffect(() => {
    if (isOpen) {
      // Load coupons
      const savedCoupons = getSavedUserCoupons();
      setCoupons(savedCoupons);

      // Load local history
      try {
        const savedHistory = localStorage.getItem('user_referral_history');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setHistory(parsed);
          setReferralCount(parsed.length);
        }
      } catch {
        // fallback
      }

      // Fetch Firestore referrals count for this referralCode
      if (referralCode) {
        const fetchRefs = async () => {
          try {
            const q = query(
              collection(db, 'referrals'),
              where('referrerCode', '==', referralCode)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setReferralCount(snapshot.size);
            }
          } catch (e) {
            console.warn('Could not fetch remote referrals:', e);
          }
        };
        fetchRefs();
      }
    }
  }, [isOpen, referralCode]);

  if (!isOpen) return null;

  const shareText = t(`🎉 অল সার্ভিস বিডি (All Service BD)-এ যুক্ত হন! এই লিংকে সাইন আপ করলেই পাবেন ৳১০০ ছাড়ে ডিসকাউন্ট কুপন code: ${referralLink}`, `🎉 Join All Service BD! Sign up with this link to get ৳100 discount coupon code: ${referralLink}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(t(`কুপন কোড '${code}' কপি করা হয়েছে!`, `Coupon code '${code}' copied!`));
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-emerald-100 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8"></div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                  {t('বন্ধুকে রেফার করুন ও ৳১০০ বোনাস পান', 'Refer Friends & Get ৳100 Bonus')}
                </h3>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  HOT OFFER
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {t('আপনার রেফারেল লিংক শেয়ার করে জিতে নিন ১০০০+ টাকার কুপন কোড', 'Share your referral link & win discount coupon codes')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Main Referral Link Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50/30 p-4 sm:p-5 rounded-2xl border border-emerald-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-700" />
                {t('আপনার ইউনিক রেফারেল লিংক', 'Your Unique Referral Link')}
              </span>
              <span className="text-[11px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                {t('কোড:', 'Code:')} {referralCode}
              </span>
            </div>

            {/* Input & Copy Button */}
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-emerald-300 rounded-xl font-mono text-emerald-950 font-semibold focus:outline-none shadow-inner truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('কপি হয়েছে!', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{t('লিংক কপি', 'Copy Link')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Social Share Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 mr-1">{t('দ্রুত শেয়ার:', 'Quick Share:')}</span>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareFacebook}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-gray-600" />
                <span>SMS / {t('মেসেজ', 'Message')}</span>
              </button>
            </div>
          </div>

          {/* Referral Stats Summary Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">{t('আমন্ত্রিত বন্ধু', 'Friends Invited')}</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                {referralCount}
              </span>
            </div>

            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-100 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">{t('অর্জিত কুপন', 'Earned Coupons')}</span>
              <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
                {coupons.length}
              </span>
            </div>

            <div className="bg-teal-50/80 p-3 rounded-2xl border border-teal-100 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">{t('মোট সাশ্রয়', 'Total Savings')}</span>
              <span className="text-xl sm:text-2xl font-black text-teal-800 font-mono">
                ৳{referralCount * 100 + 200}
              </span>
            </div>
          </div>

          {/* How Referral Works Steps */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t('রেফারেল বোনাস কিভাবে পাবেন? (৩ টি সহজ ধাপ)', 'How to get Referral Bonus? (3 Easy Steps)')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-center sm:text-left">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-black flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                  1
                </div>
                <h5 className="font-bold text-xs text-gray-900">{t('১. লিংক পাঠান', '1. Send Link')}</h5>
                <p className="text-[11px] text-gray-600 leading-tight">
                  {t('আপনার রেফারেল লিংক বন্ধুদের হোয়াটসঅ্যাপ, মেসেঞ্জারে পাঠান।', 'Share your referral link on WhatsApp or Messenger.')}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-center sm:text-left">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-black flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                  2
                </div>
                <h5 className="font-bold text-xs text-gray-900">{t('২. বন্ধু সাইন-আপ করবে', '2. Friend Signs Up')}</h5>
                <p className="text-[11px] text-gray-600 leading-tight">
                  {t('বন্ধু আপনার লিংকে ক্লিক করে নতুন একাউন্ট রেজিস্টার করবে।', 'Friend clicks link and creates a new account.')}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5 text-center sm:text-left">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-emerald-950 text-xs font-black flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                  3
                </div>
                <h5 className="font-bold text-xs text-emerald-950">{t('৩. উভয়েই পাবেন ৳১০০', '3. Both Get ৳100')}</h5>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  {t('বন্ধু পাবেন ৳১০০ ডিসকাউন্ট এবং আপনি পাবেন ৳১০০ ছাড়ে রিওয়ার্ড কুপন!', 'Friend gets ৳100 discount & you get ৳100 reward coupon!')}
                </p>
              </div>
            </div>
          </div>

          {/* Active Referral Coupons Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-600" />
                {t('আপনার সক্রিয় ডিসকাউন্ট কুপন সমূহ', 'Your Active Discount Coupons')} ({coupons.length})
              </h4>
            </div>

            <div className="space-y-2">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs sm:text-sm text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                          {t('সক্রিয়', 'Active')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 truncate mt-0.5">
                        {coupon.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyCouponCode(coupon.code)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('কপি', 'Copy')}
                    </button>
                    {onOpenBookingWithCoupon && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenBookingWithCoupon(coupon.code);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span>{t('বুকিং করুন', 'Book Now')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral History */}
          {history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700">{t('রেফারেল হিস্ট্রি', 'Referral History')}</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                {history.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-800 block truncate max-w-[180px]">{item.friendEmail}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{item.reward}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">
            {t('রেফারেল সংক্রান্ত সহায়তায় কল করুন:', 'Call for referral support:')} <strong className="text-emerald-800">০৯৬১২-০০০০০০</strong>
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

