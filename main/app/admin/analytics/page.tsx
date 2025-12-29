export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analityka</h1>
        <p className="text-muted-foreground">Wgląd w sprzedaż, ruch i skuteczność kampanii.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border p-4 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-medium">Przychód (30 dni)</h2>
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">Eksportuj</button>
          </div>
          <div className="h-64 w-full rounded-md bg-linear-to-br from-zinc-900/5 to-zinc-500/5" />
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-base font-medium">Konwersja</h2>
          <div className="h-64 w-full rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}


