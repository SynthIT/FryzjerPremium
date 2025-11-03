'use client';

import Image from 'next/image';
import "@/app/globals.css";

export default function NewArrivals() {
  const products = [
    {
      id: 1,
      name: 'AMAMIZU leave-in conditioner 200ml',
      image: '',
      rating: 4.5,
      price: '90,00',
    },
    {
      id: 2,
      name: 'ARASHI Energizing Shampoo 1L',
      image: '',
      rating: 3.5,
      price: '450,00',
    },
    {
      id: 3,
      name: 'Myjnia fryzjerska LUNA SOFA',
      image: '',
      rating: 4.5,
      price: '6813,00',
    },
    {
      id: 4,
      name: 'AYALA Mata narzędziowa BARBER SHOP',
      image: '',
      rating: 4.5,
      price: '114,00',
    },
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="product-rating">
        {Array(fullStars).fill(0).map((_, i) => (
          <svg key={`full-${i}`} className="star star-full" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="star star-half" viewBox="0 0 24 24">
            <defs>
              <clipPath id="half-star">
                <rect x="0" y="0" width="12" height="24"/>
              </clipPath>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" clipPath="url(#half-star)"/>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="#e0e0e0" strokeWidth="1.5"/>
          </svg>
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <svg key={`empty-${i}`} className="star star-empty" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        ))}
        <span className="rating-number">{rating}/5</span>
      </div>
    );
  };

  return (
    <section className="new-arrivals-section" id='new-arrivals-section'>
      <div className="new-arrivals-container">
        <h2 className="section-title">Nowości</h2>
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="product-image"
                  />
                ) : (
                  <div className="product-placeholder">
                    <span>Brak zdjęcia</span>
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {renderStars(product.rating)}
                <div className="product-price">{product.price} zł</div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="show-more-button">Pokaż więcej</button>
      </div>
    </section>
  );
}

