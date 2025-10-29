export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kategorie</h1>
          <p className="text-muted-foreground">Zarządzaj głównymi kategoriami katalogu.</p>
        </div>
        <button className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">Dodaj kategorię</button>
      </div>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">Brak kategorii — dodaj pierwszą.</div>
    </div>
  )
}


