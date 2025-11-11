'use client';

import "@/app/globals.css";
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCategories() {
  const categories = [
    {
      id: 1,
      name: 'Kosmetyki',
      image: '',
    },
    {
      id: 2,
      name: 'Sprzęty',
      image: '',
    },
    {
      id: 3,
      name: 'Meble',
      image: '',
    },
    {
      id: 4,
      name: 'Szkolenia',
      image: '',
    },
  ];

  return (
    <section className="product-categories-section" id="product-categories-section">
      <div className="product-categories-container">
        <h2 className="categories-title">Odkryj produkty w swoim stylu</h2>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <Link key={category.id} href={`/products/${encodeURIComponent(category.name.toLowerCase())}`} className="category-card-link">
              <div className="category-card">
                <h3 className="category-name">{category.name}</h3>
                <div className="category-image-wrapper">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="category-image"
                    />
                  ) : (
                    <div className="category-placeholder">
                      <span>{category.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

