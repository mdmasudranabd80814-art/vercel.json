import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { MarketplaceProvider } from './context/MarketplaceContext.tsx';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <LanguageProvider>
      <MarketplaceProvider>
        <App />
      </MarketplaceProvider>
    </LanguageProvider>
  </AuthProvider>
);

