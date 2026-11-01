import { useState } from 'react'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Forgot password states
  const [viewMode, setViewMode] = useState<'login' | 'forgot_email' | 'forgot_otp' | 'forgot_reset'>('login')
  const [forgotEmail, setForgotEmail] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleLogin = () => {
    setError('')
    setSuccessMsg('')
    const validEmails = ['admin@allservicebd.com', 'mdmasudranabd80814@gmail.com']
    const customPassword = localStorage.getItem('adminCustomPassword')
    const validPasswords = ['Admin@123', 'Admin@2024', 'superadmin123', 'admin123']
    if (customPassword) {
      validPasswords.push(customPassword)
    }

    if (validEmails.includes(email.trim().toLowerCase()) && validPasswords.includes(password.trim())) {
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminEmail', email.trim().toLowerCase())
      window.location.href = '/admin'
    } else {
      setError('ইমেইল বা পাসওয়ার্ড ভুল! সঠিক এডমিন ইমেইল ও পাসওয়ার্ড দিয়ে চেষ্টা করুন।')
    }
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    const validEmail = 'admin@allservicebd.com'

    if (forgotEmail.trim().toLowerCase() !== validEmail) {
      setError('এই ইমেইলটি এডমিন ইমেইল নয়। সঠিক এডমিন ইমেইল দিন: admin@allservicebd.com')
      return
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(otp)
    setSuccessMsg(`ভেরিফিকেশন কোড পাঠানো হয়েছে! (টেস্ট কোড: ${otp})`)
    setViewMode('forgot_otp')
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (enteredOtp.trim() !== generatedOtp) {
      setError('ভুল ভেরিফিকেশন কোড! সঠিক কোডটি দিন।')
      return
    }
    setSuccessMsg('কোড সফলভাবে যাচাই হয়েছে। নতুন পাসওয়ার্ড সেট করুন।')
    setViewMode('forgot_reset')
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।')
      return
    }

    localStorage.setItem('adminCustomPassword', newPassword)
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminEmail', 'admin@allservicebd.com')
    alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে এবং এডমিন প্যানেলে লগইন করা হলো!')
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7ff] p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-1">ALL SERVICE BD</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {viewMode === 'login' && 'Super Admin Login'}
          {viewMode === 'forgot_email' && 'পাসওয়ার্ড পুনরুদ্ধার (ইমেইল ভেরিফিকেশন)'}
          {viewMode === 'forgot_otp' && 'ওটিপি কোড যাচাই'}
          {viewMode === 'forgot_reset' && 'নতুন পাসওয়ার্ড সেট করুন'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-4 text-center font-medium">
            {successMsg}
          </div>
        )}

        {viewMode === 'login' && (
          <div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">ইমেইল এড্রেস</label>
              <input 
                type="text" 
                placeholder="admin@allservicebd.com" 
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">পাসওয়ার্ড</label>
              <input 
                type="password" 
                placeholder="Admin@123" 
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold text-sm transition-colors mb-3">
              লগইন করুন
            </button>

            <div className="flex items-center justify-between text-xs mt-3">
              <button 
                onClick={() => { setViewMode('forgot_email'); setError(''); setSuccessMsg(''); }}
                className="text-blue-600 hover:underline font-medium"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
              <a href="/" className="text-gray-500 hover:underline">
                ← হোম পেজ
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400 text-center">
              টেস্ট ক্রিপডেনশিয়াল: admin@allservicebd.com / Admin@123
            </div>
          </div>
        )}

        {viewMode === 'forgot_email' && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">আপনার এডমিন ইমেইল দিন</label>
              <input 
                type="email" 
                required
                placeholder="admin@allservicebd.com" 
                value={forgotEmail}
                onChange={(e)=>setForgotEmail(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold text-sm transition-colors mb-3">
              ভেরিফিকেশন কোড পাঠান
            </button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => { setViewMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-xs text-gray-500 hover:underline"
              >
                ← লগইন পৃষ্ঠায় ফিরে যান
              </button>
            </div>
          </form>
        )}

        {viewMode === 'forgot_otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">৬ ডিজিটের ওটিপি কোড দিন</label>
              <input 
                type="text" 
                required
                maxLength={6}
                placeholder="123456" 
                value={enteredOtp}
                onChange={(e)=>setEnteredOtp(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-[11px] text-gray-400 mt-1 text-center">উপরে নোটিফিকেশনে দেখানো কোডটি এখানে লিখুন</p>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold text-sm transition-colors mb-3">
              কোড যাচাই করুন
            </button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => { setViewMode('forgot_email'); setError(''); }}
                className="text-xs text-gray-500 hover:underline"
              >
                ← ইমেইল পরিবর্তন করুন
              </button>
            </div>
          </form>
        )}

        {viewMode === 'forgot_reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">নতুন পাসওয়ার্ড</label>
              <input 
                type="password" 
                required
                placeholder="কমপক্ষে ৬ অক্ষর" 
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">কনফার্ম নতুন পাসওয়ার্ড</label>
              <input 
                type="password" 
                required
                placeholder="আবার পাসওয়ার্ড দিন" 
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold text-sm transition-colors mb-3">
              পাসওয়ার্ড পরিবর্তন ও লগইন
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminLogin
