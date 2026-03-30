import ProduktyShopPage from "@/components/produkty/ProduktyShopPage";

export default async function CategoryProductsPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    return <ProduktyShopPage categoryName={category} />;
}
