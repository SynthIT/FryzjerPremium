'use client';

import { useState } from 'react';
import Image from 'next/image';
import "@/app/globals.css";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Szukaj:', searchQuery);
  };

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 100; // Wysokość sticky header z paddingiem
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      // Dodaj płynną animację z easing
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Dodaj efekt wizualny - podświetlenie sekcji po przewinięciu
      setTimeout(() => {
        element.style.transition = 'box-shadow 0.3s ease';
        const originalBoxShadow = element.style.boxShadow;
        element.style.boxShadow = '0 0 0 4px rgba(0, 0, 0, 0.1)';
        setTimeout(() => {
          element.style.boxShadow = originalBoxShadow;
        }, 1000);
      }, 500);
    }
    setShowDropdown(false); // Zamknij dropdown po kliknięciu
  };

  return (
    <header>
      <div className="header-container">
        <div className="header-logo">
          <Image src="/logo.png" alt="Logo" width={100} height={100} className="Mainlogo" />
        </div>

        <nav className="header-nav">
          <div className="nav-dropdown">
            <button onClick={() => setShowDropdown(!showDropdown)} className="nav-link-button">
              <span>Sklep</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="dropdown-arrow">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <a href="#" className="dropdown-item">Kategorie</a>
                <a href="#" className="dropdown-item">Promocje</a>
                <a 
                  href="#new-arrivals-section" 
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo('new-arrivals-section');
                  }}
                >
                  Nowości
                </a>
                <a 
                  href="#bestsellers-section" 
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo('bestsellers-section');
                  }}
                >
                  Bestsellery
                </a>
              </div>
            )}
          </div>
          <a href="#" className="nav-link">Blog</a>
          <a href="#" className="nav-link">O nas</a>
          <a href="#" className="nav-link">Kontakt</a>
        </nav>

        <div className="header-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="search-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wyszukaj produkt..."
              className="search-input"
            />
          </form>
        </div>

        <div className="basket-actions">
          <button className="login-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="basket-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button className="login-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="basket-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
