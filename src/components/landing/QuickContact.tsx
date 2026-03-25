'use client';

import { useTranslations } from 'next-intl';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { CONTACT_PHONE, WHATSAPP_NUMBER } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function QuickContact() {
  const t = useTranslations('landing');

  return (
    <section id="contact" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-nature-green/5 to-gold/5" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="relative animate-slide-in-left">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/images/hero-products.jpeg"
                alt="Gamme Cali-T"
                className="w-full h-[350px] object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nature-green/10 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-nature-green" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Livraison rapide</span>
                  <span className="text-xs text-gray-500">Abidjan & environs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact side */}
          <div className="animate-slide-in-right">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-nature-green-dark mb-4">
              {t('quickContact')}
            </h2>
            <p className="text-gray-600 mb-8 text-lg">{t('quickContactDesc')}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:border-nature-green/20 transition-colors">
                <div className="w-12 h-12 bg-nature-green/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-nature-green" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Appelez-nous</span>
                  <span className="font-bold text-nature-green-dark">{CONTACT_PHONE}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:border-nature-green/20 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">WhatsApp</span>
                  <span className="font-bold text-nature-green-dark">Commandez directement</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:border-nature-green/20 transition-colors">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Localisation</span>
                  <span className="font-bold text-nature-green-dark">Bonoua & Abidjan, Côte d&apos;Ivoire</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="flex-1">
                <Button size="lg" variant="primary" className="w-full justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Appeler
                </Button>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button size="lg" variant="secondary" className="w-full justify-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
