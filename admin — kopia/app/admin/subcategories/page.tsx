export default function SubcategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Podkategorie</h1>
          <p className="text-muted-foreground">Grupuj produkty w strukturę kategorii.</p>
        </div>
        <button className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">Dodaj podkategorię</button>
      </div>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">Wkrótce hierarchia kategorii.</div>
    </div>
  )
}


