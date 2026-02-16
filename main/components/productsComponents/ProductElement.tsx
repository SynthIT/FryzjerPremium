import { Products } from "@/lib/types/productTypes";
import { Promos } from "@/lib/types/shared";

import { finalPrice, renderStars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ProductElementProps {
    product: Products;
    index: number;
}

export default function ProductElement({
    product,
    index,
}: ProductElementProps) {
    return (
        <Link
            key={index}
            href={`/product/${product.slug}`}
            className="product-card-listing">
            <div className="product-image-wrapper-listing">
                {product.promocje && (
                    <div className="product-discount-badge">
                        -{(product.promocje as Promos).procent}%
                    </div>
                )}
                {product.media && 
                 Array.isArray(product.media) && 
                 product.media.length > 0 && 
                 product.media[0]?.path ? (
                    <Image
                        src={product.media[0].path}
                        alt={product.media[0]?.alt || product.nazwa}
                        width={300}
                        height={300}
                        className="product-image-listing"
                    />
                ) : (
                    <div className="product-placeholder-listing">
                        <span>{product.nazwa}</span>
                    </div>
                )}
            </div>

            <div className="product-info-listing">
                <h3 className="product-name-listing">{product.nazwa}</h3>
                {renderStars(product.ocena)}
                <div className="product-price-listing">
                    {product.promocje ? (
                        <>
                            <span className="product-original-price">
                                {finalPrice(product.cena, product.vat, undefined, undefined)} zł
                            </span>
                            <span className="product-current-price">
                                {finalPrice(product.cena, product.vat, undefined, product.promocje as Promos)}
                                zł<sub>Z VAT</sub>
                            </span>
                        </>
                    ) : (
                        <span className="product-current-price">
                            {finalPrice(product.cena, product.vat, undefined, undefined)} zł
                            <sub>Z VAT</sub>
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

