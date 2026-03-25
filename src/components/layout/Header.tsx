'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Menu, X, LogOut, LayoutDashboard, Shield, Home, ShoppingBag, Phone, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LanguageToggle from './LanguageToggle';
import CartIcon from './CartIcon';

export default function Header() {
  const t = useTranslations('common');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;

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

  // Hide header on scroll down, show on scroll up (mobile only)
  const handleScroll = useCallback(() => {
    if (window.innerWidth >= 768) {
      setHeaderVisible(true);
      return;
    }
    const currentScrollY = window.scrollY;
    if (currentScrollY < 60) {
      setHeaderVisible(true);
    } else if (currentScrollY - lastScrollY.current > scrollThreshold) {
      setHeaderVisible(false);
    } else if (lastScrollY.current - currentScrollY > scrollThreshold) {
      setHeaderVisible(true);
    }
    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/#products', label: t('products'), icon: ShoppingBag },
    { href: '/#contact', label: t('contact'), icon: Phone },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/images/logo.jpeg"
                alt="Cali-T"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-nature-green/20 group-hover:ring-nature-green/50 transition-all duration-300"
              />
              <div>
                <span className="font-heading font-bold text-lg sm:text-xl text-nature-green-dark">Cali-T</span>
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
            <div className="flex items-center gap-1 sm:gap-2">
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
                className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-in Drawer ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 right-0 w-[280px] h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="/images/logo.jpeg" alt="Cali-T" className="w-9 h-9 rounded-full object-cover" />
                <span className="font-heading font-bold text-nature-green-dark">Cali-T</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-nature-green/5 active:bg-nature-green/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 text-nature-green" />
                    <span className="text-sm font-medium flex-1">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                );
              })}

              {user && (
                <>
                  <div className="h-px bg-gray-100 my-3" />
                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-gold-dark hover:bg-gold/5 active:bg-gold/10 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      <span className="text-sm font-medium flex-1">Admin</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-nature-green hover:bg-nature-green/5 active:bg-nature-green/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm font-medium flex-1">{t('dashboard')}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                </>
              )}
            </nav>

            {/* Drawer footer */}
            <div className="p-4 border-t border-gray-100">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red hover:bg-red/5 active:bg-red/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">D&#233;connexion</span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-nature-green text-white text-sm font-semibold rounded-xl hover:bg-nature-green-dark active:bg-nature-green-dark transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
