'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Zap, Wifi, Share2, Check } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nativePrompt, setNativePrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Step 1: Mount safely on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 2: After mount, check conditions and show prompt
  useEffect(() => {
    if (!mounted) return;

    // Already installed?
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) return;
      if ((navigator as any).standalone === true) return;
    } catch {
      // ignore
    }

    // Dismissed recently?
    try {
      const dismissed = localStorage.getItem('pwa-dismissed');
      if (dismissed && Date.now() - Number(dismissed) < 12 * 3600 * 1000) return;
    } catch {
      // ignore
    }

    // Detect iOS
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Listen for native install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setNativePrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installHandler = () => {
      setInstalled(true);
      setShowModal(false);
      try { localStorage.setItem('pwa-installed', 'true'); } catch {}
    };
    window.addEventListener('appinstalled', installHandler);

    // Show modal after 3 seconds - ALWAYS
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
      clearTimeout(timer);
    };
  }, [mounted]);

  const handleInstall = useCallback(async () => {
    if (nativePrompt) {
      setInstalling(true);
      try {
        await nativePrompt.prompt();
        const result = await nativePrompt.userChoice;
        if (result.outcome === 'accepted') {
          setInstalled(true);
          try { localStorage.setItem('pwa-installed', 'true'); } catch {}
        }
      } catch {
        // ignore
      }
      setInstalling(false);
      setNativePrompt(null);
    }
    setShowModal(false);
    try { localStorage.setItem('pwa-dismissed', String(Date.now())); } catch {}
  }, [nativePrompt]);

  const handleDismiss = useCallback(() => {
    setShowModal(false);
    try { localStorage.setItem('pwa-dismissed', String(Date.now())); } catch {}
  }, []);

  // Don't render on server or before mount
  if (!mounted || !showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
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

        {/* Header vert */}
        <div className="relative bg-gradient-to-br from-nature-green-dark via-nature-green to-nature-green-light px-6 pt-8 pb-14 text-center text-white overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white/20">
              <img src="/images/logo.jpeg" alt="Cali-T" className="w-full h-full object-cover" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-1">Installer Cali-T</h2>
            <p className="text-white/80 text-sm">Votre &#233;nergie bio, toujours &#224; port&#233;e de main</p>
          </div>
        </div>

        {/* Avantages */}
        <div className="px-6 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nature-green/10 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-nature-green" />
              </div>
              <div>
                <span className="font-semibold text-sm text-gray-900 block">Acc&#232;s rapide</span>
                <span className="text-xs text-gray-500">Ouvrez depuis votre &#233;cran d&apos;accueil</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-gold-dark" />
              </div>
              <div>
                <span className="font-semibold text-sm text-gray-900 block">Exp&#233;rience native</span>
                <span className="text-xs text-gray-500">Comme une vraie application mobile</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="font-semibold text-sm text-gray-900 block">Mode hors ligne</span>
                <span className="text-xs text-gray-500">Consultez le menu sans internet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 space-y-3">
          {isIOS ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-3 text-center">
                  Pour installer sur iPhone / iPad :
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-amber-800">1</div>
                    <p className="text-sm text-amber-700">Appuyez sur <Share2 className="inline w-4 h-4 mx-0.5" /> <strong>Partager</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-amber-800">2</div>
                    <p className="text-sm text-amber-700">Appuyez <strong>&quot;Sur l&apos;&#233;cran d&apos;accueil&quot;</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-amber-800">3</div>
                    <p className="text-sm text-amber-700">Appuyez <strong>&quot;Ajouter&quot;</strong></p>
                  </div>
                </div>
              </div>
              <button onClick={handleDismiss} className="w-full py-3.5 bg-nature-green text-white font-semibold rounded-xl hover:bg-nature-green-dark transition-colors text-sm">
                J&apos;ai compris !
              </button>
            </>
          ) : nativePrompt ? (
            <>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="w-full py-3.5 bg-nature-green text-white font-semibold rounded-xl hover:bg-nature-green-dark transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-nature-green/25 disabled:opacity-70"
              >
                {installing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Installation...
                  </>
                ) : installed ? (
                  <>
                    <Check className="w-5 h-5" />
                    Install&#233; !
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Installer l&apos;application
                  </>
                )}
              </button>
              <button onClick={handleDismiss} className="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors">
                Plus tard
              </button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-3 text-center">
                  Pour installer l&apos;application :
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-blue-800">1</div>
                    <p className="text-sm text-blue-700">Ouvrez le menu du navigateur <strong>(&#8942;)</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-blue-800">2</div>
                    <p className="text-sm text-blue-700">Appuyez sur <strong>&quot;Installer&quot;</strong> ou <strong>&quot;Ajouter &#224; l&apos;&#233;cran d&apos;accueil&quot;</strong></p>
                  </div>
                </div>
              </div>
              <button onClick={handleDismiss} className="w-full py-3.5 bg-nature-green text-white font-semibold rounded-xl hover:bg-nature-green-dark transition-colors text-sm">
                J&apos;ai compris !
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
