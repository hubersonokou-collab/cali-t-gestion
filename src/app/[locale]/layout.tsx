import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2D7D3A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cali-T" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Cali-T" />
        <meta name="msapplication-TileColor" content="#2D7D3A" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-off-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
          <PWAInstallPrompt />
          <ServiceWorkerRegister />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
