import { Products, Promos, Warianty } from "@/lib/models/Products";
import { cenabezvat, finalPrice } from "@/lib/utils";

export default function PriceElement({
    product,
    selectedWariant,
    promocje,
}: {
    product: Products;
    selectedWariant?: Warianty;
    promocje?: Promos;
}) {
    const price = finalPrice(product.cena, selectedWariant, promocje)
        .toString()
        .replace(".", ",");
    return (
        <div className="product-price-section flex flex-col">
            <p>{cenabezvat(product.cena, product.vat, selectedWariant)} zł</p>
            {promocje && (
                <div className="product-original-price">
                    <span>
                        {selectedWariant?.nadpisuje_cene
                            ? selectedWariant.nowa_cena
                                  ?.toString()
                                  .replace(".", ",")
                            : product.cena.toString().replace(".", ",")}{" "}
                        zł
                    </span>
                </div>
            )}
            <div className="product-current-price">
                {price} zł <sub>Z VAT</sub>
            </div>
        </div>
    );
}

