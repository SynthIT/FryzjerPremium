export default function ProductsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Produkty</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Dodawaj, edytuj i organizuj produkty.</p>
        </div>
        <a href="/products/new" className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">Dodaj produkt</a>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 text-sm text-muted-foreground">Wkrótce lista produktów z wyszukiwaniem i filtrami.</div>
      </div>
    </div>
  )
}


