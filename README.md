# Start-up- & Event-Radar

Statische Webseite mit Start-up- und Netzwerkveranstaltungen sowie passenden Start-ups rund um Dach, Solar, Bau, Handwerk und Fertigung. Läuft auf GitHub Pages – ohne Server, ohne Login, ohne Cookies und ohne Tracking.

**Seite:** https://fcypkszck7-web.github.io/startup-radar/

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html`, `assets/` | Seite, Gestaltung und Logik (Filter, Kalender, Merkliste, Downloads) |
| `data/events.json` | Veranstaltungen – Quelle der Wahrheit |
| `data/startups.json` | Start-ups – Quelle der Wahrheit |
| `data/meta.json` | Stand-Datum und Liste der letzten Änderungen |
| `data/hinweise.json` | Wochenhinweise (erscheinen auf der Startseite und im Feed) |
| `events.ics` | Kalender-Abo aller kommenden Termine (wird erzeugt) |
| `feed.xml` | RSS-Feed der Wochenhinweise für die E-Mail-Benachrichtigung (wird erzeugt) |
| `tools/build.py` | Prüft die Daten, berechnet Scores und Prioritäten, erzeugt `events.ics` und `feed.xml` |

Bei Aktualisierungen ändern sich nur die Dateien in `data/` sowie `events.ics` und `feed.xml`.

## Bewertung

Veranstaltungen: Relevanz 40 %, Zugang zu Start-ups/Entscheidern/Investoren 30 %, Aufwand 20 % (5 = gering), Verlässlichkeit 10 %. Priorität A ab 4,0, B 3,0–3,9, C unter 3,0.
Start-ups: A bei Relevanz ≥ 4 und Aufwand ≤ 3, B bei Relevanz ≥ 3, sonst C. Quick Win = Relevanz ≥ 4 und Aufwand ≤ 2.

## Aktualisieren

```bash
python3 tools/build.py                 # prüfen und Dateien erzeugen
python3 tools/build.py --hinweis       # zusätzlich Wochenhinweis anlegen, wenn etwas ansteht
python3 tools/build.py --stand --aenderung "…" --aenderung "…"   # Stand und Änderungsliste setzen
```

Vergangene Veranstaltungen wandern automatisch ins Archiv (auf der Seite sofort, in den Daten beim nächsten Build).

## Von Hand hochladen (falls nötig, ca. 2 Minuten)

1. Auf github.com einloggen und das Repository `startup-radar` öffnen.
2. In den Ordner `data` klicken → oben rechts **Add file** → **Upload files**.
3. Die neuen Dateien (`events.json`, `startups.json`, `meta.json`, `hinweise.json`) in das Fenster ziehen.
4. Unten **Commit changes** klicken.
5. Zurück zur Startseite des Repositorys und dort genauso `events.ics` und `feed.xml` hochladen.

Nach etwa einer Minute ist die Seite aktualisiert.
