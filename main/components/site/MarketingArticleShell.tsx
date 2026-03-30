import type { ReactNode } from "react";
import {
    marketingPageContainer,
    marketingPageContent,
    marketingPageText,
    marketingPageTitle,
} from "./marketingPageClasses";

export default function MarketingArticleShell({
    title,
    children,
    bodyClassName = marketingPageText,
}: {
    title: string;
    children: ReactNode;
    /** Domyślnie `marketingPageText`; np. `marketingPageTextWithLists` dla list. */
    bodyClassName?: string;
}) {
    return (
        <main className={marketingPageContainer}>
            <div className={marketingPageContent}>
                <h1 className={marketingPageTitle}>{title}</h1>
                <div className={bodyClassName}>{children}</div>
            </div>
        </main>
    );
}
