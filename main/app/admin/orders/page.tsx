export default function OrdersPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Zamówienia</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Przeglądaj i zarządzaj zamówieniami klientów.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-3 sm:p-4">
          <div className="text-xs text-muted-foreground sm:text-sm">Dziś</div>
          <div className="mt-2 text-xl font-semibold sm:text-2xl">18</div>
        </div>
        <div className="rounded-lg border p-3 sm:p-4">
          <div className="text-xs text-muted-foreground sm:text-sm">W trakcie</div>
          <div className="mt-2 text-xl font-semibold sm:text-2xl">12</div>
        </div>
        <div className="rounded-lg border p-3 sm:p-4">
          <div className="text-xs text-muted-foreground sm:text-sm">Do wysyłki</div>
          <div className="mt-2 text-xl font-semibold sm:text-2xl">5</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <h2 className="text-sm font-medium sm:text-base">Ostatnie zamówienia</h2>
          <button className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">Filtry</button>
        </div>
        <div className="border-t p-3 text-xs text-muted-foreground sm:p-4 sm:text-sm">Wkrótce pojawi się tabela zamówień.</div>
      </div>
    </div>
  )
}


