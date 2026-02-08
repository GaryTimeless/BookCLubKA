

# 📚 Bücher-Tinder für deinen Buchclub

## Übersicht
Eine mobile-first Web-App, mit der dein Buchclub Bücher vorschlagen, per Swipe bewerten und ein gemeinsames Ranking erstellen kann. Das Ganze mit einem warmen, buchigen Design und flüssigen Swipe-Animationen.

---

## 1. Setup & Design-System
- Warmes Farbschema: Dunkles Beige als Hintergrund, Papierweiß für Karten, Orange als Akzentfarbe
- Mobile-first Layout mit max-width Container
- Framer Motion installieren für Swipe-Animationen
- Abgerundete, weiche UI-Elemente für ein "natives" Gefühl

## 2. Einfache Authentifizierung
- Start-Screen mit Namenseingabe und "Los geht's"-Button
- Name wird im localStorage gespeichert
- Kein Supabase-Auth nötig – rein namensbasiert
- Automatische Weiterleitung wenn Name bereits gespeichert

## 3. Bottom Navigation Bar
- Feste Bottom-Bar mit 3 Tabs: **Vorschlagen**, **Swipen** (Standard), **Ranking**
- Icons + Labels, aktiver Tab hervorgehoben in Orange
- Smooth Tab-Wechsel

## 4. Tab "Vorschlagen" – Bücher hinzufügen
- Suchfeld für Titel/ISBN
- Live-Suche über die **Google Books API**
- Ergebnisliste mit Cover, Titel & Autor
- "Hinzufügen"-Button pro Ergebnis
- Dubletten-Check (Google-ID oder Titel) bevor in Supabase gespeichert wird
- Erfolgsmeldung nach dem Hinzufügen

## 5. Tab "Swipen" – Das Herzstück
- Lädt alle Bücher, die der aktuelle User noch nicht bewertet hat
- **Tinder-Style Kartenstapel** mit Framer Motion Drag-Gestures
- Karte zeigt: großes Cover, Titel, Autor
- Swipe rechts / Herz-Button = Like (+1)
- Swipe links / X-Button = Dislike (-1)
- Visuelle Indikatoren beim Ziehen (grün/rot Overlay)
- "Alle Bücher bewertet!" Ansicht wenn leer

## 6. Tab "Ranking" – Ergebnisse
- Liste aller Bücher, sortiert nach Anzahl Likes (absteigend)
- Jedes Buch zeigt: Cover, Titel, Autor, Like-Anzahl
- Darunter: "Matches: Alex, Sarah, …" (wer geliked hat)

## 7. Supabase Backend
- **Tabelle `books`**: id, google_id (unique), title, author, cover_url, description, suggested_by, created_at
- **Tabelle `votes`**: id, book_id (FK → books), user_name, vote_value (1 oder -1), created_at
- Unique Constraint auf (book_id + user_name) um Doppel-Votes zu verhindern
- RLS-Policies für öffentlichen Lese-/Schreibzugriff (da keine Auth)

