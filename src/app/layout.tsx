import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cali-T - Energie Naturelle Locale',
  description: 'Jus naturels energisants 100% Bio. Boostez votre systeme immunitaire !',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
