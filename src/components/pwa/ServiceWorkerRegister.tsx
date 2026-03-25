'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // ─── Network status detection ───
    const handleOnline = () => {
      setIsOffline(false);
      toast('Connexion r\u00e9tablie', {
        duration: 3000,
        icon: '\u2705',
        style: {
          borderRadius: '12px',
          background: '#1B5E27',
          color: '#fff',
        },
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast('Vous \u00eates hors ligne', {
        duration: 5000,
        icon: '\u26a0\ufe0f',
        style: {
          borderRadius: '12px',
          background: '#C41E3A',
          color: '#fff',
        },
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    // ─── Service Worker registration ───
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

        // Check for updates on focus
        const checkUpdate = () => registration.update();
        window.addEventListener('focus', checkUpdate);

        // Handle new SW available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              toast(
                'Nouvelle version disponible !',
                {
                  duration: 8000,
                  icon: '\ud83d\udd04',
                  style: {
                    borderRadius: '12px',
                    background: '#1B5E27',
                    color: '#fff',
                  },
                }
              );
              // Auto activate after 3 seconds
              setTimeout(() => {
                newWorker.postMessage('skipWaiting');
                window.location.reload();
              }, 3000);
            }
          });
        });

        return () => window.removeEventListener('focus', checkUpdate);
      } catch (err) {
        console.warn('SW registration failed:', err);
      }
    };

    // Delay registration to not block initial render
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Offline banner
  if (!isOffline) return null;

  return (
    <div className="offline-banner visible" role="alert">
      Mode hors ligne
    </div>
  );
}
