# Skrypty pomocnicze

## Tworzenie przykładowego szkolenia

Aby utworzyć przykładowe szkolenie w bazie danych, uruchom:

```bash
npm run create-example-course
```

Lub bezpośrednio:

```bash
npx tsx scripts/create-example-course.ts
```

### Co robi skrypt:

1. Łączy się z bazą danych MongoDB (`mongodb://localhost:27017/fryzjerpremium`)
2. Sprawdza czy istnieje firma "Akademia Fryzjerstwa Premium", jeśli nie - tworzy ją
3. Pobiera pierwszą dostępną kategorię z bazy danych
4. Tworzy przykładowe szkolenie "Kompleksowy kurs strzyżenia męskiego" z:
   - Pełnym opisem
   - 3 opiniami użytkowników
   - Wszystkimi polami specyficznymi dla szkoleń (czas trwania, poziom, liczba lekcji, instruktor, etc.)
   - 3 zdjęciami w galerii

### Wymagania:

- MongoDB musi być uruchomione i dostępne na `localhost:27017`
- W bazie danych musi istnieć przynajmniej jedna kategoria
- Jeśli szkolenie już istnieje (po slug), zostanie usunięte i utworzone na nowo

### Po utworzeniu:

Szkolenie będzie dostępne:
- W panelu admina: `/admin/courses`
- Na stronie sklepu: `/courses/kompleksowy-kurs-strzyzenia-meskiego`
