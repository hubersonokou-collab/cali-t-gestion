'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LanguageToggle from './LanguageToggle';
import CartIcon from './CartIcon';

export default function Header() {
  const t = useTranslations('common');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
        setProfile(data);
      }
    }
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/#products', label: t('products') },
    { href: '/#contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.jpeg"
              alt="Cali-T"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-nature-green/20 group-hover:ring-nature-green/50 transition-all duration-300"
            />
            <div>
              <span className="font-heading font-bold text-xl text-nature-green-dark">Cali-T</span>
              <span className="hidden sm:block text-xs text-gold-dark">{t('tagline')}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-nature-green transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <CartIcon />

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-nature-green hover:bg-nature-green/5 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('dashboard')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center px-4 py-2 bg-nature-green text-white text-sm font-medium rounded-lg hover:bg-nature-green-dark transition-colors"
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="px-3 py-2 text-sm font-medium text-gold-dark hover:bg-gold/5 rounded-lg" onClick={() => setMobileOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-nature-green hover:bg-nature-green/5 rounded-lg" onClick={() => setMobileOpen(false)}>
                    {t('dashboard')}
                  </Link>
                  <button onClick={handleSignOut} className="px-3 py-2 text-sm font-medium text-red text-left hover:bg-red/5 rounded-lg">
                    Deconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-3 py-2 text-sm font-medium text-nature-green hover:bg-nature-green/5 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
