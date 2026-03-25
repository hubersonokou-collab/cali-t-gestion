'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const GALLERY_ITEMS = [
  { src: '/images/ad-gingembre-energy.jpeg', alt: 'Gingembre-Petit Cola - Puissance naturelle', span: 'col-span-1 row-span-1' },
  { src: '/images/ad-bissap.jpeg', alt: 'Jus de Bissap - Le goût de l\'enfance', span: 'col-span-1 row-span-1' },
  { src: '/images/ad-cocktail-fruits.jpeg', alt: 'Cocktail de Fruits', span: 'col-span-1 row-span-1' },
  { src: '/images/ad-pack-famille.jpeg', alt: 'Pack Famille - La santé se partage', span: 'col-span-1 row-span-1' },
  { src: '/images/photo-basket-logo.jpeg', alt: 'Panier Cali-T', span: 'col-span-1 sm:col-span-2 row-span-1' },
];

export default function AdGallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-24 bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-nature-green-dark mb-4">
            Découvrez nos saveurs
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full" />
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Une gamme complète de jus naturels pour toute la famille
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GALLERY_ITEMS.map((item, index) => (
            <div
              key={index}
              className={`${item.span} relative rounded-2xl overflow-hidden cursor-pointer group animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setLightbox(index)}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-medium">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={GALLERY_ITEMS[lightbox].src}
            alt={GALLERY_ITEMS[lightbox].alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
