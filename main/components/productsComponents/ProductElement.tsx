import { Products } from "@/lib/types/productTypes";
import { Promos } from "@/lib/types/shared";
import { finalPrice, renderStars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ProductElementProps {
    product: Products;
    index: number;
}

export default function ProductElement({ product, index }: ProductElementProps) {
    return (
        <Link
            key={index}
            href={`/produkt/${product.slug}`}
            className="group block rounded-xl overflow-hidden border border-[rgba(212,196,176,0.3)] bg-white/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D2B79B]/40 transition-all duration-300"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.promocje && (
                    <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-[#D2B79B] text-black text-xs font-bold">
                        -{(product.promocje as Promos).procent}%
                    </div>
                )}
                {product.media && Array.isArray(product.media) && product.media.length > 0 && product.media[0]?.path ? (
                    <Image
                        src={product.media[0].path}
                        alt={product.media[0]?.alt || product.nazwa}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-center text-gray-500 text-sm">
                        <span>{product.nazwa}</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#D2B79B] transition-colors">
                    {product.nazwa}
                </h3>
                <div className="mb-2">{renderStars(product.ocena)}</div>
                <div className="flex items-baseline gap-2 flex-wrap">
                    {product.promocje ? (
                        <>
                            <span className="text-sm text-gray-500 line-through">
                                {finalPrice(product.cena, product.vat, undefined, undefined)} zł
                            </span>
                            <span className="font-bold text-[#D2B79B]">
                                {finalPrice(product.cena, product.vat, undefined, product.promocje as Promos)} zł
                                <sub className="text-xs font-normal text-gray-500"> Z VAT</sub>
                            </span>
                        </>
                    ) : (
                        <span className="font-bold text-gray-900">
                            {finalPrice(product.cena, product.vat, undefined, undefined)} zł
                            <sub className="text-xs font-normal text-gray-500"> Z VAT</sub>
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
