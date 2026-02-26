'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="w-full bg-[#F5EDE0] text-[#2d2d2d]">
      {/* Newsletter */}
      <div className="w-full border-b border-[rgba(45,45,45,0.1)] py-10 pb-14" >
        <div className="max-w-[1600px]  mx-auto px-6">
          <div id="newsletter" className="max-w-7xl mx-auto rounded-2xl bg-[#E0C7A8] p-12 sm:p-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <div className="lg:flex-[2] text-left z-1">
              <h2 className="text-white font-bold tracking-wider uppercase text-base sm:text-lg text-left md:text-xl lg:text-3xl leading-snug">
                <span className="block">BĄDŹ Z NAMI NA BIEŻĄCO</span>
                <span className="block">I ZAPISZ SIĘ DO NASZEGO NEWSLETTERA</span>
              </h2>
            </div>
            <form className="lg:flex-1 flex flex-col gap-3 min-w-0 z-1" onSubmit={handleNewsletterSubmit}>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="Adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D2B79B]/50 focus:border-[#D2B79B] text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                Zapisz się
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Główna treść stopki */}
      <div className="max-w-[1600px] mx-auto px-6 pt-14 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-8 lg:gap-x-12 lg:gap-y-0">
          <div className="lg:col-span-2">
            <div className="relative w-[200px] h-[60px] mb-10">
              <Image
                src="/logo.png"
                alt="ANTOINE HAIR INSTITUTE"
                width={200}
                height={60}
                className=""
                priority
              />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] leading-snug mb-4">
              Szkolenia & Wsparcie biznesowe dla fryzjerów
            </p>
            <p className="text-sm text-[#3d3d3d] leading-relaxed mb-6">
              Posiadamy kosmetyki, sprzęt i szkolenia dostosowane do twoich potrzeb.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-[#D5B89A] text-white flex items-center justify-center hover:bg-[#c4a882] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#D5B89A] text-white flex items-center justify-center hover:bg-[#c4a882] transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#D5B89A] text-white flex items-center justify-center hover:bg-[#c4a882] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4" fill="white"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#D5B89A] text-white flex items-center justify-center hover:bg-[#c4a882] transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">SKLEP</h3>
            <ul className="space-y-2.5">
              <li><Link href="/o-nas" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">O nas</Link></li>
              <li><Link href="/products/kosmetyki" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Kosmetyki</Link></li>
              <li><Link href="/products/sprzet" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Sprzęt</Link></li>
              <li><Link href="/products/szkolenia" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Szkolenia</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">POMOC</h3>
            <ul className="space-y-2.5">
              <li><Link href="/pomoc-techniczna" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Pomoc Techniczna</Link></li>
              <li><Link href="/wysylka-i-dostawa" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Wysyłka i dostawa</Link></li>
              <li><Link href="/regulamin" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Regulamin</Link></li>
              <li><Link href="/polityka-prywatnosci" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Polityka prywatności</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">F A Q</h3>
            <ul className="space-y-2.5">
              <li><Link href="/konto" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Konto</Link></li>
              <li><Link href="/zamowienia" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Zamówienia</Link></li>
              <li><Link href="/platnosci" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Płatności</Link></li>
              <li><Link href="/blog" className="text-sm text-[#3d3d3d] hover:text-[#1a1a1a] transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full border-t border-[rgba(45,45,45,0.1)] pt-10 pb-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="text-xs text-[#5c5c5c]">
            Antoine Hair Institute © 2025. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
