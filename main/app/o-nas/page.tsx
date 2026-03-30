import StorefrontShell from "@/components/layout/StorefrontShell";
import AboutPageView from "@/components/o-nas/AboutPageView";

export const metadata = {
    title: "O nas - Fryzjerpremium.pl",
    description: "Poznaj naszą historię i misję",
};

export default function AboutPage() {
    return (
        <StorefrontShell>
            <AboutPageView />
        </StorefrontShell>
    );
}
