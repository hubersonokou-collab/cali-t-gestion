'use client';

export default function IngredientsShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-nature-green-dark relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white/30 rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/photo-ingredients.jpeg"
                alt="Ingrédients naturels Cali-T"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nature-green-dark/50 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 sm:bottom-6 sm:right-6 bg-gold text-white rounded-xl px-5 py-3 shadow-lg animate-float">
              <span className="text-2xl font-bold block">100%</span>
              <span className="text-xs font-medium">Ingrédients Bio</span>
            </div>
          </div>

          {/* Text side */}
          <div className="text-white">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
              Des ingrédients<br />
              <span className="text-gold-light">soigneusement sélectionnés</span>
            </h2>
            <p className="text-white/80 mb-8 text-lg leading-relaxed">
              Chaque bouteille Cali-T est un mélange unique de fruits tropicaux et d&apos;épices locales,
              choisis pour leurs bienfaits sur votre santé.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Gingembre', desc: 'Énergie & digestion' },
                { name: 'Bissap', desc: 'Antioxydants' },
                { name: 'Petit Cola', desc: 'Vitalité naturelle' },
                { name: 'Curcuma', desc: 'Anti-inflammatoire' },
                { name: 'Noix de coco', desc: 'Hydratation' },
                { name: 'Fruits tropicaux', desc: 'Vitamines' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                  <div>
                    <span className="font-semibold text-sm block">{item.name}</span>
                    <span className="text-xs text-white/60">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
