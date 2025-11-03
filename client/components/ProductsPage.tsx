'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import "@/app/globals.css";
import FiltersSidebar from '@/components/FiltersSidebar';

interface ProductsPageProps {
  categoryName?: string;
}

export default function ProductsPage({ categoryName }: ProductsPageProps) {
  const params = useParams();
  const urlCategoryParam = categoryName || (params?.category as string) || '';
  
  // Dekoduj URL i konwertuj nazwę kategorii z URL (np. "kosmetyki") na czytelną nazwę (np. "Kosmetyki")
  const decodeCategory = (categorySlug: string) => {
    try {
      return decodeURIComponent(categorySlug);
    } catch {
      return categorySlug;
    }
  };
  
  const urlCategory = decodeCategory(urlCategoryParam);
  
  const getCategoryDisplayName = (categorySlug: string) => {
    if (!categorySlug) return 'Wszystkie produkty';
    // Mapowanie nazw kategorii z URL na wyświetlane
    const categoryMap: { [key: string]: string } = {
      'kosmetyki': 'Kosmetyki',
      'sprzęty': 'Sprzęty',
      'sprzety': 'Sprzęty',
      'meble': 'Meble',
      'szkolenia': 'Szkolenia',
    };
    const lowerSlug = categorySlug.toLowerCase();
    return categoryMap[lowerSlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  };

  const [selectedCategory, setSelectedCategory] = useState(getCategoryDisplayName(urlCategory));
  const [sortBy, setSortBy] = useState('Most Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(getCategoryDisplayName(urlCategory));
    }
  }, [urlCategory]);

  // Przykładowe produkty z kategoriami
  const allProducts = [
    {
      id: 1,
      name: 'Szampon do włosów',
      image: '',
      rating: 4.5,
      price: '89,00',
      originalPrice: null,
      discount: null,
      category: 'Kosmetyki',
    },
    {
      id: 2,
      name: 'Odżywka regenerująca',
      image: '',
      rating: 4.8,
      price: '95,00',
      originalPrice: null,
      discount: null,
      category: 'Kosmetyki',
    },
    {
      id: 3,
      name: 'Myjnia fryzjerska LUNA',
      image: '',
      rating: 4.5,
      price: '6813,00',
      originalPrice: null,
      discount: null,
      category: 'Sprzęty',
    },
    {
      id: 4,
      name: 'Fotel fryzjerski premium',
      image: '',
      rating: 5.0,
      price: '2400,00',
      originalPrice: null,
      discount: null,
      category: 'Meble',
    },
    {
      id: 5,
      name: 'Kurs koloryzacji',
      image: '',
      rating: 4.9,
      price: '1800,00',
      originalPrice: null,
      discount: null,
      category: 'Szkolenia',
    },
    {
      id: 6,
      name: 'Lakier do włosów',
      image: '',
      rating: 4.2,
      price: '65,00',
      originalPrice: '80,00',
      discount: 19,
      category: 'Kosmetyki',
    },
    {
      id: 7,
      name: 'Suszarka profesjonalna',
      image: '',
      rating: 4.7,
      price: '450,00',
      originalPrice: null,
      discount: null,
      category: 'Sprzęty',
    },
    {
      id: 8,
      name: 'Stanowisko do mycia',
      image: '',
      rating: 4.6,
      price: '3200,00',
      originalPrice: null,
      discount: null,
      category: 'Meble',
    },
    {
      id: 9,
      name: 'Kurs strzyżenia męskiego',
      image: '',
      rating: 5.0,
      price: '1200,00',
      originalPrice: null,
      discount: null,
      category: 'Szkolenia',
    },
    {
      id: 10,
      name: 'Maska do włosów',
      image: '',
      rating: 4.3,
      price: '75,00',
      originalPrice: null,
      discount: null,
      category: 'Kosmetyki',
    },
    {
      id: 11,
      name: 'Nożyczki profesjonalne',
      image: '',
      rating: 4.8,
      price: '280,00',
      originalPrice: null,
      discount: null,
      category: 'Sprzęty',
    },
    {
      id: 12,
      name: 'Lustro fryzjerskie',
      image: '',
      rating: 4.4,
      price: '450,00',
      originalPrice: null,
      discount: null,
      category: 'Meble',
    },
  ];

  // Filtruj produkty według kategorii
  const filteredProducts = urlCategory 
    ? allProducts.filter(product => product.category.toLowerCase() === urlCategory.toLowerCase())
    : allProducts;

  const totalProducts = filteredProducts.length;
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalProducts / productsPerPage);

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
              <clipPath id={`half-star-${rating}`}>
                <rect x="0" y="0" width="12" height="24"/>
              </clipPath>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" clipPath={`url(#half-star-${rating})`}/>
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
    <div className="products-listing-page">
      <div className="products-listing-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumb-link">Strona główna</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">{selectedCategory}</span>
        </div>

        {/* Page Header */}
        <div className="products-page-header">
          <h1 className="products-page-title">{selectedCategory}</h1>
          <div className="products-page-info">
            <span className="products-count">Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} Products</span>
            <div className="sort-dropdown-wrapper">
              <label className="sort-label">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="products-listing-content">
          {/* Sidebar with Filters */}
          <FiltersSidebar category={urlCategory} />

          {/* Products Grid */}
          <div className="products-main-content">
            <div className="products-grid-listing">
              {displayedProducts.map((product) => (
                <div key={product.id} className="product-card-listing">
                  <div className="product-image-wrapper-listing">
                    {product.discount && (
                      <div className="product-discount-badge">-{product.discount}%</div>
                    )}
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="product-image-listing"
                      />
                    ) : (
                      <div className="product-placeholder-listing">
                        <span>{product.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info-listing">
                    <h3 className="product-name-listing">{product.name}</h3>
                    {renderStars(product.rating)}
                    <div className="product-price-listing">
                      {product.originalPrice && (
                        <span className="product-original-price">{product.originalPrice} zł</span>
                      )}
                      <span className="product-current-price">{product.price} zł</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Previous
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button 
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

