'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import "@/app/globals.css";
import FiltersSidebar from '@/components/FiltersSidebar';
import { parsePrice, renderStars, getCategoryDisplayName, decodeCategory, getSubcategoryKeywords } from '@/lib/utils';

interface ProductsPageProps {
  categoryName?: string;
}

export default function ProductsPage({ categoryName }: ProductsPageProps) {
  const params = useParams();
  const urlCategoryParam = categoryName || (params?.category as string) || '';
  
  const urlCategory = useMemo(() => decodeCategory(urlCategoryParam), [urlCategoryParam]);
  const [selectedCategory, setSelectedCategory] = useState(() => getCategoryDisplayName(urlCategory));
  const [sortBy, setSortBy] = useState('Najpopularniejsze');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Stan filtrów - początkowy zakres dla "wszystkie produkty"
  // Teraz używamy tablic dla wielokrotnego wyboru
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 15000 },
    selectedSubcategories: [] as string[],
    selectedBrands: [] as string[],
    selectedSizes: [] as string[],
    selectedTypes: [] as string[],
  });

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(getCategoryDisplayName(urlCategory));
      setFilters({
        priceRange: { min: 0, max: 15000 },
        selectedSubcategories: [],
        selectedBrands: [],
        selectedSizes: [],
        selectedTypes: [],
      });
      setCurrentPage(1);
    }
  }, [urlCategory]);

  // Sortowanie produktów - memoized
  const sortedProducts = useMemo(() => {
    return [...allProducts].sort((a, b) => {
    switch (sortBy) {
      case 'Cena: od najniższej':
        return parsePrice(a.price) - parsePrice(b.price);
      case 'Cena: od najwyższej':
        return parsePrice(b.price) - parsePrice(a.price);
      case 'Ocena':
        return b.rating - a.rating;
      case 'Najnowsze':
        return b.id - a.id; // Zakładając, że wyższy ID = nowszy
      default: // 'Najpopularniejsze'
        return b.rating - a.rating;
    }
  });
  }, [sortBy]);

  // Mapowanie subkategorii - memoized
  const subcategoryMap = useMemo(() => getSubcategoryKeywords(), []);

  // Filtruj produkty według kategorii i wszystkich filtrów - memoized
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(product => {
    // Filtrowanie według kategorii
    if (urlCategory && product.category.toLowerCase() !== urlCategory.toLowerCase()) {
      return false;
    }

    // Filtrowanie według ceny
    const productPrice = parsePrice(product.price);
    if (productPrice < filters.priceRange.min || productPrice > filters.priceRange.max) {
      return false;
    }

    // Filtrowanie według podkategorii
    if (filters.selectedSubcategories.length > 0) {
      const productNameLower = product.name.toLowerCase();
      const matchesAnySubcategory = filters.selectedSubcategories.some(subcategory => {
        const keywords = subcategoryMap[subcategory] || [];
        return keywords.some(keyword => productNameLower.includes(keyword));
      });
      
      if (!matchesAnySubcategory) {
        return false;
      }
    }

    // Filtrowanie według marki (na razie pomijamy, bo produkty nie mają marki w danych)
    // Jeśli wybrano jakieś marki, produkt musi pasować do przynajmniej jednej
    if (filters.selectedBrands.length > 0) {
      // Na razie pomijamy, bo produkty nie mają marki w danych
      // Można dodać później gdy będą marki w danych produktów
    }

    // Filtrowanie według typu (na razie pomijamy, podobnie jak marka)
    if (filters.selectedTypes.length > 0) {
      // Na razie pomijamy, bo produkty nie mają typu w danych
    }

    // Filtrowanie według rozmiaru (tylko dla mebli, na razie pomijamy)
    if (filters.selectedSizes.length > 0) {
      // Na razie pomijamy, bo produkty nie mają rozmiaru w danych
    }

    return true;
  });
  }, [sortedProducts, urlCategory, filters, subcategoryMap]);

  // Resetuj stronę gdy zmienią się filtry
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Paginacja - memoized
  const totalProducts = filteredProducts.length;
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const displayedProducts = useMemo(() => 
    filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
  );
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Handlery - memoized
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

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
            <span className="products-count">Wyświetlanie {startIndex + 1}-{Math.min(endIndex, totalProducts)} z {totalProducts} produktów</span>
            <div className="sort-dropdown-wrapper">
              <label className="sort-label">Sortuj według:</label>
              <select 
                value={sortBy} 
                onChange={handleSortChange}
                className="sort-dropdown"
              >
                <option>Najpopularniejsze</option>
                <option>Cena: od najniższej</option>
                <option>Cena: od najwyższej</option>
                <option>Najnowsze</option>
                <option>Ocena</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="products-listing-content">
          {/* Sidebar with Filters */}
          <FiltersSidebar 
            category={urlCategory}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* Products Grid */}
          <div className="products-main-content">
            <div className="products-grid-listing">
              {displayedProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="product-card-listing">
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
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  ← Poprzednia
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
                          onClick={() => handlePageChange(pageNum)}
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
                  onClick={handleNextPage}
                >
                  Następna →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

