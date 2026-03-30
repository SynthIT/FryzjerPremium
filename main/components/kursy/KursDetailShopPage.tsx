import StorefrontShell from "@/components/layout/StorefrontShell";
import CourseDetailPage from "./CourseDetailPage";

export default function KursDetailShopPage({ courseSlug }: { courseSlug: string }) {
    return (
        <StorefrontShell>
            <CourseDetailPage courseSlug={courseSlug} />
        </StorefrontShell>
    );
}
