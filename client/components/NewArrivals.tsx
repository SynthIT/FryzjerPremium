'use client';

import Image from 'next/image';
import Link from 'next/link';
import "@/app/globals.css";
import { renderStars } from '@/lib/utils';
import { allProducts } from '@/app/data/products';

export default function NewArrivals() {
  // Sortuj produkty według ID (najnowsze na górze) i weź 4 najnowsze
  const products = [...allProducts]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);


  return (
    <section className="new-arrivals-section" id='new-arrivals-section'>
      <div className="new-arrivals-container">
        <h2 className="section-title">Nowości</h2>
        
        <div className="products-grid">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="product-card-link">
              <div className="product-card">
                <div className="product-image-wrapper">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="product-image"
                    />
                  ) : product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-placeholder">
                      <span>{product.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  {renderStars(product.rating)}
                  <div className="product-price">
                    {product.originalPrice && (
                      <span className="product-original-price-home">{product.originalPrice} zł</span>
                    )}
                    <span>{product.price} zł</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <button className="show-more-button">Pokaż więcej</button>
      </div>
    </section>
  );
}

