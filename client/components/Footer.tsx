'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import "@/app/globals.css";

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="footer-section">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-container">
          <div className="footer-newsletter-content">
            <h2 className="footer-newsletter-title">
              <span>BĄDŹ Z NAMI NA BIEŻĄCO</span>
              <span>I ZAPISZ SIE DO NASZEGO</span>
              <span>NEWSLETTER'A</span>
            </h2>
            <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="footer-newsletter-input-wrapper">
                <svg className="footer-newsletter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="Adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="footer-newsletter-input"
                />
              </div>
              <button type="submit" className="footer-newsletter-button">
                Zapisz się
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-main-container">
          <div className="footer-columns">
            {/* Column 1 - Branding */}
            <div className="footer-column footer-column-brand">
              <div className="footer-logo">
                <Image 
                  src="/logo.png" 
                  alt="ANTOINE HAIR INSTITUTE" 
                  width={200} 
                  height={60}
                  className="footer-logo-image"
                  loading="lazy"
                />
              </div>
              <p className="footer-tagline">SZKOLENIA & WSPARCIE BIZNESOWE DLA FRYZJERÓW</p>
              <p className="footer-description">
                Posiadamy kosmetyki, sprzęt i szkolenia dostosowane do twoich potrzeb.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social-icon" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              </div>
              <p className="footer-copyright">
                Antoine Hair Institute © 2025, Wszelkie prawa zastrzeżone
              </p>
            </div>

            {/* Column 2 - Shop */}
            <div className="footer-column">
              <h3 className="footer-column-title">SKLEP</h3>
              <ul className="footer-links">
                <li><Link href="/o-nas">O nas</Link></li>
                <li><Link href="/products/kosmetyki">Kosmetyki</Link></li>
                <li><Link href="/products/sprzet">Sprzęt</Link></li>
                <li><Link href="/products/szkolenia">Szkolenia</Link></li>
              </ul>
            </div>

            {/* Column 3 - Help */}
            <div className="footer-column">
              <h3 className="footer-column-title">POMOC</h3>
              <ul className="footer-links">
                <li><Link href="/pomoc-techniczna">Pomoc Techniczna</Link></li>
                <li><Link href="/wysylka-i-dostawa">Wysyłka i dostawa</Link></li>
                <li><Link href="/regulamin">Regulamin</Link></li>
                <li><Link href="/polityka-prywatnosci">Polityka prywatności</Link></li>
              </ul>
            </div>

            {/* Column 4 - FAQ */}
            <div className="footer-column">
              <h3 className="footer-column-title">F A Q</h3>
              <ul className="footer-links">
                <li><Link href="/konto">Konto</Link></li>
                <li><Link href="/zamowienia">Zamówienia</Link></li>
                <li><Link href="/platnosci">Płatności</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}