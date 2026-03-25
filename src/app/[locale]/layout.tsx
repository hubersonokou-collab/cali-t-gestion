import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import ChatWidget from '@/components/chat/ChatWidget';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2D7D3A" />
        <meta name="theme-color" content="#1B5E27" media="(prefers-color-scheme: dark)" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Apple PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cali-T" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />

        {/* Apple splash screens - iPhone SE / 8 */}
        <link rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        {/* iPhone X / XS / 11 Pro / 12 mini / 13 mini */}
        <link rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone XR / 11 / 12 / 13 / 14 */}
        <link rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        {/* iPhone 12 Pro / 13 Pro / 14 */}
        <link rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 14 Pro / 15 / 15 Pro */}
        <link rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 14 Pro Max / 15 Plus / 15 Pro Max */}
        <link rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />

        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Cali-T" />

        {/* MS */}
        <meta name="msapplication-TileColor" content="#2D7D3A" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        {/* Prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />

        {/* Color scheme */}
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen flex flex-col bg-off-white antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <ChatWidget />
          <PWAInstallPrompt />
          <ServiceWorkerRegister />
          <Toaster
            position="top-center"
            containerStyle={{ top: 20 }}
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#1B5E27',
                color: '#fff',
                fontSize: '14px',
                padding: '12px 16px',
              },
              duration: 3000,
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
