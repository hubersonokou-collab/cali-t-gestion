'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Button from '@/components/ui/Button';
import { Zap, Leaf, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: '/images/hero-banner.png',
    alt: 'Cali-T ton énergie 100% Bio',
  },
  {
    image: '/images/photo-outdoor-original.jpeg',
    alt: 'Cali-T Jus Naturel Énergisant',
  },
  {
    image: '/images/photo-tropical-mix.jpeg',
    alt: 'Cali-T Mélange Tropical',
  },
  {
    image: '/images/photo-bottle-nature.jpeg',
    alt: 'Cali-T produit frais naturel',
  },
];

export default function HeroBanner() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 400);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative overflow-hidden min-h-[600px] sm:min-h-[700px]">
      {/* Background slideshow */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide && !isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-nature-green-dark/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex items-center min-h-[600px] sm:min-h-[700px]">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-5 py-2 mb-6 animate-fade-in-down">
            <Leaf className="w-4 h-4 text-gold-light" />
            <span className="text-sm font-medium text-white">100% Bio & Naturel</span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white animate-fade-in-up">
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
            {t('heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up animation-delay-400">
            <Link href="/#products">
              <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-shadow">
                {tc('orderNow')}
              </Button>
            </Link>
            <Link href="/#products">
              <Button size="lg" variant="outline" className="!border-white !text-white hover:!bg-white/10 backdrop-blur-sm">
                {tc('viewProducts')}
              </Button>
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 animate-fade-in-up animation-delay-600">
            {[
              { icon: Zap, label: 'Énergie' },
              { icon: Shield, label: 'Immunité' },
              { icon: Leaf, label: '100% Naturel' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 hover:bg-white/20 transition-colors duration-300"
              >
                <Icon className="w-4 h-4 text-gold-light" />
                <span className="text-sm text-white font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-gold'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
