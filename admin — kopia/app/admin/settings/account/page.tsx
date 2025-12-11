export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ustawienia konta</h1>
        <p className="text-muted-foreground">Zarządzaj profilem, hasłem i preferencjami.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Profil</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Imię</label>
              <input className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" placeholder="Jan" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nazwisko</label>
              <input className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" placeholder="Kowalski" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" placeholder="jan@firma.pl" />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">Zapisz profil</button>
          </div>
        </form>

        <form className="rounded-lg border p-4">
          <h2 className="mb-3 text-base font-medium">Hasło</h2>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Aktualne hasło</label>
              <input type="password" className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nowe hasło</label>
              <input type="password" className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Powtórz hasło</label>
              <input type="password" className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">Zmien hasło</button>
          </div>
        </form>
      </div>
    </div>
  )
}


