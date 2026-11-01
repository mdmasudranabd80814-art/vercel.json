import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import AdminPanel from './components/AdminPanel';
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
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const { loading, config } = useMarketplace();

  // Listen for browser popstate
  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Multi-route admin detection (/control, /admin, /manager, /portal, or query param ?admin=true / ?control=true)
  const search = window.location.search;
  const isAdminRoute = (
    path === '/control' ||
    path.startsWith('/control') ||
    path === '/admin' ||
    path.startsWith('/admin') ||
    path === '/manager' ||
    path.startsWith('/manager') ||
    path === '/portal' ||
    path.startsWith('/portal') ||
    search.includes('admin=true') ||
    search.includes('control=true')
  );

  // If visiting an admin route
  if (isAdminRoute) {
    if (!isAdmin) {
      return (
        <AdminLogin 
          onLoginSuccess={() => {
            setIsAdmin(true);
          }} 
          onGoHome={() => {
            window.history.pushState({}, '', '/');
            setPath('/');
          }}
        />
      );
    }
    return (
      <AdminPanel 
        onLogout={() => {
          localStorage.removeItem('isAdmin');
          setIsAdmin(false);
        }} 
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setPath('/');
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

  // ===== ইউজার হোম পেজ - সম্পূর্ণ অক্ষত ও সুন্দরভাবে চালু =====
  return (
    <div className="min-h-screen bg-white">
      <AndroidLaptopFrame activeMode="fluid" isWindowShellActive={false}>
        <div className="flex flex-col min-h-screen">
          <Navbar onAdminClick={() => {
            window.history.pushState({}, '', '/control');
            setPath('/control');
          }} />
          <Hero />
          <Services />
        </div>
      </AndroidLaptopFrame>
    </div>
  );
}

export default App;
