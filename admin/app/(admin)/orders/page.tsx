export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Zamówienia</h1>
        <p className="text-muted-foreground">Przeglądaj i zarządzaj zamówieniami klientów.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Dziś</div>
          <div className="mt-2 text-2xl font-semibold">18</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">W trakcie</div>
          <div className="mt-2 text-2xl font-semibold">12</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Do wysyłki</div>
          <div className="mt-2 text-2xl font-semibold">5</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-base font-medium">Ostatnie zamówienia</h2>
          <button className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">Filtry</button>
        </div>
        <div className="border-t p-4 text-sm text-muted-foreground">Wkrótce pojawi się tabela zamówień.</div>
      </div>
    </div>
  )
}


