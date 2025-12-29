import { Products, Promos } from "@/lib/models/Products";
import { renderStars } from "@/lib/utils";
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
                {product.media ? (
                    <Image
                        src={product.media[0].path}
                        alt={product.media[0].alt}
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
                    {product.promocje && (
                        <span className="product-original-price">
                            {product.cena} zł
                        </span>
                    )}
                    <span className="product-current-price">
                        {(
                            product.cena *
                            ((100 - (product.promocje as Promos).procent) / 100)
                        ).toFixed(2)}{" "}
                        zł
                    </span>
                </div>
            </div>
        </Link>
    );
}

