import { Products, Promos } from "@/lib/models/Products";
import { renderStars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface RelatedProductProps {
    relatedProduct: Products;
    id: number;
}
export default function RelatedProduct({
    relatedProduct,
    id,
}: RelatedProductProps) {
    return (
        <Link
            key={id}
            href={`/product/${relatedProduct.slug}`}
            className="group block rounded-xl overflow-hidden border border-[rgba(212,196,176,0.3)] bg-white/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {relatedProduct.promocje && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-[#D2B79B] text-black text-xs font-bold">
                            {(relatedProduct.promocje as Promos).procent}%
                        </div>
                    )}
                    {relatedProduct.media && 
                     Array.isArray(relatedProduct.media) && 
                     relatedProduct.media.length > 0 && 
                     relatedProduct.media[0]?.path ? (
                        <Image
                            src={relatedProduct.media[0].path}
                            alt={relatedProduct.media[0]?.alt || relatedProduct.nazwa}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-sm text-gray-500">
                            <span>{relatedProduct.nazwa}</span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#D2B79B]">{relatedProduct.nazwa}</h3>
                    <div className="mb-2">{renderStars(relatedProduct.ocena, 16)}</div>
                    <div className="flex items-baseline gap-2">
                        {relatedProduct.promocje ? (
                            <>
                                <span className="text-sm text-gray-500 line-through">{relatedProduct.cena} zł</span>
                                <span className="font-bold text-[#D2B79B]">
                                    {(relatedProduct.cena - relatedProduct.cena * ((relatedProduct.promocje as Promos).procent! / 100)).toFixed(2)} zł
                                </span>
                            </>
                        ) : (
                            <span className="font-bold text-gray-900">{relatedProduct.cena} zł</span>
                        )}
                    </div>
                </div>
        </Link>
    );
}

