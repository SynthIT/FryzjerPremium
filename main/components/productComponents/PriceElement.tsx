import { Products, Warianty } from "@/lib/types/productTypes";
import { Promos } from "@/lib/types/shared";
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
    const price = finalPrice(product.cena, product.vat, selectedWariant, promocje) + " zł"
    return (
        <div className="flex flex-col gap-2">
            <p>Cena bez VAT: {finalPrice(product.cena, 0, selectedWariant, promocje)}</p>
            {promocje && (
                <div className="text-sm text-gray-500 line-through">
                    <span>
                        {selectedWariant?.nadpisuje_cene
                            ? finalPrice(product.cena, product.vat, selectedWariant, promocje)
                            : finalPrice(product.cena, product.vat, undefined, undefined)
                            + " zł"}{" "}
                        zł<sub>Z VAT</sub>
                    </span>
                </div>
            )}
            <div className="text-xl font-bold text-[#D2B79B]">
                {finalPrice(product.cena, product.vat, selectedWariant, promocje) + " zł"} <sub>Z VAT</sub>
            </div>
        </div>
    );
}

