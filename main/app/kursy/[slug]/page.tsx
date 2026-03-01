import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoursePage from "@/components/CoursePage";

export default async function Course({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <>
            <Header />
            <CoursePage courseSlug={slug} />
            <Footer />
        </>
    );
}
