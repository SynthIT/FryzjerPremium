import StorefrontShell from "@/components/layout/StorefrontShell";
import PomocTechnicznaPageView from "@/components/pomoc-techniczna/PomocTechnicznaPageView";

export const metadata = {
    title: "Pomoc Techniczna - Fryzjerpremium.pl",
    description: "Skontaktuj się z naszym zespołem pomocy technicznej",
};

export default function TechnicalSupportPage() {
    return (
        <StorefrontShell>
            <PomocTechnicznaPageView />
        </StorefrontShell>
    );
}
