'use client';

import { useState, useEffect, useMemo } from 'react';
import "@/app/globals.css";

interface FiltersSidebarProps {
  category?: string;
}

export default function FiltersSidebar({ category }: FiltersSidebarProps) {
  // Filtry spersonalizowane pod kategorię
  const getFiltersForCategory = (categoryName: string) => {
    const categoryLower = categoryName.toLowerCase();
    
    if (categoryLower === 'kosmetyki') {
      return {
        subcategories: ['Szampony', 'Odżywki', 'Lakiery', 'Maseczki', 'Olejki'],
        brands: ['Wella', 'L\'Oréal', 'Schwarzkopf', 'Redken', 'Matrix'],
        sizes: null, // Kosmetyki nie mają rozmiarów
        types: ['Do włosów suchych', 'Do włosów tłustych', 'Do włosów zniszczonych', 'Koloryzujące'],
        priceRange: { min: 0, max: 500 },
      };
    } else if (categoryLower === 'sprzęty' || categoryLower === 'sprzety') {
      return {
        subcategories: ['Myjnie', 'Suszarki', 'Nożyczki', 'Maszynki', 'Prostownice'],
        brands: ['BaByliss', 'Wahl', 'Remington', 'Philips', 'Dyson'],
        sizes: null,
        types: ['Profesjonalne', 'Domowe', 'Bezprzewodowe', 'Z przewodem'],
        priceRange: { min: 0, max: 10000 },
      };
    } else if (categoryLower === 'meble') {
      return {
        subcategories: ['Fotele', 'Stanowiska do mycia', 'Lustra', 'Szafki', 'Stoliki'],
        brands: ['Takara Belmont', 'JRL', 'Sanko', 'Belco', 'Panasonic'],
        sizes: ['Małe', 'Średnie', 'Duże', 'XXL'],
        types: ['Klasyczne', 'Nowoczesne', 'Premium', 'Podstawowe'],
        priceRange: { min: 0, max: 15000 },
      };
    } else if (categoryLower === 'szkolenia') {
      return {
        subcategories: ['Koloryzacja', 'Strzyżenie', 'Stylizacja', 'Manicure', 'Makijaż'],
        brands: null, // Szkolenia nie mają brandów
        sizes: null,
        types: ['Podstawowe', 'Zaawansowane', 'Mistrzowskie', 'Online', 'Stacjonarne'],
        priceRange: { min: 0, max: 5000 },
      };
    }
    
    // Domyślne filtry
    return {
      subcategories: [],
      brands: [],
      sizes: null,
      types: [],
      priceRange: { min: 0, max: 10000 },
    };
  };

  const categoryFilters = useMemo(() => {
    return category ? getFiltersForCategory(category) : getFiltersForCategory('');
  }, [category]);

  const [priceRange, setPriceRange] = useState(categoryFilters.priceRange);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    subcategory: true,
    price: true,
    brand: true,
    size: false,
    type: false,
  });

  useEffect(() => {
    if (categoryFilters.priceRange) {
      setPriceRange(categoryFilters.priceRange);
      setSelectedSubcategory(null);
      setSelectedBrand(null);
      setSelectedSize(null);
      setSelectedType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="filters-title">Filters</h2>
      </div>

      {/* Subcategories */}
      {categoryFilters.subcategories && categoryFilters.subcategories.length > 0 && (
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('subcategory')}
          >
            <span>Podkategorie</span>
            <svg 
              className={`filter-arrow ${expandedSections.subcategory ? 'expanded' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.subcategory && (
            <div className="filter-section-content">
              {categoryFilters.subcategories.map((subcategory) => (
                <div 
                  key={subcategory} 
                  className={`filter-category-item ${selectedSubcategory === subcategory ? 'selected' : ''}`}
                  onClick={() => setSelectedSubcategory(selectedSubcategory === subcategory ? null : subcategory)}
                >
                  <span>{subcategory}</span>
                  <svg className="filter-arrow-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <span>Cena</span>
          <svg 
            className={`filter-arrow ${expandedSections.price ? 'expanded' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.price && categoryFilters.priceRange && (
          <div className="filter-section-content">
            <div className="price-range-slider">
              <div className="price-range-values">
                <span>{priceRange.min} zł</span>
                <span>{priceRange.max} zł</span>
              </div>
              <div className="price-range-inputs">
                <input
                  type="range"
                  min={categoryFilters.priceRange.min}
                  max={categoryFilters.priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  className="price-slider"
                />
                <input
                  type="range"
                  min={categoryFilters.priceRange.min}
                  max={categoryFilters.priceRange.max}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="price-slider"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brands */}
      {categoryFilters.brands && categoryFilters.brands.length > 0 && (
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('brand')}
          >
            <span>Marka</span>
            <svg 
              className={`filter-arrow ${expandedSections.brand ? 'expanded' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.brand && (
            <div className="filter-section-content">
              {categoryFilters.brands.map((brand) => (
                <div 
                  key={brand} 
                  className={`filter-category-item ${selectedBrand === brand ? 'selected' : ''}`}
                  onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                >
                  <span>{brand}</span>
                  <svg className="filter-arrow-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sizes - tylko dla Meble */}
      {categoryFilters.sizes && categoryFilters.sizes.length > 0 && (
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('size')}
          >
            <span>Rozmiar</span>
            <svg 
              className={`filter-arrow ${expandedSections.size ? 'expanded' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.size && (
            <div className="filter-section-content">
              <div className="sizes-grid">
                {categoryFilters.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Types */}
      {categoryFilters.types && categoryFilters.types.length > 0 && (
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('type')}
          >
            <span>Typ</span>
            <svg 
              className={`filter-arrow ${expandedSections.type ? 'expanded' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.type && (
            <div className="filter-section-content">
              {categoryFilters.types.map((type) => (
                <div 
                  key={type} 
                  className={`filter-category-item ${selectedType === type ? 'selected' : ''}`}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                >
                  <span>{type}</span>
                  <svg className="filter-arrow-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Filter Button */}
      <button className="apply-filter-button">Apply Filter</button>
    </aside>
  );
}

