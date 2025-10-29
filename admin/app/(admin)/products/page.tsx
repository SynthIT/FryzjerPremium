export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produkty</h1>
          <p className="text-muted-foreground">Dodawaj, edytuj i organizuj produkty.</p>
        </div>
        <a href="/products/new" className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">Dodaj produkt</a>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 text-sm text-muted-foreground">Wkrótce lista produktów z wyszukiwaniem i filtrami.</div>
      </div>
    </div>
  )
}


