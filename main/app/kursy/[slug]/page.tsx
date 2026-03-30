import KursDetailShopPage from "@/components/kursy/KursDetailShopPage";

export default async function Course({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <KursDetailShopPage courseSlug={slug} />;
}
