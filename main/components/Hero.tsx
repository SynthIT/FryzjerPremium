'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center overflow-hidden pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black mb-6 leading-tight">
            ZNAJDŹ PRODUKT
            <br />
            PASUJĄCY DO CIEBIE
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0">
            Przeglądaj naszą różnorodną ofertę kosmetyków, sprzętu oraz szkoleń aby indywidualnie dopasować się do swoich potrzeb.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(210,183,155,0.4)]"
          >
            Kup teraz
          </Link>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-12 pt-8 border-t border-[rgba(212,196,176,0.3)]">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#D2B79B]">50+</div>
              <div className="text-sm text-gray-600">Producentów</div>
            </div>
            <div className="w-px h-10 bg-[rgba(212,196,176,0.5)] hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#D2B79B]">200+</div>
              <div className="text-sm text-gray-600">Wysokiej jakości produktów</div>
            </div>
            <div className="w-px h-10 bg-[rgba(212,196,176,0.5)] hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#D2B79B]">1,000+</div>
              <div className="text-sm text-gray-600">Zadowolonych klientów</div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center lg:justify-end">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <Image
                src="/heroimage.png"
                alt="Hero Image"
                width={500}
                height={700}
                className="w-full max-w-[400px] lg:max-w-[500px] h-auto object-cover"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#D2B79B]/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#b89a7f]/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
