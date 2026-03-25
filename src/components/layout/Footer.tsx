import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Phone, MapPin, Facebook } from 'lucide-react';
import { CONTACT_PHONE, WHATSAPP_NUMBER } from '@/lib/constants';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-nature-green-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/images/logo.jpeg"
                alt="Cali-T"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
              />
              <div>
                <span className="font-heading font-bold text-xl">Cali-T</span>
                <span className="block text-xs text-gold-light">{t('common.tagline')}</span>
              </div>
            </div>
            <p className="text-sm text-white/80">{t('footer.description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">
                {t('common.home')}
              </Link>
              <Link href="/#products" className="text-sm text-white/80 hover:text-white transition-colors">
                {t('common.products')}
              </Link>
              <Link href="/cart" className="text-sm text-white/80 hover:text-white transition-colors">
                {t('common.cart')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('common.contact')}</h3>
            <div className="flex flex-col gap-3">
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
                <Phone className="w-4 h-4" />
                {CONTACT_PHONE}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <MapPin className="w-4 h-4" />
                WhatsApp
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} Cali-T. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
}
