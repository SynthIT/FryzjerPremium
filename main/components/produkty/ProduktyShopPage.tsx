import StorefrontShell from "@/components/layout/StorefrontShell";
import ProductsPage from "./ProductsPage";

export default function ProduktyShopPage({ categoryName }: { categoryName?: string }) {
    return (
        <StorefrontShell>
            <ProductsPage categoryName={categoryName} />
        </StorefrontShell>
    );
}
