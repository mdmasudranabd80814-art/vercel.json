import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export interface ReferralRecord {
  referralId: string;
  referrerCode: string;
  refereeUid: string;
  refereeEmail: string;
  rewardCouponReferrer: string;
  rewardCouponReferee: string;
  status: 'rewarded';
  createdAt: any;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrder: number;
  active: boolean;
  description: string;
  ownerUid?: string;
  createdAt?: string;
}

const PENDING_REF_KEY = 'pending_referral_code';
const USER_REF_COUPONS_KEY = 'user_referral_coupons';

export const getPendingReferralCode = (): string | null => {
  try {
    return localStorage.getItem(PENDING_REF_KEY);
  } catch {
    return null;
  }
};

export const setPendingReferralCode = (code: string) => {
  try {
    if (code && code.trim()) {
      localStorage.setItem(PENDING_REF_KEY, code.trim().toUpperCase());
    }
  } catch (e) {
    console.error('Failed to set pending referral code', e);
  }
};

export const clearPendingReferralCode = () => {
  try {
    localStorage.removeItem(PENDING_REF_KEY);
  } catch {
    // ignore
  }
};

/**
 * Generate a unique referral code for a user based on name or UID
 */
export const getUserReferralCode = (user: { uid?: string; email?: string | null; displayName?: string | null }): string => {
  if (!user || (!user.uid && !user.email)) return 'REF-BD100';
  const prefix = (user.displayName || user.email || 'USER')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase() || 'BD';
  const suffix = (user.uid || '123456').substring(0, 4).toUpperCase();
  return `REF-${prefix}${suffix}`;
};

/**
 * Get saved user referral coupons from local storage or Firestore
 */
export const getSavedUserCoupons = (): CouponItem[] => {
  try {
    const saved = localStorage.getItem(USER_REF_COUPONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return [
    {
      id: 'ALL20',
      code: 'ALL20',
      discountType: 'percent',
      discountValue: 20,
      minOrder: 0,
      active: true,
      description: '২০% প্রথম বুকিং / অর্ডার ডিসকাউন্ট কুপন',
    }
  ];
};

export const saveUserCoupon = (coupon: CouponItem) => {
  try {
    const current = getSavedUserCoupons();
    if (!current.some((c) => c.code === coupon.code)) {
      const updated = [coupon, ...current];
      localStorage.setItem(USER_REF_COUPONS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save user coupon locally', e);
  }
};

/**
 * Process referral reward when a user signs up with a pending referral code
 */
export const processReferralOnSignup = async (user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<{ success: boolean; refereeCoupon?: string; referrerCoupon?: string; message?: string }> => {
  const pendingCode = getPendingReferralCode();
  if (!pendingCode) {
    return { success: false };
  }

  // Prevent self referral
  const selfCode = getUserReferralCode(user);
  if (pendingCode.toUpperCase() === selfCode.toUpperCase()) {
    clearPendingReferralCode();
    return { success: false, message: 'নিজের রেফারেল লিংকে সাইন আপ প্রযোজ্য নয়।' };
  }

  try {
    const refereeCouponCode = `REF-NEW-${Math.floor(10000 + Math.random() * 90000)}`;
    const referrerCouponCode = `REF-EARN-${Math.floor(10000 + Math.random() * 90000)}`;

    const refereeCoupon: CouponItem = {
      id: refereeCouponCode,
      code: refereeCouponCode,
      discountType: 'flat',
      discountValue: 100, // ৳100 Tk discount for new user
      minOrder: 0,
      active: true,
      description: `রেফারেল সাইন-আপ ওয়েলকাম বোনাস (৳১০০ ছাড়)`,
      ownerUid: user.uid,
    };

    const referrerCoupon: CouponItem = {
      id: referrerCouponCode,
      code: referrerCouponCode,
      discountType: 'flat',
      discountValue: 100, // ৳100 Tk discount for referrer
      minOrder: 0,
      active: true,
      description: `বন্ধুকে সফলভাবে রেফার করার বোনাস (৳১০০ ছাড়)`,
      ownerUid: pendingCode,
    };

    // Save referee coupon locally for immediate access
    saveUserCoupon(refereeCoupon);

    // Save coupons to Firestore 'coupons' collection
    try {
      await setDoc(doc(db, 'coupons', refereeCouponCode), refereeCoupon);
      await setDoc(doc(db, 'coupons', referrerCouponCode), referrerCoupon);
    } catch (e) {
      console.warn('Firestore coupon write warning:', e);
    }

    // Record referral in Firestore 'referrals' collection
    const refRecordId = `REF-REC-${Date.now()}`;
    const referralData = {
      referralId: refRecordId,
      referrerCode: pendingCode,
      refereeUid: user.uid,
      refereeEmail: user.email || 'user@example.com',
      rewardCouponReferrer: referrerCouponCode,
      rewardCouponReferee: refereeCouponCode,
      status: 'rewarded',
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'referrals', refRecordId), referralData);
    } catch (e) {
      console.warn('Firestore referral record write warning:', e);
    }

    // Save to local referral history
    try {
      const savedRefs = localStorage.getItem('user_referral_history');
      const existingRefs = savedRefs ? JSON.parse(savedRefs) : [];
      localStorage.setItem(
        'user_referral_history',
        JSON.stringify([
          {
            id: refRecordId,
            friendEmail: user.email || 'নতুন মেম্বার',
            referrerCode: pendingCode,
            date: new Date().toLocaleDateString('bn-BD'),
            reward: '৳১০০ কুপন',
          },
          ...existingRefs,
        ])
      );
    } catch {
      // ignore
    }

    clearPendingReferralCode();

    return {
      success: true,
      refereeCoupon: refereeCouponCode,
      referrerCoupon: referrerCouponCode,
      message: `🎉 অভিনন্দন! রেফারেল কোড '${pendingCode}' ব্যবহার করায় আপনাকে ৳১০০ ছাড়ে ডিসকাউন্ট কুপন (${refereeCouponCode}) প্রদান করা হলো!`,
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    clearPendingReferralCode();
    return { success: false, message: 'রেফারেল প্রসেসিং এ ত্রুটি হয়েছে।' };
  }
};
