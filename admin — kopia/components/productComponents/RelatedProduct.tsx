import { Products, Promos } from "@/lib/models/Products";
import { renderStars } from "@/lib/utils";
import { Link } from "lucide-react";
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
            className="related-product-card-link">
            <div className="related-product-card">
                <div className="related-product-image-wrapper">
                    {relatedProduct.promocje && (
                        <div className="product-discount-badge">
                            {(relatedProduct.promocje as Promos).procent}%
                        </div>
                    )}
                    {relatedProduct.media ? (
                        <Image
                            src={relatedProduct.media[0].path}
                            alt={relatedProduct.media[0].alt}
                            width={300}
                            height={300}
                            className="related-product-image"
                        />
                    ) : (
                        <div className="related-product-placeholder">
                            <span>{relatedProduct.nazwa}</span>
                        </div>
                    )}
                </div>
                <div className="related-product-info">
                    <h3 className="related-product-name">
                        {relatedProduct.nazwa}
                    </h3>
                    <div className="related-product-rating">
                        {renderStars(relatedProduct.ocena, 16)}
                    </div>
                    <div className="related-product-price">
                        {relatedProduct.promocje && (
                            <span className="related-product-original-price">
                                {relatedProduct.cena} zł
                            </span>
                        )}
                        <span className="related-product-current-price">
                            {relatedProduct.cena -
                                relatedProduct.cena *
                                    (relatedProduct.promocje as Promos)
                                        .procent}{" "}
                            zł
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

