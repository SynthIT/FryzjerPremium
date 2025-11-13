'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import "@/app/globals.css";

export default function Hero() {
  const backgroundImages = [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80', // Fryzjerstwo - profesjonalne narzędzia
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80', // Kosmetyki do włosów
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80', // Salon fryzjerski
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1920&q=80', // Profesjonalne produkty
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Sprawdź czy jesteśmy na urządzeniu mobilnym
    const isMobile = window.innerWidth <= 768;
    const animationDuration = isMobile ? 1200 : 1500;
    const intervalTime = isMobile ? 3500 : 4000;
    
    const interval = setInterval(() => {
      setPrevImageIndex(currentImageIndex);
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        );
      }, 10);
      
      setTimeout(() => {
        setIsAnimating(false);
        setPrevImageIndex(null);
      }, animationDuration);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [currentImageIndex, backgroundImages.length]);

  return (
    <section className="hero-section">
      <div className="hero-background-slideshow-wrapper">
        {prevImageIndex !== null && isAnimating && (
          <div
            key={`prev-${prevImageIndex}`}
            className="hero-background-slideshow leaving"
            style={{
              backgroundImage: `url(${backgroundImages[prevImageIndex]})`,
            }}
          />
        )}
        <div
          key={`current-${currentImageIndex}`}
          className={`hero-background-slideshow current ${isAnimating ? 'entering' : ''}`}
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          }}
        />
      </div>
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
            </div>
          </div>
        </div>
      </div>
    
    </section>
  );
}
