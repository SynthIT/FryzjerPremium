'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import "@/app/globals.css";

interface FiltersSidebarProps {
  category?: string;
  filters: {
    priceRange: { min: number; max: number };
    selectedSubcategories: string[];
    selectedBrands: string[];
    selectedSizes: string[];
    selectedTypes: string[];
  };
  onFiltersChange: (filters: {
    priceRange: { min: number; max: number };
    selectedSubcategories: string[];
    selectedBrands: string[];
    selectedSizes: string[];
    selectedTypes: string[];
  }) => void;
}

export default function FiltersSidebar({ category, filters, onFiltersChange }: FiltersSidebarProps) {
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
    
    // Domyślne filtry dla "wszystkie produkty" - pokazujemy wszystkie dostępne opcje
    return {
      subcategories: [
        // Kosmetyki
        'Szampony', 'Odżywki', 'Lakiery', 'Maseczki', 'Olejki',
        // Sprzęty
        'Myjnie', 'Suszarki', 'Nożyczki', 'Maszynki', 'Prostownice',
        // Meble
        'Fotele', 'Stanowiska do mycia', 'Lustra', 'Szafki', 'Stoliki',
        // Szkolenia
        'Koloryzacja', 'Strzyżenie', 'Stylizacja', 'Manicure', 'Makijaż'
      ],
      brands: [
        'Wella', 'L\'Oréal', 'Schwarzkopf', 'Redken', 'Matrix',
        'BaByliss', 'Wahl', 'Remington', 'Philips', 'Dyson',
        'Takara Belmont', 'JRL', 'Sanko', 'Belco', 'Panasonic'
      ],
      sizes: null,
      types: [
        // Kosmetyki
        'Do włosów suchych', 'Do włosów tłustych', 'Do włosów zniszczonych', 'Koloryzujące',
        // Sprzęty
        'Profesjonalne', 'Domowe', 'Bezprzewodowe', 'Z przewodem',
        // Meble
        'Klasyczne', 'Nowoczesne', 'Premium', 'Podstawowe',
        // Szkolenia
        'Zaawansowane', 'Mistrzowskie', 'Online', 'Stacjonarne'
      ],
      priceRange: { min: 0, max: 15000 }, // Największy zakres z wszystkich kategorii
    };
  };

  const categoryFilters = useMemo(() => {
    return category ? getFiltersForCategory(category) : getFiltersForCategory('');
  }, [category]);

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    subcategory: false,
    price: false,
    brand: false,
    size: false,
    type: false,
  });

  // Aktualizuj zakres cen gdy zmieni się kategoria
  useEffect(() => {
    if (categoryFilters.priceRange && categoryFilters.priceRange.max !== filters.priceRange.max) {
      onFiltersChange({
        priceRange: categoryFilters.priceRange,
        selectedSubcategories: [],
        selectedBrands: [],
        selectedSizes: [],
        selectedTypes: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Funkcja pomocnicza do toggle'owania wartości w tablicy - memoized
  const toggleFilter = useCallback((array: string[], value: string): string[] => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    } else {
      return [...array, value];
    }
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="filters-title">Filtry</h2>
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
              {categoryFilters.subcategories.map((subcategory) => {
                const isSelected = filters.selectedSubcategories.includes(subcategory);
                return (
                  <div 
                    key={subcategory} 
                    className={`filter-category-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFiltersChange({
                      ...filters,
                      selectedSubcategories: toggleFilter(filters.selectedSubcategories, subcategory)
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="filter-checkbox"
                    />
                    <span>{subcategory}</span>
                  </div>
                );
              })}
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
                <span>{filters.priceRange.min} zł</span>
                <span>{filters.priceRange.max} zł</span>
              </div>
              <div className="price-range-inputs">
                <input
                  type="range"
                  min={categoryFilters.priceRange.min}
                  max={categoryFilters.priceRange.max}
                  value={filters.priceRange.min}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    priceRange: { ...filters.priceRange, min: parseInt(e.target.value) }
                  })}
                  className="price-slider"
                />
                <input
                  type="range"
                  min={categoryFilters.priceRange.min}
                  max={categoryFilters.priceRange.max}
                  value={filters.priceRange.max}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    priceRange: { ...filters.priceRange, max: parseInt(e.target.value) }
                  })}
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
              {categoryFilters.brands.map((brand) => {
                const isSelected = filters.selectedBrands.includes(brand);
                return (
                  <div 
                    key={brand} 
                    className={`filter-category-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFiltersChange({
                      ...filters,
                      selectedBrands: toggleFilter(filters.selectedBrands, brand)
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="filter-checkbox"
                    />
                    <span>{brand}</span>
                  </div>
                );
              })}
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
                {categoryFilters.sizes.map((size) => {
                  const isSelected = filters.selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      className={`size-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => onFiltersChange({
                        ...filters,
                        selectedSizes: toggleFilter(filters.selectedSizes, size)
                      })}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        className="filter-checkbox"
                      />
                      {size}
                    </button>
                  );
                })}
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
              {categoryFilters.types.map((type) => {
                const isSelected = filters.selectedTypes.includes(type);
                return (
                  <div 
                    key={type} 
                    className={`filter-category-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFiltersChange({
                      ...filters,
                      selectedTypes: toggleFilter(filters.selectedTypes, type)
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="filter-checkbox"
                    />
                    <span>{type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Clear Filters Button */}
      <button 
        className="apply-filter-button"
        onClick={() => onFiltersChange({
          priceRange: categoryFilters.priceRange || { min: 0, max: 15000 },
          selectedSubcategories: [],
          selectedBrands: [],
          selectedSizes: [],
          selectedTypes: [],
        })}
      >
        Wyczyść filtry
      </button>
    </aside>
  );
}

