import StorefrontShell from "@/components/layout/StorefrontShell";
import BlogPageView from "@/components/blog/BlogPageView";

export const metadata = {
    title: "Blog - Fryzjerpremium.pl",
    description: "Najnowsze artykuły i porady z branży fryzjerskiej",
};

export default function BlogPage() {
    return (
        <StorefrontShell>
            <BlogPageView />
        </StorefrontShell>
    );
}
