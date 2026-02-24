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
    <footer className="w-full bg-[#2d2520] text-[#e8ddd0]">
      {/* Newsletter */}
      <div className="w-full border-b border-[rgba(212,196,176,0.2)] bg-[rgba(0,0,0,0.15)]">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold tracking-wider uppercase mb-6 text-white">
              <span className="block">BĄDŹ Z NAMI NA BIEŻĄCO</span>
              <span className="block">I ZAPISZ SIĘ DO NASZEGO NEWSLETTERA</span>
            </h2>
            <form className="flex flex-col sm:flex-row gap-3 justify-center" onSubmit={handleNewsletterSubmit}>
              <div className="relative flex-1 max-w-md mx-auto sm:mx-0">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D2B79B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="Adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-[rgba(212,196,176,0.5)] bg-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/30"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-[#D2B79B] text-black font-semibold hover:bg-[#b89a7f] transition-colors"
              >
                Zapisz się
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative w-[200px] h-[60px]">
              <Image
                src="/logo.png"
                alt="ANTOINE HAIR INSTITUTE"
                width={200}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#D2B79B]">
              Szkolenia & Wsparcie biznesowe dla fryzjerów
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Posiadamy kosmetyki, sprzęt i szkolenia dostosowane do twoich potrzeb.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D2B79B] hover:text-black transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D2B79B] hover:text-black transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D2B79B] hover:text-black transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4" fill="white"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D2B79B] hover:text-black transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              </a>
            </div>
            <p className="text-xs text-gray-500 pt-4">
              Antoine Hair Institute © 2025, Wszelkie prawa zastrzeżone
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D2B79B] mb-4">SKLEP</h3>
            <ul className="space-y-2">
              <li><Link href="/o-nas" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">O nas</Link></li>
              <li><Link href="/products/kosmetyki" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Kosmetyki</Link></li>
              <li><Link href="/products/sprzet" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Sprzęt</Link></li>
              <li><Link href="/products/szkolenia" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Szkolenia</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D2B79B] mb-4">POMOC</h3>
            <ul className="space-y-2">
              <li><Link href="/pomoc-techniczna" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Pomoc Techniczna</Link></li>
              <li><Link href="/wysylka-i-dostawa" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Wysyłka i dostawa</Link></li>
              <li><Link href="/regulamin" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Regulamin</Link></li>
              <li><Link href="/polityka-prywatnosci" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Polityka prywatności</Link></li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D2B79B] mb-4">F A Q</h3>
            <ul className="space-y-2">
              <li><Link href="/konto" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Konto</Link></li>
              <li><Link href="/zamowienia" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Zamówienia</Link></li>
              <li><Link href="/platnosci" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Płatności</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-400 hover:text-[#D2B79B] transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
