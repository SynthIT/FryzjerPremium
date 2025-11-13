'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import "@/app/globals.css";

const COOKIE_CONSENT_KEY = 'cookie-consent';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik już wyraził zgodę
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Pokaż banner po krótkim opóźnieniu dla lepszego UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
    // Tutaj można dodać inicjalizację zewnętrznych skryptów (Google Analytics, etc.)
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setIsVisible(false);
  };

  const handleCustomize = () => {
    // Można dodać modal z opcjami cookies
    console.log('Customize cookies');
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Informacja o plikach cookie">
      <div className="cookie-banner-container">
        <div className="cookie-banner-content">
          <div className="cookie-banner-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div className="cookie-banner-text">
            <h3 className="cookie-banner-title">Używamy plików cookie</h3>
            <p className="cookie-banner-description">
              Ta strona używa plików cookie, aby zapewnić najlepsze doświadczenie użytkownika. 
              Kontynuując przeglądanie, wyrażasz zgodę na wykorzystanie plików cookie zgodnie z naszą{' '}
              <Link href="/polityka-prywatnosci" className="cookie-banner-link">
                polityką prywatności
              </Link>.
            </p>
          </div>
        </div>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="cookie-banner-button cookie-banner-button-secondary"
            onClick={handleReject}
            aria-label="Odrzuć pliki cookie"
          >
            Odrzuć
          </button>
          <button
            type="button"
            className="cookie-banner-button cookie-banner-button-primary"
            onClick={handleAccept}
            aria-label="Akceptuj pliki cookie"
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  );
}

