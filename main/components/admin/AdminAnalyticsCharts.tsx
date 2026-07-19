export default function AdminAnalyticsCharts({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">{children}</div>
    );
}
