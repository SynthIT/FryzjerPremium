'use client';

import { useState, useMemo, useCallback } from 'react';
import { Courses, Firmy } from "@/lib/types/coursesTypes";
import { Categories } from "@/lib/types/shared";
import { finalPrice } from '@/lib/utils';

export interface CourseFiltersState {
  priceRange: { min: number; max: number };
  selectedCategories: string[];
  selectedCompanies: string[];
}

interface CoursesFiltersSidebarProps {
  courses: Courses[];
  filters: CourseFiltersState;
  onFiltersChange: (filters: CourseFiltersState) => void;
}

function getCategoryName(cat: string | Categories): string {
  if (typeof cat === 'string') return cat;
  return (cat as Categories).nazwa ?? '';
}

function getCategorySlug(cat: string | Categories): string {
  if (typeof cat === 'string') return cat;
  return (cat as Categories).slug ?? (cat as Categories).nazwa ?? '';
}

function getFirmaName(firma: string | Firmy): string {
  if (typeof firma === 'string') return firma;
  return (firma as Firmy).nazwa ?? '';
}

function getFirmaSlug(firma: string | Firmy): string {
  if (typeof firma === 'string') return firma;
  return (firma as Firmy).slug ?? (firma as Firmy).nazwa ?? '';
}

export default function CoursesFiltersSidebar({ courses, filters, onFiltersChange }: CoursesFiltersSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<{ price: boolean; category: boolean; company: boolean }>({
    price: false,
    category: false,
    company: false,
  });

  const { priceRange, categories, companies } = useMemo(() => {
    const prices = courses.map((c) => c.cena ?? 0).filter((p) => p >= 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 5000;
    const priceRange = { min: Math.max(0, Math.floor(minPrice)), max: Math.ceil(maxPrice) };

    const categoriesMap = new Map<string, string>();
    courses.forEach((course) => {
      const kats = course.kategoria;
      if (kats && Array.isArray(kats)) {
        kats.forEach((cat) => {
          const name = getCategoryName(cat);
          const slug = getCategorySlug(cat);
          if (name && slug && !categoriesMap.has(slug)) {
            categoriesMap.set(slug, name);
          }
        });
      }
    });
    const categories = categoriesMap.size > 0
      ? Array.from(categoriesMap.entries()).map(([slug, nazwa]) => ({ slug, nazwa })).sort((a, b) => a.nazwa.localeCompare(b.nazwa))
      : null;

    const companiesMap = new Map<string, string>();
    courses.forEach((course) => {
      const firma = course.firma;
      if (firma) {
        const name = getFirmaName(firma);
        const slug = getFirmaSlug(firma);
        if (name && slug && !companiesMap.has(slug)) {
          companiesMap.set(slug, name);
        }
      }
    });
    const companies = companiesMap.size > 0
      ? Array.from(companiesMap.entries()).map(([slug, nazwa]) => ({ slug, nazwa })).sort((a, b) => a.nazwa.localeCompare(b.nazwa))
      : null;

    return { priceRange, categories, companies };
  }, [courses]);

  const toggleSection = useCallback((section: 'price' | 'category' | 'company') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleCategory = useCallback((nazwa: string): string[] => {
    if (filters.selectedCategories.includes(nazwa)) {
      return filters.selectedCategories.filter((c) => c !== nazwa);
    }
    return [...filters.selectedCategories, nazwa];
  }, [filters.selectedCategories]);

  const toggleCompany = useCallback((nazwa: string): string[] => {
    if (filters.selectedCompanies.includes(nazwa)) {
      return filters.selectedCompanies.filter((c) => c !== nazwa);
    }
    return [...filters.selectedCompanies, nazwa];
  }, [filters.selectedCompanies]);

  const clearFilters = useCallback(() => {
    onFiltersChange({
      priceRange,
      selectedCategories: [],
      selectedCompanies: [],
    });
  }, [onFiltersChange, priceRange]);

  return (
    <aside className="w-full lg:w-64 shrink-0 rounded-lg border border-gray-200 bg-white p-5 h-fit">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="text-base font-semibold text-gray-900">Filtry</h2>
      </div>

      {/* Cena */}
      <div className="border-b border-gray-200 pb-3 mb-3">
        <button type="button" className="w-full flex items-center justify-between py-2 text-left text-base font-medium text-gray-800 hover:text-gray-600 transition-colors" onClick={() => toggleSection('price')}>
          <span>Cena</span>
          <svg className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.price && (
          <div className="pl-2 pt-2">
            <div className="flex justify-between text-base text-gray-600 mb-2">
              <span>{finalPrice(filters.priceRange.min, 24).split('.')[0]} zł</span>
              <span>{finalPrice(filters.priceRange.max, 24).split('.')[0]} zł</span>
            </div>
            <div className="space-y-2">
              <input type="range" min={priceRange.min} max={priceRange.max} value={filters.priceRange.min} onChange={(e) => onFiltersChange({ ...filters, priceRange: { ...filters.priceRange, min: parseInt(e.target.value, 10) } })} className="w-full accent-[#D2B79B]" />
              <input type="range" min={priceRange.min} max={priceRange.max} value={filters.priceRange.max} onChange={(e) => onFiltersChange({ ...filters, priceRange: { ...filters.priceRange, max: parseInt(e.target.value, 10) } })} className="w-full accent-[#D2B79B]" />
            </div>
          </div>
        )}
      </div>

      {/* Kategoria */}
      {categories && categories.length > 0 && (
        <div className="border-b border-gray-200 pb-3 mb-3">
          <button type="button" className="w-full flex items-center justify-between py-2 text-left text-base font-medium text-gray-800 hover:text-gray-600 transition-colors" onClick={() => toggleSection('category')}>
            <span>Kategoria</span>
            <svg className={`w-5 h-5 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.category && (
            <div className="pl-2 space-y-1.5">
              {categories.map((cat) => {
                const isSelected = filters.selectedCategories.includes(cat.nazwa);
                return (
                  <div key={cat.slug} className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer text-[15px] ${isSelected ? 'bg-[#D2B79B]/20 text-[#D2B79B]' : 'hover:bg-gray-100'}`} onClick={() => onFiltersChange({ ...filters, selectedCategories: toggleCategory(cat.nazwa) })}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]" />
                    <span>{cat.nazwa}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Firma */}
      {companies && companies.length > 0 && (
        <div className="border-b border-gray-200 pb-3 mb-3">
          <button type="button" className="w-full flex items-center justify-between py-2 text-left text-base font-medium text-gray-800 hover:text-gray-600 transition-colors" onClick={() => toggleSection('company')}>
            <span>Firma</span>
            <svg className={`w-5 h-5 transition-transform ${expandedSections.company ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.company && (
            <div className="pl-2 space-y-1.5">
              {companies.map((company) => {
                const isSelected = filters.selectedCompanies.includes(company.nazwa);
                return (
                  <div key={company.slug} className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer text-[15px] ${isSelected ? 'bg-[#D2B79B]/20 text-[#D2B79B]' : 'hover:bg-gray-100'}`} onClick={() => onFiltersChange({ ...filters, selectedCompanies: toggleCompany(company.nazwa) })}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]" />
                    <span>{company.nazwa}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button type="button" className="w-full mt-5 py-2.5 rounded-lg bg-[#D2B79B] text-gray-900 font-medium text-base hover:bg-[#c4a882] transition-colors" onClick={clearFilters}>
        Wyczyść filtry
      </button>
    </aside>
  );
}
