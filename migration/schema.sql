-- Propozycja schematu Supabase (PostgreSQL) dla FryzjerPremium
-- Uruchom w SQL Editor Supabase po dostosowaniu do projektu.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE producents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    nazwa TEXT NOT NULL UNIQUE,
    slug TEXT,
    strona_internetowa TEXT,
    logo JSONB,
    opis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    nazwa TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL,
    type TEXT CHECK (type IN ('product', 'course')),
    kategoria TEXT,
    image JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    nazwa TEXT NOT NULL UNIQUE,
    procent NUMERIC(5,2) DEFAULT 0,
    special JSONB,
    rozpoczecie TIMESTAMPTZ NOT NULL,
    wygasa TIMESTAMPTZ NOT NULL,
    aktywna BOOLEAN
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    nazwa TEXT NOT NULL UNIQUE,
    cena_skupu NUMERIC(12,2) NOT NULL,
    cena NUMERIC(12,2) NOT NULL,
    dostepnosc TEXT NOT NULL,
    kategoria_ids UUID[] DEFAULT '{}',
    producent_id UUID REFERENCES producents(id),
    media JSONB DEFAULT '[]',
    promocje_id UUID REFERENCES promos(id),
    specyfikacja JSONB DEFAULT '[]',
    opis TEXT NOT NULL,
    ilosc INTEGER NOT NULL DEFAULT 0,
    czas_wysylki INTEGER NOT NULL,
    kod_produkcyjny TEXT NOT NULL,
    ocena NUMERIC(3,2) DEFAULT 0,
    opinie JSONB,
    vat NUMERIC(5,2) DEFAULT 23,
    wariant JSONB DEFAULT '[]',
    sku TEXT NOT NULL UNIQUE,
    kod_ean TEXT,
    aktywne BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    nazwa TEXT NOT NULL UNIQUE,
    uzytkownik INTEGER DEFAULT 0,
    admin INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    imie TEXT NOT NULL,
    nazwisko TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    haslo TEXT NOT NULL,
    nr_domu TEXT NOT NULL,
    nr_lokalu TEXT,
    ulica TEXT NOT NULL,
    miasto TEXT NOT NULL,
    kraj TEXT NOT NULL,
    kod_pocztowy TEXT NOT NULL,
    telefon TEXT NOT NULL,
    nip TEXT,
    faktura BOOLEAN DEFAULT FALSE,
    osoba_prywatna BOOLEAN DEFAULT TRUE,
    role_ids UUID[] DEFAULT '{}',
    stripe_id TEXT,
    verified_email BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    nazwa TEXT NOT NULL,
    cena NUMERIC(12,2) NOT NULL,
    vat NUMERIC(5,2) DEFAULT 23,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    nr_zam TEXT UNIQUE,
    user_id UUID REFERENCES users(id),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    nazwa TEXT NOT NULL,
    slug TEXT,
    strona_internetowa TEXT,
    rozmiary JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id TEXT UNIQUE,
    user_id UUID REFERENCES users(id),
    tresc TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_producent ON products(producent_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_categories_type ON categories(type);
