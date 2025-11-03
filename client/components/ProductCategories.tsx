'use client';

import "@/app/globals.css";

import Image from 'next/image';

export default function ProductCategories() {
  const categories = [
    {
      id: 1,
      name: 'Szkolenia',
      image: '',
    },
    {
      id: 2,
      name: 'Kosmetyki',
      image: '',
    },
    {
      id: 3,
      name: 'Sprzęty',
      image: '',
    },
    {
      id: 4,
      name: 'Meble',
      image: '',
    },
  ];

  return (
    <section className="product-categories-section">
      <div className="product-categories-container">
        <h2 className="categories-title">Odkryj produkty w swoim stylu</h2>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
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
          ))}
        </div>
      </div>
    </section>
  );
}

