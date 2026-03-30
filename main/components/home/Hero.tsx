'use client';

import Image from 'next/image';
import Link from 'next/link';

const HERO_BG =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] h-[90vh] flex flex-col justify-between overflow-hidden px-4 sm:px-6 lg:px-12 pt-[100px] pb-8 lg:pb-12">
      {/* Tło: zdjęcie salonu */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_BG}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Ciemny overlay – czytelny tekst */}
        <div className="absolute inset-0 bg-black/50" aria-hidden />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto lg:mx-0 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[0.9] uppercase mb-5">
            <span className="relative inline-block">
              Znajdź produkt
              <span className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-full">
                <span
                  className="absolute left-0 top-0 h-1 w-[65%] rounded-full bg-[#D4B499]"
                  style={{ animation: 'hero-bar 2.5s ease-in-out infinite' }}
                  aria-hidden
                />
              </span>
            </span>
            <br />
            <span className="block mt-4">pasujący do Ciebie</span>
          </h1>
          <p className="text-base sm:text-lg text-white/95 mb-8 max-w-2xl leading-relaxed">
            Przeglądaj naszą różnorodną ofertę kosmetyków, sprzętu oraz szkoleń aby indywidualnie dopasować się do swoich potrzeb.
          </p>
          <Link
            href="/products"
            className="inline-block px-12 py-5 rounded-xl text-base font-semibold text-[#fff] bg-[#D4B499] hover:bg-[#c4a882] transition-all duration-300 shadow-[0_4px_20px_rgba(212,180,153,0.45)] hover:shadow-[0_6px_28px_rgba(212,180,153,0.5)]"
          >
            KUP TERAZ
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-12 py-8 pt-10 border-t border-white/25 max-w-[1400px] mx-auto w-full shrink-0">
        <div className="group cursor-default px-2 py-1 -mx-2 -my-1 rounded-lg transition-all duration-300 hover:scale-110 hover:text-[#D4B499]">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums transition-colors duration-300 group-hover:text-[#D4B499]">50+</div>
          <div className="text-xs sm:text-sm text-white uppercase tracking-wide mt-0.5 transition-colors duration-300 group-hover:text-white/90">Producentów</div>
        </div>
        <div className="w-px h-16 sm:h-20 bg-white/30 shrink-0" aria-hidden />
        <div className="group cursor-default px-2 py-1 -mx-2 -my-1 rounded-lg transition-all duration-300 hover:scale-110 hover:text-[#D4B499]">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums transition-colors duration-300 group-hover:text-[#D4B499]">200+</div>
          <div className="text-xs sm:text-sm text-white uppercase tracking-wide mt-0.5 max-w-[250px] transition-colors duration-300 group-hover:text-white/90">Wysokiej jakości produktów</div>
        </div>
        <div className="w-px h-16 sm:h-20 bg-white/30 shrink-0" aria-hidden />
        <div className="group cursor-default px-2 py-1 -mx-2 -my-1 rounded-lg transition-all duration-300 hover:scale-110 hover:text-[#D4B499]">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums transition-colors duration-300 group-hover:text-[#D4B499]">1,000+</div>
          <div className="text-xs sm:text-sm text-white uppercase tracking-wide mt-0.5 transition-colors duration-300 group-hover:text-white/90">Zadowolonych klientów</div>
        </div>
      </div>
    </section>
  );
}
