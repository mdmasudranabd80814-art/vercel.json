import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface SiteConfig {
  maintenanceMode: boolean;
  announcement?: string;
  version?: string;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as SiteConfig);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Site config sync notice:', error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { config, loading };
}
