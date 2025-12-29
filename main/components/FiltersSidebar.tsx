'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import "@/app/globals.css";
import { Products, Categories, Producents } from "@/lib/models/Products";
import { getSubcategoryKeywords } from "@/lib/utils";

interface FiltersSidebarProps {
  category?: string;
  products: Products[];
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

export default function FiltersSidebar({ category, products, filters, onFiltersChange }: FiltersSidebarProps) {
  const [subcategoryMap, setSubcategoryMap] = useState<{ [key: string]: string[] }>({});

  // Pobierz mapę podkategorii
  useEffect(() => {
    async function fetchSubcategoryMap() {
      try {
        const map = await getSubcategoryKeywords();
        setSubcategoryMap(map);
      } catch (error) {
        console.error("Błąd podczas ładowania podkategorii:", error);
      }
    }
    fetchSubcategoryMap();
  }, []);

  // Dynamicznie generuj filtry na podstawie produktów
  const categoryFilters = useMemo(() => {
    // Filtruj produkty według kategorii (jeśli wybrana)
    const filteredProducts = category
      ? products.filter((product) => {
          const productCategories = product.kategoria as Categories[];
          if (productCategories && productCategories.length > 0) {
            return productCategories[0].nazwa.toLowerCase() === category.toLowerCase();
          }
          return false;
        })
      : products;

    // Generuj unikalne marki z produktów
    const brandsSet = new Set<string>();
    filteredProducts.forEach((product) => {
      if (product.producent) {
        if (typeof product.producent === 'string') {
          brandsSet.add(product.producent);
        } else if (typeof product.producent === 'object' && 'nazwa' in product.producent) {
          const producent = product.producent as Producents;
          if (producent.nazwa) {
            brandsSet.add(producent.nazwa);
          }
        }
      }
    });
    const brands = Array.from(brandsSet).sort();

    // Generuj unikalne rozmiary z wariantów produktów
    const sizesSet = new Set<string>();
    filteredProducts.forEach((product) => {
      if (product.wariant && Array.isArray(product.wariant)) {
        product.wariant.forEach((wariant) => {
          if (wariant.typ === 'rozmiar' && wariant.rozmiary?.val) {
            sizesSet.add(wariant.rozmiary.val);
          }
        });
      }
    });
    const sizes = sizesSet.size > 0 ? Array.from(sizesSet).sort() : null;

    // Generuj unikalne typy z wariantów (kolory i inne)
    const typesSet = new Set<string>();
    filteredProducts.forEach((product) => {
      if (product.wariant && Array.isArray(product.wariant)) {
        product.wariant.forEach((wariant) => {
          if (wariant.typ === 'kolor' && wariant.kolory?.val) {
            typesSet.add(wariant.kolory.val);
          }
        });
      }
    });
    const types = typesSet.size > 0 ? Array.from(typesSet).sort() : null;

    // Generuj podkategorie - używamy slugów kategorii produktów
    // Tworzymy mapę slug -> nazwa dla wyświetlania
    const subcategoriesMap = new Map<string, string>();
    filteredProducts.forEach((product) => {
      const productCategories = product.kategoria as Categories[];
      if (productCategories && productCategories.length > 0) {
        productCategories.forEach((cat) => {
          if (cat.slug && cat.nazwa) {
            // Używamy slug jako klucz, ale przechowujemy też nazwę dla wyświetlania
            subcategoriesMap.set(cat.nazwa.toLowerCase(), cat.nazwa);
          }
        });
      }
    });
    
    // Zwracamy tablicę obiektów {slug, nazwa} dla łatwiejszego użycia
    const subcategories = subcategoriesMap.size > 0 
      ? Array.from(subcategoriesMap.entries()).map(([slug, nazwa]) => ({ slug, nazwa })).sort((a, b) => a.nazwa.localeCompare(b.nazwa))
      : null;

    // Oblicz zakres cen z produktów
    const prices = filteredProducts.map((p) => p.cena);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 15000;
    const priceRange = { min: Math.max(0, Math.floor(minPrice)), max: Math.ceil(maxPrice) };

    return {
      subcategories,
      brands: brands.length > 0 ? brands : null,
      sizes,
      types,
      priceRange,
    };
  }, [products, category]);

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    subcategory: true,
    price: true,
    brand: true,
    size: false,
    type: false,
  });

  // Aktualizuj zakres cen gdy zmieni się kategoria lub produkty
  useEffect(() => {
    if (categoryFilters.priceRange && 
        (categoryFilters.priceRange.max !== filters.priceRange.max || 
         categoryFilters.priceRange.min !== filters.priceRange.min)) {
      onFiltersChange({
        priceRange: categoryFilters.priceRange,
        selectedSubcategories: filters.selectedSubcategories,
        selectedBrands: filters.selectedBrands,
        selectedSizes: filters.selectedSizes,
        selectedTypes: filters.selectedTypes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, categoryFilters.priceRange]);

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
              {categoryFilters.subcategories?.map((subcategory) => {
                const isSelected = filters.selectedSubcategories.includes(subcategory.nazwa);
                return (
                  <div 
                    key={subcategory.slug} 
                    className={`filter-category-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFiltersChange({
                      ...filters,
                      selectedSubcategories: toggleFilter(filters.selectedSubcategories, subcategory.nazwa)
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="filter-checkbox"
                    />
                    <span>{subcategory.nazwa}</span>
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
          priceRange: categoryFilters.priceRange || { min: 0, max: 0 },
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

