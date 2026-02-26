'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Products, Producents } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
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
    const subcategoriesMap = new Map<string, { slug: string; nazwa: string }>();
    filteredProducts.forEach((product) => {
      const productCategories = product.kategoria as Categories[];
      if (productCategories && productCategories.length > 0) {
        productCategories.forEach((cat) => {
          if (cat.slug && cat.nazwa) {
            // Używamy slug jako klucz, żeby uniknąć duplikatów
            if (!subcategoriesMap.has(cat.slug)) {
              subcategoriesMap.set(cat.slug, { slug: cat.slug, nazwa: cat.nazwa });
            }
          }
        });
      }
    });

    // Zwracamy tablicę obiektów {slug, nazwa} dla łatwiejszego użycia
    const subcategories = subcategoriesMap.size > 0
      ? Array.from(subcategoriesMap.values()).sort((a, b) => a.nazwa.localeCompare(b.nazwa))
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
    <aside className="w-full lg:w-64 shrink-0 rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-[#D2B79B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="font-semibold text-gray-900">Filtry</h2>
      </div>

      {/* Subcategories */}
      {categoryFilters.subcategories && categoryFilters.subcategories.length > 0 && (
        <div className="border-b border-gray-200 pb-3 mb-3">
          <button type="button" className="w-full flex items-center justify-between py-2 text-left font-medium text-gray-800 hover:text-[#D2B79B] transition-colors" onClick={() => toggleSection('subcategory')}>
            <span>Podkategorie</span>
            <svg className={`w-4 h-4 transition-transform ${expandedSections.subcategory ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.subcategory && (
            <div className="pl-2 space-y-1">
              {categoryFilters.subcategories?.map((subcategory) => {
                const isSelected = filters.selectedSubcategories.includes(subcategory.nazwa);
                return (
                  <div key={subcategory.slug} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer ${isSelected ? 'bg-[#D2B79B]/20 text-[#D2B79B]' : 'hover:bg-gray-100'}`} onClick={() => onFiltersChange({ ...filters, selectedSubcategories: toggleFilter(filters.selectedSubcategories, subcategory.nazwa) })}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]" />
                    <span>{subcategory.nazwa}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-3 mb-3">
        <button type="button" className="w-full flex items-center justify-between py-2 text-left font-medium text-gray-800 hover:text-[#D2B79B] transition-colors" onClick={() => toggleSection('price')}>
          <span>Cena</span>
          <svg className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.price && categoryFilters.priceRange && (
          <div className="pl-2 pt-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{filters.priceRange.min} zł</span>
              <span>{filters.priceRange.max} zł</span>
            </div>
            <div className="space-y-2">
              <input type="range" min={categoryFilters.priceRange.min} max={categoryFilters.priceRange.max} value={filters.priceRange.min} onChange={(e) => onFiltersChange({ ...filters, priceRange: { ...filters.priceRange, min: parseInt(e.target.value) } })} className="w-full accent-[#D2B79B]" />
              <input type="range" min={categoryFilters.priceRange.min} max={categoryFilters.priceRange.max} value={filters.priceRange.max} onChange={(e) => onFiltersChange({ ...filters, priceRange: { ...filters.priceRange, max: parseInt(e.target.value) } })} className="w-full accent-[#D2B79B]" />
            </div>
          </div>
        )}
      </div>

      {/* Brands */}
      {categoryFilters.brands && categoryFilters.brands.length > 0 && (
        <div className="border-b border-gray-200 pb-3 mb-3">
          <button type="button" className="w-full flex items-center justify-between py-2 text-left font-medium text-gray-800 hover:text-[#D2B79B] transition-colors" onClick={() => toggleSection('brand')}>
            <span>Marka</span>
            <svg className={`w-4 h-4 transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.brand && (
            <div className="pl-2 space-y-1">
              {categoryFilters.brands.map((brand) => {
                const isSelected = filters.selectedBrands.includes(brand);
                return (
                  <div key={brand} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer ${isSelected ? 'bg-[#D2B79B]/20 text-[#D2B79B]' : 'hover:bg-gray-100'}`} onClick={() => onFiltersChange({ ...filters, selectedBrands: toggleFilter(filters.selectedBrands, brand) })}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]" />
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
        <div className="border-b border-gray-200 pb-3 mb-3">
          <button type="button" className="w-full flex items-center justify-between py-2 text-left font-medium text-gray-800 hover:text-[#D2B79B] transition-colors" onClick={() => toggleSection('size')}>
            <span>Rozmiar</span>
            <svg className={`w-4 h-4 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.size && (
            <div className="pl-2 pt-2">
              <div className="flex flex-wrap gap-2">
                {categoryFilters.sizes.map((size) => {
                  const isSelected = filters.selectedSizes.includes(size);
                  return (
                    <button key={size} type="button" className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors ${isSelected ? 'border-[#D2B79B] bg-[#D2B79B]/20 text-[#D2B79B]' : 'border-gray-300 hover:border-[#D2B79B]'}`} onClick={() => onFiltersChange({ ...filters, selectedSizes: toggleFilter(filters.selectedSizes, size) })}>
                      <input type="checkbox" checked={isSelected} onChange={() => { }} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-[#D2B79B]" />
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
        <div className="border-b border-gray-200 pb-3 mb-3">
          <button type="button" className="w-full flex items-center justify-between py-2 text-left font-medium text-gray-800 hover:text-[#D2B79B] transition-colors" onClick={() => toggleSection('type')}>
            <span>Typ</span>
            <svg className={`w-4 h-4 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.type && (
            <div className="pl-2 space-y-1">
              {categoryFilters.types.map((type) => {
                const isSelected = filters.selectedTypes.includes(type);
                return (
                  <div key={type} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer ${isSelected ? 'bg-[#D2B79B]/20 text-[#D2B79B]' : 'hover:bg-gray-100'}`} onClick={() => onFiltersChange({ ...filters, selectedTypes: toggleFilter(filters.selectedTypes, type) })}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]" />
                    <span>{type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button type="button" className="w-full mt-4 py-2.5 rounded-lg border border-[#D2B79B] text-[#D2B79B] font-medium hover:bg-[#D2B79B]/10 transition-colors"
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

