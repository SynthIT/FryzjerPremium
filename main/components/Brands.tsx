import "@/app/globals.css";
import { Producents, Products } from "@/lib/types/productTypes";
import Link from "next/link";

export default function Brands({
    data,
}: {
    data: { products: Products[]; producents: Producents[] };
}) {
    const brands = () => {
        const brandSet = new Set<string>();
        data.products?.forEach((product) => {
            if (product.producent) {
                brandSet.add(
                    JSON.stringify({
                        nazwa: (product.producent as Producents).nazwa,
                        strona:
                            (product.producent as Producents)
                                .strona_internetowa || "",
                    }),
                );
            }
        });
        return Array.from(brandSet.values()).map((brand) => JSON.parse(brand));
    };

    return (
        <div className="brands-section">
            <div className="brands-container">
                {brands().map((brand, index) => (
                    <Link
                        href={brand.strona}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}>
                        <div key={index} className="brand-name">
                            {brand.nazwa}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
