'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Zap, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (don't show for 24h)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // iOS: show the modal after 2 seconds
      const timer = setTimeout(() => {
        setShowFullModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 1.5 seconds
      setTimeout(() => setShowBanner(true), 1500);
      // Auto show full modal after 5 seconds
      setTimeout(() => setShowFullModal(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Track online/offline
    const onlineHandler = () => setIsOffline(false);
    const offlineHandler = () => setIsOffline(true);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowBanner(false);
    setShowFullModal(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowFullModal(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // Don't render if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* --- Floating bottom banner --- */}
      {showBanner && !showFullModal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-nature-green/20 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="shrink-0">
                <img
                  src="/images/logo.jpeg"
                  alt="Cali-T"
                  className="w-12 h-12 rounded-xl object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-bold text-nature-green-dark text-sm">
                  Installer Cali-T
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  Commandez vos jus bio en un clic !
                </p>
              </div>
              <button
                onClick={handleInstall}
                className="shrink-0 bg-nature-green text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-nature-green-dark transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Installer
              </button>
              <button
                onClick={handleDismiss}
                className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar animation */}
            <div className="h-1 bg-gray-100">
              <div className="h-full bg-gradient-to-r from-nature-green to-gold animate-[progress_5s_linear_forwards]" />
            </div>
          </div>
        </div>
      )}

      {/* --- Full install modal --- */}
      {showFullModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-nature-green-dark via-nature-green to-nature-green-light px-6 pt-8 pb-12 text-center text-white">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white/20">
                  <img
                    src="/images/logo.jpeg"
                    alt="Cali-T"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-heading text-2xl font-bold mb-1">
                  Installer Cali-T
                </h2>
                <p className="text-white/80 text-sm">
                  Votre jus bio en un clic
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="px-6 -mt-6 relative z-10">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nature-green/10 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-nature-green" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900 block">Acces rapide</span>
                      <span className="text-xs text-gray-500">Ouvrez l&apos;app depuis votre ecran d&apos;accueil</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-gold-dark" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900 block">Experience native</span>
                      <span className="text-xs text-gray-500">Comme une vraie application mobile</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      {isOffline ? (
                        <WifiOff className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Wifi className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900 block">Mode hors ligne</span>
                      <span className="text-xs text-gray-500">Consultez le menu meme sans internet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 space-y-3">
              {isIOS ? (
                <>
                  {/* iOS install instructions */}
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-700 mb-2">
                      Pour installer sur iPhone/iPad :
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-nature-green-dark font-medium">
                      <span>Appuyez sur</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7-7 7 7" />
                        <rect x="4" y="18" width="16" height="2" rx="1" />
                      </svg>
                      <span>puis &quot;Sur l&apos;ecran d&apos;accueil&quot;</span>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3.5 bg-nature-green text-white font-semibold rounded-xl hover:bg-nature-green-dark transition-colors text-sm"
                  >
                    J&apos;ai compris
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleInstall}
                    className="w-full py-3.5 bg-nature-green text-white font-semibold rounded-xl hover:bg-nature-green-dark transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-nature-green/25"
                  >
                    <Download className="w-5 h-5" />
                    Installer l&apos;application
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
                  >
                    Plus tard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
