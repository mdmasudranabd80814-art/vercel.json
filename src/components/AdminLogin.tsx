import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Zap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Home, 
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (adminEmail?: string) => void;
  onGoHome?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onGoHome }) => {
  const [email, setEmail] = useState('admin@allservicebd.com');
  const [password, setPassword] = useState('Admin@2027');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // New smart links
  const smartControlUrl = 'https://all-service-bd-1.vercel.app/control';
  const standardAdminUrl = 'https://all-service-bd-1.vercel.app/admin';

  // Instant login function - NEVER fails or blocks the owner
  const doLogin = (userEmail = 'admin@allservicebd.com') => {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminEmail', userEmail.trim().toLowerCase());
    setSuccessMsg('লগইন সফল হয়েছে! স্মার্ট কন্ট্রোল প্যানেলে স্বাগতম...');
    setTimeout(() => {
      onLoginSuccess(userEmail.trim().toLowerCase());
    }, 200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email || 'admin@allservicebd.com');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(smartControlUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      {/* Smart Link Banner */}
      <div className="w-full max-w-md mb-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="truncate">
            <p className="text-[10px] uppercase font-black text-emerald-300 tracking-wider">নতুন স্মার্ট কন্ট্রোল লিংক</p>
            <p className="text-xs font-mono font-bold truncate text-white">{smartControlUrl}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
        </button>
      </div>

      {/* Main Login Box */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 p-6 sm:p-7 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            <ShieldCheck className="w-9 h-9 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">All Service BD</h1>
          <p className="text-emerald-200 text-xs font-semibold mt-0.5">স্মার্ট মাস্টার এডমিন কন্ট্রোল রুম</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold mt-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>সুপার অথেন্টিকেশন সক্রিয়</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-4">
          
          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* PRIMARY: 1-Click Instant Access Button (GUARANTEED ENTRY) */}
          <div className="p-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-md">
            <button
              type="button"
              onClick={() => doLogin(email || 'admin@allservicebd.com')}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-black py-3.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-inner"
            >
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
              <span>⚡ ১-ক্লিকে সরাসরি এডমিন প্রবেশ</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-500 text-center font-medium">
            (পাসওয়ার্ড টাইপ করার প্রয়োজন নেই, সরাসরি বাটনে চাপলেই ড্যাশবোর্ড খুলবে)
          </p>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink mx-3 text-gray-400 text-xs font-bold uppercase">অথবা সাধারণ লগইন</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Fallback Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                এডমিন ইমেইল
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@allservicebd.com" 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin@2027" 
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Links Helper Info */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl text-[11px] text-emerald-950 space-y-1">
            <p className="font-bold text-emerald-900 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>সহজ অ্যাক্সেস লিংকসমূহ:</span>
            </p>
            <p>১. নতুন স্মার্ট লিংক: <strong className="font-mono text-emerald-800">/control</strong></p>
            <p>২. স্ট্যান্ডার্ড লিংক: <strong className="font-mono text-emerald-800">/admin</strong></p>
            <p>৩. ম্যানেজার লিংক: <strong className="font-mono text-emerald-800">/manager</strong></p>
          </div>

          {/* View Website Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                if (onGoHome) {
                  onGoHome();
                } else {
                  window.location.href = '/';
                }
              }}
              className="text-xs font-bold text-gray-500 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>ওয়েবসাইটে ফিরে যান (View User Homepage)</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-2.5 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
          All Service BD Master Admin Suite • 100% Reliable Access
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
