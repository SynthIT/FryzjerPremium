import { Promos, Warianty } from "@/lib/models/Products";
import { finalPrice } from "@/lib/utils";

export default function PriceElement({
    cena,
    selectedWariant,
    promocje,
}: {
    cena: number;
    selectedWariant?: Warianty;
    promocje?: Promos;
}) {
    return (
        <div className="product-price-section">
            {promocje && (
                <div className="product-original-price">
                    <span>
                        {selectedWariant?.nadpisuje_cene
                            ? selectedWariant.nowa_cena
                                  ?.toString()
                                  .replace(".", ",")
                            : cena.toString().replace(".", ",")}{" "}
                        zł
                    </span>
                </div>
            )}
            <div className="product-current-price">
                {finalPrice(cena, selectedWariant, promocje)} zł
            </div>
        </div>
    );
}

