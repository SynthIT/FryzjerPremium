'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCategories() {
  const categories = [
    { id: 1, name: 'Kosmetyki', image: '' },
    { id: 2, name: 'Sprzęty', image: '' },
    { id: 3, name: 'Meble', image: '' },
    { id: 4, name: 'Szkolenia', image: '' },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8" id="product-categories-section">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl font-bold text-black mb-10 pb-3 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-14 after:h-0.5 after:bg-[#D2B79B] after:rounded">
          Odkryj produkty w swoim stylu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${encodeURIComponent(category.name.toLowerCase())}`}
              className="group block rounded-xl overflow-hidden border border-[rgba(212,196,176,0.3)] bg-white/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D2B79B]/40 transition-all duration-300"
            >
              <div className="aspect-[4/3] flex items-center justify-center bg-[#f0e8dd] group-hover:bg-[#e5d4c4] transition-colors">
                {category.image ? (
                  <Image src={category.image} alt={category.name} width={400} height={300} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-gray-700 group-hover:text-[#D2B79B] transition-colors">{category.name}</span>
                )}
              </div>
              <h3 className="p-4 font-semibold text-gray-900 group-hover:text-[#D2B79B] transition-colors">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
