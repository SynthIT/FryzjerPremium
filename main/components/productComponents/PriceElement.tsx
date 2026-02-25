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
    const specialPromo = promocje?.special;

    if (specialPromo) {
        if (specialPromo.obnizka) {
            const cena = product.cena - (product.cena * specialPromo.obnizka) / 100;
            return (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col ">
                        <p className="text-md text-red-500">Cena bez VAT: {cena} przy zakupie od {specialPromo.warunek} sztuk</p>
                        <p className="text-md text-red-500">{finalPrice(product.cena, product.vat, selectedWariant, promocje) + " zł"} <sub>Z VAT</sub> przy zakupie od {specialPromo.warunek} sztuk</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Cena bez VAT: {product.cena} przy zakupie od 1 sztuki</p>
                        <p className="text-sm text-gray-500">{finalPrice(product.cena, product.vat, undefined, undefined) + " zł"} <sub>Z VAT</sub> przy zakupie od 1 sztuki</p>
                    </div>
                    <div className="text-xl font-bold text-[#D2B79B]">
                    </div>
                    <div className="text-sm font-bold text-[#D2B79B]">
                        <span>
                            {selectedWariant?.nadpisuje_cene
                                ? finalPrice(product.cena, product.vat, selectedWariant, promocje)
                                : finalPrice(product.cena, product.vat, undefined, undefined)
                                + " zł"}{" "}
                            zł<sub>Z VAT</sub>
                        </span>
                    </div>
                </div>
            )
        }
    }
    return (
        <div className="flex flex-col gap-2">
            <p>Cena bez VAT: {product.cena}</p>
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