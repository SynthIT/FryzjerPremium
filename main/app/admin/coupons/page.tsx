export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kupony</h1>
        <p className="text-muted-foreground">Twórz i zarządzaj kodami rabatowymi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Aktywne kupony</div>
          <div className="mt-2 text-2xl font-semibold">24</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Wygasłe</div>
          <div className="mt-2 text-2xl font-semibold">7</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Średnia zniżka</div>
          <div className="mt-2 text-2xl font-semibold">12%</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-base font-medium">Lista kuponów</h2>
          <a href="/products/new" className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">Dodaj kupon</a>
        </div>
        <div className="border-t p-4 text-sm text-muted-foreground">Brak danych — dodaj pierwszy kupon.</div>
      </div>
    </div>
  )
}


