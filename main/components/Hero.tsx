'use client';

import Image from 'next/image';
import Link from 'next/link';
import "@/app/globals.css";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            ZNAJDŹ PRODUKT<br />
            PASUJĄCY DO CIEBIE
          </h1>
          
          <p className="hero-description">
            Przeglądaj naszą różnorodną ofertę kosmetyków, sprzętu oraz szkoleń aby indywidualnie dopasować się do swoich potrzeb.
          </p>
          
          <Link href="/products" className="hero-button">
            Kup teraz
          </Link> 
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Producentów</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Wysokiej jakości produktów</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">1,000+</div>
              <div className="stat-label">Zadowolonych klientów</div>
            </div>
          </div>
        </div>
        
        <div className="hero-right-section">
          <div className="hero-illustration">
            <div className="hero-image-placeholder">
              <Image 
                src="/heroimage.png" 
                alt="Hero Image" 
                width={500} 
                height={700} 
                className="hero-image"
                priority
              />
            </div>
            <div className="star-decoration star-1"></div>
            <div className="star-decoration star-2"></div>
          </div>
        </div>
      </div>
    
    </section>
  );
}
