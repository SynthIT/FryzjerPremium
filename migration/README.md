# Migracja MongoDB → Supabase (PostgreSQL)

Ten folder zawiera materiały przygotowawcze do ewentualnej migracji ze schematu Mongoose (`main/lib/models`) na relacyjną bazę Supabase.

## Zawartość

| Plik | Opis |
|------|------|
| `schema.sql` | Propozycja tabel PostgreSQL (UUID, JSONB dla zagnieżdżeń) |
| `collection-map.json` | Mapowanie kolekcji Mongo → tabel Supabase |
| `export-mongo.mjs` | Eksport kolekcji do JSON (do uruchomienia lokalnie) |
| `import-supabase.mjs` | Szkielet importu JSON → Supabase (wymaga konfiguracji) |

## Kolejność migracji danych

1. `Producents`, `Categories`
2. `Products` (FK: producent, kategorie)
3. `Users`, `Roles`, `Courses`, `Orders`, `Delivery`, `Promos`, `Notifications`

## Uruchomienie eksportu

```bash
cd migration
MONGODB_URI="mongodb+srv://..." node export-mongo.mjs
```

## Uwagi

- Ceny produktów/kursów w Mongo są przechowywane jako **netto**; brutto liczy `finalPrice()` w aplikacji.
- Pola tablicowe (`wariant`, `media`, `specyfikacja`) w SQL są jako `JSONB`.
- Po migracji zaktualizuj `main/lib/db` (nowy klient Supabase) i zamień wywołania Mongoose w API.
