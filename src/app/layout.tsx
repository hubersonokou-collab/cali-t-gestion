import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2D7D3A' },
    { media: '(prefers-color-scheme: dark)', color: '#1B5E27' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Cali-T - \u00c9nergie Naturelle Locale',
    template: '%s | Cali-T',
  },
  description: 'Jus naturels \u00e9nergisants 100% Bio. Boostez votre syst\u00e8me immunitaire ! Commandez en ligne.',
  applicationName: 'Cali-T',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cali-T',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
