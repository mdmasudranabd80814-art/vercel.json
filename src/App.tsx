import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import SuperAdmin from './components/SuperAdmin';
import AdminLogin from './components/AdminLogin';
import { AndroidLaptopFrame } from './components/AndroidLaptopFrame';
import { useMarketplace } from './context/MarketplaceContext';

export interface DynamicHomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  superPackagePrice: string;
  services: Array<{ name: string; price: string; icon: string }>;
  showPayments: boolean;
  footerText: string;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const { loading, config } = useMarketplace();

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Clean legacy /admin/login URL to official terminal link /admin
  if (path === '/admin/login') {
    window.history.replaceState({}, '', '/admin');
  }

  // Official Single Admin Terminal Link (/admin)
  if (path === '/admin' || path.startsWith('/admin')) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      return (
        <AdminLogin 
          onLoginSuccess={() => {
            setPath('/admin');
          }} 
        />
      );
    }
    return (
      <SuperAdmin 
        onLogout={() => {
          localStorage.removeItem('isAdmin');
          setPath('/admin');
          window.history.replaceState({}, '', '/admin');
        }} 
        onChangePassword={(newPass) => {
          localStorage.setItem('adminCustomPassword', newPass);
          localStorage.setItem('adminPass', newPass);
        }}
      />
    );
  }

  // Maintenance Mode Check
  if (!loading && config?.maintenanceMode) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">সাইট মেইনটেন্যান্স চলছে</h1>
          <p className="text-emerald-200">আমরা শীঘ্রই ফিরে আসছি।</p>
        </div>
      </div>
    );
  }

  // ===== হোম পেজ - এখানে কোনো চেঞ্জ করি নাই =====
  return (
    <div className="min-h-screen bg-white">
      <AndroidLaptopFrame activeMode="fluid" isWindowShellActive={false}>
        <div className="flex flex-col min-h-screen">
          <Navbar onAdminClick={() => {
            window.history.pushState({}, '', '/admin');
            setPath('/admin');
          }} />
          <Hero />
          <Services />
        </div>
      </AndroidLaptopFrame>
    </div>
  );
}

export default App;
