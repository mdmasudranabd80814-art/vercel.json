import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, Chrome, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from './UserProfile';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider, auth } from '../firebase';
import { processReferralOnSignup } from '../utils/referral';
import { useLanguage } from '../context/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReferralModal?: () => void;
  onOpenSellerHub?: () => void;
  onOpenOrders?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenReferralModal, onOpenSellerHub, onOpenOrders }) => {
  const { user, loginWithEmail, registerWithEmail, loginAnonymously } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        const refRes = await processReferralOnSignup({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
        });
        if (refRes.success && refRes.message) {
          setSuccessMsg(refRes.message);
        } else {
          setSuccessMsg(t('Google লগইন সফল হয়েছে!', 'Google Login Successful!'));
        }
      }
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(t('Google লগইন ব্যর্থ হয়েছে।', 'Google Login Failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg(t('লগইন সফল হয়েছে!', 'Login Successful!'));
        setTimeout(() => onClose(), 1000);
      } else {
        if (!name.trim()) { setError(t('আপনার নাম প্রদান করুন', 'Please enter your name')); setSubmitting(false); return; }
        await registerWithEmail(name, email, password);
        if (auth.currentUser) {
          const refRes = await processReferralOnSignup({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: name,
          });
          if (refRes.success && refRes.message) {
            setSuccessMsg(refRes.message);
          } else {
            setSuccessMsg(t('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', 'Account Created Successfully!'));
          }
        } else {
          setSuccessMsg(t('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', 'Account Created Successfully!'));
        }
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setError(err.message || t('ত্রুটি ঘটেছে।', 'An error occurred.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-emerald-50/70">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-gray-900 text-base">{user ? t('প্রোফাইল', 'Profile') : t('লগইন বা রেজিস্টার', 'Login or Register')}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {user ? (
            <UserProfile onClose={onClose} onOpenReferralModal={onOpenReferralModal} onOpenSellerHub={onOpenSellerHub} onOpenOrders={onOpenOrders} />
          ) : (
            <div className="space-y-4">
              <button onClick={handleGoogleLogin} disabled={submitting} className="w-full py-3 px-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
                <Chrome className="w-5 h-5 text-blue-500" />
                {t('Google দিয়ে লগইন করুন', 'Sign in with Google')}
              </button>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('অথবা ইমেইল ব্যবহার করুন', 'Or Use Email')}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button type="button" onClick={() => setMode('login')} className={`flex-1 py-1.5 rounded-lg cursor-pointer ${mode === 'login' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'}`}>{t('লগইন', 'Login')}</button>
                <button type="button" onClick={() => setMode('register')} className={`flex-1 py-1.5 rounded-lg cursor-pointer ${mode === 'register' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'}`}>{t('রেজিস্টার', 'Register')}</button>
              </div>

              {error && <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
              {successMsg && <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />{successMsg}</div>}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t('পূর্ণ নাম', 'Full Name')}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('আপনার নাম লিখুন', 'Enter your name')} className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-emerald-500 outline-none" required={mode === 'register'} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('ইমেইল ঠিকানা', 'Email Address')}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-sans" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('পাসওয়ার্ড', 'Password')}</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-sans" required />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer">
                  {submitting ? t('প্রসেস হচ্ছে...', 'Processing...') : mode === 'login' ? t('লগইন করুন', 'Login') : t('অ্যাকাউন্ট খুলুন', 'Create Account')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

