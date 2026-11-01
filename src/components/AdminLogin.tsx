import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Home
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (adminEmail?: string) => void;
  onGoHome?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onGoHome }) => {
  const [email, setEmail] = useState('admin@allservicebd.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'set_new_pass'>('login');
  const [copiedLink, setCopiedLink] = useState(false);

  // Set New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const officialTerminalUrl = 'https://all-service-bd-1.vercel.app/admin';

  // Wipe any obsolete old passwords from storage
  useEffect(() => {
    const legacyOldPasswords = ['Admin@123', 'Admin@2024', 'superadmin123', 'admin123'];
    const saved = localStorage.getItem('adminCustomPassword');
    if (saved && legacyOldPasswords.includes(saved)) {
      localStorage.removeItem('adminCustomPassword');
      localStorage.removeItem('adminPass');
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(officialTerminalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Standard Login Handler
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validEmails = ['admin@allservicebd.com', 'mdmasudranabd80814@gmail.com'];
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Default password is Admin@2027
    const defaultPass = 'Admin@2027';
    const customPass = localStorage.getItem('adminCustomPassword');

    const validPasswords = [defaultPass];
    if (customPass && customPass.trim().length >= 4) {
      validPasswords.push(customPass.trim());
    }

    if (validEmails.includes(trimmedEmail) && validPasswords.includes(trimmedPass)) {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', trimmedEmail);
      setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        onLoginSuccess(trimmedEmail);
      }, 300);
    } else {
      if (!validEmails.includes(trimmedEmail)) {
        setError('এডমিন ইমেইল সঠিক নয়! সঠিক ইমেইল: admin@allservicebd.com');
      } else {
        setError('পাসওয়ার্ড সঠিক নয়! বর্তমান পাসওয়ার্ড: Admin@2027 অথবা নিচের "১-ক্লিকে সরাসরি প্রবেশ" বা "নতুন পাসওয়ার্ড সেট" ব্যবহার করুন।');
      }
    }
  };

  // 1-Click Master Direct Access (Guarantees user is never locked out)
  const handleDirectMasterAccess = () => {
    setError('');
    const masterEmail = 'admin@allservicebd.com';
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminEmail', masterEmail);
    setSuccessMsg('মাস্টার কি ভেরিফাইড! সরাসরি এডমিন ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
    setTimeout(() => {
      onLoginSuccess(masterEmail);
    }, 200);
  };

  // Direct Set New Password
  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validEmails = ['admin@allservicebd.com', 'mdmasudranabd80814@gmail.com'];
    const trimmedEmail = email.trim().toLowerCase();

    if (!validEmails.includes(trimmedEmail)) {
      setError('সঠিক এডমিন ইমেইল দিন (admin@allservicebd.com)');
      return;
    }

    if (newPassword.trim().length < 4) {
      setError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    const savedPass = newPassword.trim();
    localStorage.setItem('adminCustomPassword', savedPass);
    localStorage.setItem('adminPass', savedPass);
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminEmail', trimmedEmail);

    setSuccessMsg(`পাসওয়ার্ড সফলভাবে "${savedPass}" সেট করা হয়েছে এবং লগইন সম্পন্ন হয়েছে!`);
    setTimeout(() => {
      onLoginSuccess(trimmedEmail);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      {/* Official Terminal Link Banner */}
      <div className="w-full max-w-md mb-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">টার্মিনাল লিংক</p>
            <p className="text-xs font-mono font-medium truncate text-white/90">{officialTerminalUrl}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
          title="লিংক কপি করুন"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100">
        
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner border border-white/20">
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">ALL SERVICE BD</h1>
          <p className="text-emerald-200 text-xs font-semibold mt-0.5">নতুন সুপার এডমিন প্যানেল</p>

          {/* Tab Switcher */}
          <div className="mt-4 flex rounded-xl bg-black/25 p-1 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              এডমিন লগইন
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('set_new_pass'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'set_new_pass' ? 'bg-amber-400 text-emerald-950 shadow-sm font-extrabold' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>নতুন পাসওয়ার্ড সেট</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 text-center font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl mb-4 text-center font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                  এডমিন ইমেইল
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@allservicebd.com" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    পাসওয়ার্ড
                  </label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('set_new_pass'); setError(''); }}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin@2027" 
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title={showPassword ? 'লুকান' : 'দেখুন'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>এডমিন প্যানেলে লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 1-Click Master Access Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDirectMasterAccess}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-amber-500/40"
                  title="কোন পাসওয়ার্ড টাইপ না করেই এক ক্লিকে সরাসরি এডমিন ড্যাশবোর্ডে প্রবেশ করুন"
                >
                  <Zap className="w-4 h-4 text-emerald-900 fill-emerald-900" />
                  <span>⚡ ১-ক্লিকে সরাসরি এডমিন প্রবেশ (Instant Master Access)</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-1">পাসওয়ার্ড টাইপ করতে সমস্যা হলে উপরের হলুদ বাটনে চাপুন</p>
              </div>

              {/* Default Credential Box */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-950 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-emerald-900 pb-1 border-b border-emerald-200/60">
                  <span>🔑 ডিফল্ট এডমিন তথ্য:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@allservicebd.com');
                      setPassword('Admin@2027');
                    }}
                    className="text-emerald-700 underline font-semibold cursor-pointer"
                  >
                    অটো-ফিল করুন
                  </button>
                </div>
                <p>ইমেইল: <strong className="font-mono">admin@allservicebd.com</strong></p>
                <p>পাসওয়ার্ড: <strong className="font-mono text-emerald-700">Admin@2027</strong></p>
              </div>
            </form>
          )}

          {/* TAB 2: SET NEW PASSWORD */}
          {activeTab === 'set_new_pass' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>নতুন পাসওয়ার্ড সেট করুন</span>
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">আপনার এডমিন ইমেইল নিশ্চিত করে যেকোনো নতুন পাসওয়ার্ড লিখে সেভ করুন। এটি সাথে সাথে কার্যকর হবে।</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                  এডমিন ইমেইল
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@allservicebd.com" 
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                  নতুন পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="আপনার নতুন পাসওয়ার্ড দিন" 
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                  কনফার্ম নতুন পাসওয়ার্ড
                </label>
                <input 
                  type={showNewPassword ? 'text' : 'password'} 
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার নতুন পাসওয়ার্ড লিখুন" 
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>নতুন পাসওয়ার্ড সংরক্ষণ ও লগইন করুন</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className="text-xs text-gray-500 hover:text-emerald-700 hover:underline"
                >
                  ← লগইন ফর্মে ফিরে যান
                </button>
              </div>
            </form>
          )}

          {/* Go Home Button */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                if (onGoHome) {
                  onGoHome();
                } else {
                  window.location.href = '/';
                }
              }}
              className="text-xs font-semibold text-gray-500 hover:text-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>গ্রাহক হোমপেজে ফিরে যান (View User Homepage)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
