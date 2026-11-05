# Start-up- & Event-Radar

Statische Webseite mit Start-up- und Netzwerkveranstaltungen sowie passenden Start-ups rund um Dach, Solar, Bau, Handwerk und Fertigung. Läuft auf GitHub Pages – ohne Server, ohne Konto, ohne Cookies und ohne Tracking. Nur der Bereich „Intern“ ist mit einem Passwort geschützt.

**Seite:** https://fcypkszck7-web.github.io/startup-radar/

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html`, `assets/style.css`, `assets/app.js` | Seite, Gestaltung und Logik (Radar, Zeitstrahl, Kalender, Filter, Suche, Merkliste, Downloads) |
| `assets/radar.js`, `assets/karte.js` | Animiertes Radar (auf der Übersicht als gekippter 3D-Lagetisch mit Lichtsäulen, umschaltbar auf Draufsicht); vorberechnete Europa-Umrisse (Natural Earth, gemeinfrei) |
| `assets/motive.js` | Erzeugte Materialbilder je Branche (Dachziegel, Solarmodul, Sichtbeton …) als Titelbilder der Detailansicht – reines SVG, keine Fotos, keine externen Dateien |
| `assets/export.js` | Kalender-, Excel- und CSV-Export im Browser |
| `assets/fonts/` | Schrift Barlow (SIL Open Font License), lokal eingebunden |
| `data/events.json` | Veranstaltungen – Quelle der Wahrheit |
| `data/startups.json` | Start-ups (Ostbayern, Bayern, Deutschland, Europa) – Quelle der Wahrheit |
| `data/runden.json` | Öffentlich bekannte Finanzierungsrunden, Übernahmen und neue Fonds (Bereich „Kapital“) |
| `data/investoren.json` | Profile von Investoren mit Fokus auf Bau, Energie und Industrie |
| `assets/logos/` | Logos der Start-ups, automatisch von deren Websites geholt (siehe unten) |
| `data/meta.json` | Stand-Datum und Liste der letzten Änderungen |
| `data/hinweise.json` | Wochenhinweise (erscheinen auf der Startseite und im Feed) |
| `events.ics` | Kalender-Abo aller kommenden Termine (wird erzeugt) |
| `feed.xml` | RSS-Feed der Wochenhinweise für die E-Mail-Benachrichtigung (wird erzeugt) |
| `tools/build.py` | Prüft die Daten, berechnet Scores, Prioritäten und Koordinaten, erzeugt `events.ics` und `feed.xml` |
| `tools/orte.json` | Koordinaten der Veranstaltungsorte für das Radar – neue Orte hier ergänzen |
| `data/intern.json` | Geschützter Bereich „Intern“ – verschlüsselt (AES-256-GCM, Schlüssel per PBKDF2 aus dem Passwort); wird erst im Browser nach Eingabe des Passworts entschlüsselt |
| `tools/intern.mjs` | Verschlüsselt den Bereich „Intern“; Schlüssel nur über die Umgebungsvariable `INTERN_SCHLUESSEL`, Klartext nie im Repository |
| `tools/abruf.py`, `tools/quellen.json` | Nächtlicher Abruf der Veranstalterkalender und Start-up-Listen (GitHub-Workflow „Kalender und Listen abrufen“); beachtet robots.txt |
| `tools/rendern.py` | Lädt Kalender, die erst per JavaScript entstehen, in einem Headless-Browser (Quellen mit `"rendern": true`); keine Anmeldung, kein Umgehen von Sperren oder Bot-Schutz |

Bei Aktualisierungen ändern sich nur die Dateien in `data/` sowie `events.ics` und `feed.xml`.

## Bewertung

Veranstaltungen: Relevanz 40 %, Zugang zu Start-ups/Entscheidern/Investoren 30 %, Aufwand 20 % (5 = gering), Verlässlichkeit 10 %. Priorität A ab 4,0, B 3,0–3,9, C unter 3,0.
Start-ups: A bei Relevanz ≥ 4 und Aufwand ≤ 3, B bei Relevanz ≥ 3, sonst C. Quick Win = Relevanz ≥ 4 und Aufwand ≤ 2.

## Aktualisieren

```bash
python3 tools/build.py                 # prüfen und Dateien erzeugen
python3 tools/build.py --hinweis       # zusätzlich Wochenhinweis anlegen, wenn etwas ansteht
python3 tools/build.py --stand --aenderung "…" --aenderung "…"   # Stand und Änderungsliste setzen
python3 tools/build.py --sperrwort "…"     # bricht ab, wenn ein nicht-öffentliches Wort in den Daten steht
```

Meldet das Skript „Ort ohne Koordinaten“, den Ort mit Breiten- und Längengrad in `tools/orte.json` ergänzen.

Vergangene Veranstaltungen wandern automatisch ins Archiv (auf der Seite sofort, in den Daten beim nächsten Build).

## Logos

Die Logos holt der GitHub-Workflow „Logos holen“ (`.github/workflows/logos.yml`, Skript `tools/logos.py`) von der jeweiligen Website des Start-ups, sobald sich `data/startups.json` ändert. Sie liegen danach in `assets/logos/` und werden von hier ausgeliefert – Besucher der Seite verbinden sich nie mit fremden Servern. Ohne Website oder brauchbares Logo zeigt die Seite ein farbiges Kürzel. Ein bestimmtes Logo lässt sich über das Feld `logo_url` erzwingen.

## Von Hand hochladen (falls nötig, ca. 2 Minuten)

1. Auf github.com einloggen und das Repository `startup-radar` öffnen.
2. In den Ordner `data` klicken → oben rechts **Add file** → **Upload files**.
3. Die neuen Dateien (`events.json`, `startups.json`, `meta.json`, `hinweise.json`) in das Fenster ziehen.
4. Unten **Commit changes** klicken.
5. Zurück zur Startseite des Repositorys und dort genauso `events.ics` und `feed.xml` hochladen.

Nach etwa einer Minute ist die Seite aktualisiert.
