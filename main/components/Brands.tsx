import { Producents, Products } from "@/lib/types/productTypes";
import Link from "next/link";

export default function Brands({
    data,
}: {
    data?: { products: Products[]; producents: Producents[] };
}) {
    const brands = () => {
        const brandSet = new Set<string>();
        data?.products?.forEach((product) => {
            if (product.producent) {
                brandSet.add(
                    JSON.stringify({
                        nazwa: (product.producent as Producents).nazwa,
                        strona: (product.producent as Producents).strona_internetowa || "",
                    }),
                );
            }
        });
        return Array.from(brandSet.values()).map((brand) => JSON.parse(brand));
    };

    return (
        <div className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[rgba(212,196,176,0.2)]">
            <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-6">
                {brands().map((brand, index) => (
                    <Link
                        href={brand.strona}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                        className="px-6 py-3 rounded-xl border border-[rgba(212,196,176,0.4)] bg-white/50 text-gray-800 font-medium hover:border-[#D2B79B] hover:text-[#D2B79B] hover:bg-white/80 transition-colors"
                    >
                        {brand.nazwa}
                    </Link>
                ))}
            </div>
        </div>
    );
}
