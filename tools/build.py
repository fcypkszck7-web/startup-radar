#!/usr/bin/env python3
"""Baut die abgeleiteten Dateien des Start-up- & Event-Radars.

Aufruf (im Repository-Ordner):
    python3 tools/build.py                      # prüfen, berechnen, events.ics + feed.xml erzeugen
    python3 tools/build.py --hinweis            # zusätzlich Wochenhinweis anlegen (nur wenn etwas ansteht)
    python3 tools/build.py --stand --aenderung "Text" --aenderung "Text"   # Stand-Datum und Änderungsliste setzen
    python3 tools/build.py --heute 2026-11-02   # Datum für Tests vorgeben
    python3 tools/build.py --sperrwort "Wort"   # bricht ab, wenn das Wort irgendwo in den öffentlichen Daten steht

Nur Python-Standardbibliothek. Quelle der Wahrheit sind data/events.json und data/startups.json.
"""
import argparse
import datetime as dt
import html
import json
import re
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
TZ = ZoneInfo("Europe/Berlin")

GEWICHTE = {"relevanz": 0.4, "zugang": 0.3, "aufwand": 0.2, "verlaesslichkeit": 0.1}
RUBRIKEN = {"region", "de", "eu", "noneu"}
STATUS = {"bestätigt", "geschätzt"}
PFLICHT_EVENT = ["id", "name", "format", "veranstalter", "ort", "land", "region", "rubrik", "start", "ende",
                 "turnus", "zeitraum", "status", "kosten", "zielgruppe", "fokus", "begruendung", "rolle",
                 "scores", "quelle", "geprueft"]
PFLICHT_STARTUP = ["id", "name", "sitz", "region", "land", "gruendung", "loesung", "suchfeld", "mehrwert", "reifegrad",
                   "finanzierung", "anbindung", "kooperation", "relevanz", "aufwand", "quelle", "geprueft"]
SU_REGIONEN = {"Ostbayern", "Bayern", "Deutschland", "Europa"}
PFLICHT_RUNDE = ["id", "datum", "art", "runde", "unternehmen", "sitz", "land", "thema", "betrag", "kurz", "quelle", "geprueft"]
RUNDEN_ARTEN = {"Finanzierungsrunde", "Übernahme", "Fonds"}
PFLICHT_INVESTOR = ["id", "name", "typ", "sitz", "kurz", "phasen", "ticket", "volumen", "themen", "quelle", "geprueft"]
KATEGORIE_REGELN = [
    ("gründungswochenende", "Gründungswochenende & Hackathon"),
    ("hackathon", "Gründungswochenende & Hackathon"),
    ("pitch", "Pitch & Demo Day"),
    ("demo", "Pitch & Demo Day"),
    ("wettbewerb", "Pitch & Demo Day"),
    ("matchmaking", "Matchmaking"),
    ("corporate-meets", "Matchmaking"),
    ("festival", "Start-up-Festival"),
    ("messe", "Messe"),
    ("konferenz", "Konferenz & Kongress"),
    ("kongress", "Konferenz & Kongress"),
    ("innovationstag", "Konferenz & Kongress"),
    ("netzwerk", "Netzwerk"),
    ("barcamp", "Netzwerk"),
    ("innovationswoche", "Netzwerk"),
]


def heute_default():
    return dt.datetime.now(TZ).date()


def d(s):
    return dt.date.fromisoformat(s)


def lade(name, default=None):
    p = DATA / name
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding="utf-8"))


def speichere(name, obj):
    (DATA / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def lade_orte():
    p = ROOT / "tools" / "orte.json"
    if not p.exists():
        return {"online": [], "orte": [], "regionen": []}
    return json.loads(p.read_text(encoding="utf-8"))


def geo_fuer(e, orte):
    """Koordinaten für das Radar: (lat, lon), 'online' oder None (unbekannt)."""
    ort, region = e.get("ort", "").lower(), e.get("region", "").lower()
    if any(w in ort for w in orte.get("online", [])):
        return "online"
    for liste, feld in ((orte.get("orte", []), ort), (orte.get("orte", []), region), (orte.get("regionen", []), ort + " " + region)):
        for name, lat, lon in liste:
            if re.search(r"(?<!\w)" + re.escape(name.lower()) + r"(?!\w)", feld):
                return [lat, lon]
    return None


def texte(obj, pfad=""):
    if isinstance(obj, str):
        yield pfad, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from texte(v, f"{pfad}.{k}" if pfad else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            name = v.get("id") if isinstance(v, dict) and v.get("id") else str(i)
            yield from texte(v, f"{pfad}[{name}]")


def pruefe_sperrwoerter(woerter, quellen, fehler):
    for wort in woerter:
        w = wort.strip().lower()
        if not w:
            continue
        for name, obj in quellen.items():
            for pfad, text in texte(obj):
                if w in text.lower():
                    fehler.append(f"Nicht-öffentliches Wort in {name} → {pfad}")


def kategorie(fmt):
    f = fmt.lower()
    for key, kat in KATEGORIE_REGELN:
        if key in f:
            return kat
    return "Sonstiges"


def prioritaet_event(g):
    return "A" if g >= 4.0 else ("B" if g >= 3.0 else "C")


def prioritaet_startup(rel, aufw):
    if rel >= 4 and aufw <= 3:
        return "A"
    if rel >= 3:
        return "B"
    return "C"


def pruefe_events(events, fehler):
    ids = set()
    for e in events:
        for f in PFLICHT_EVENT:
            if f not in e or e[f] in (None, ""):
                fehler.append(f"Event {e.get('id', '?')}: Feld '{f}' fehlt")
        if e.get("id") in ids:
            fehler.append(f"Event-ID doppelt: {e.get('id')}")
        ids.add(e.get("id"))
        if e.get("rubrik") not in RUBRIKEN:
            fehler.append(f"Event {e.get('id')}: unbekannte Rubrik {e.get('rubrik')}")
        if e.get("status") not in STATUS:
            fehler.append(f"Event {e.get('id')}: Status muss 'bestätigt' oder 'geschätzt' sein")
        try:
            if d(e["ende"]) < d(e["start"]):
                fehler.append(f"Event {e['id']}: Ende vor Start")
            if e.get("anmeldeschluss"):
                d(e["anmeldeschluss"])
        except Exception as ex:  # noqa: BLE001
            fehler.append(f"Event {e.get('id')}: Datumsfehler {ex}")
        sc = e.get("scores", {})
        for k in GEWICHTE:
            v = sc.get(k)
            if not isinstance(v, int) or not 1 <= v <= 5:
                fehler.append(f"Event {e.get('id')}: Score '{k}' muss 1–5 sein")


def pruefe_startups(startups, fehler):
    ids = set()
    for s in startups:
        for f in PFLICHT_STARTUP:
            if f not in s or s[f] in (None, ""):
                fehler.append(f"Start-up {s.get('id', '?')}: Feld '{f}' fehlt")
        if s.get("id") in ids:
            fehler.append(f"Start-up-ID doppelt: {s.get('id')}")
        ids.add(s.get("id"))
        for k in ("relevanz", "aufwand"):
            v = s.get(k)
            if not isinstance(v, int) or not 1 <= v <= 5:
                fehler.append(f"Start-up {s.get('id')}: '{k}' muss 1–5 sein")
        if s.get("region") not in SU_REGIONEN:
            fehler.append(f"Start-up {s.get('id')}: Region muss eine von {sorted(SU_REGIONEN)} sein")


def pruefe_kapital(runden, investoren, startups, fehler):
    ids, su_ids = set(), {s.get("id") for s in startups}
    for r in runden:
        for f in PFLICHT_RUNDE:
            if f not in r or r[f] in (None, ""):
                fehler.append(f"Runde {r.get('id', '?')}: Feld '{f}' fehlt")
        if r.get("id") in ids:
            fehler.append(f"Runden-ID doppelt: {r.get('id')}")
        ids.add(r.get("id"))
        if r.get("art") not in RUNDEN_ARTEN:
            fehler.append(f"Runde {r.get('id')}: art muss eine von {sorted(RUNDEN_ARTEN)} sein")
        if r.get("startup_id") and r["startup_id"] not in su_ids:
            fehler.append(f"Runde {r.get('id')}: startup_id {r['startup_id']} unbekannt")
        if not re.fullmatch(r"\d{4}-\d{2}(-\d{2})?", str(r.get("datum", ""))):
            fehler.append(f"Runde {r.get('id')}: datum als JJJJ-MM oder JJJJ-MM-TT angeben")
    ids = set()
    for i in investoren:
        for f in PFLICHT_INVESTOR:
            if f not in i or i[f] in (None, ""):
                fehler.append(f"Investor {i.get('id', '?')}: Feld '{f}' fehlt")
        if i.get("id") in ids:
            fehler.append(f"Investor-ID doppelt: {i.get('id')}")
        ids.add(i.get("id"))


def verknuepfe_kapital(runden, investoren, startups):
    runden.sort(key=lambda r: r["datum"], reverse=True)
    for s in startups:
        eigene = [r for r in runden if r.get("startup_id") == s["id"] and r["art"] == "Finanzierungsrunde"]
        namen = []
        for r in eigene:
            for n in r.get("lead", []) + r.get("investoren", []):
                if n not in namen:
                    namen.append(n)
        for n in s.get("investoren_weitere", []):
            if n not in namen:
                namen.append(n)
        s["investoren_alle"] = namen
        s["runden_ids"] = [r["id"] for r in eigene]
        s["letzte_runde"] = ({"datum": eigene[0]["datum"], "runde": eigene[0]["runde"], "betrag": eigene[0]["betrag"]} if eigene else None)
    for i in investoren:
        namen = {i["name"].casefold(), *[a.casefold() for a in i.get("aliase", [])]}
        port = []
        for r in runden:
            if r["art"] != "Finanzierungsrunde":
                continue
            if any(n.casefold() in namen for n in r.get("lead", []) + r.get("investoren", [])):
                eintrag = {"unternehmen": r["unternehmen"], "startup_id": r.get("startup_id"), "runde_id": r["id"]}
                if not any(p["unternehmen"] == eintrag["unternehmen"] for p in port):
                    port.append(eintrag)
        i["portfolio"] = port


def berechne(events, startups, heute, orte=None):
    neu_archiviert = []
    ohne_geo = []
    orte = orte or lade_orte()
    for e in events:
        g = geo_fuer(e, orte)
        if g == "online":
            e["geo"] = None
            e["online"] = True
        elif g:
            e["geo"] = g
            e.pop("online", None)
        elif not e.get("geo"):
            e["geo"] = None
            ohne_geo.append(e)
        sc = e["scores"]
        g = sum(sc[k] * w for k, w in GEWICHTE.items())
        e["gesamt"] = round(g + 1e-9, 1)
        e["prioritaet"] = prioritaet_event(e["gesamt"])
        e["kategorie"] = kategorie(e["format"])
        war = e.get("archiv", False)
        e["archiv"] = d(e["ende"]) < heute
        if e["archiv"] and not war:
            neu_archiviert.append(e)
    events.sort(key=lambda e: (e["start"], e["name"]))
    for s in startups:
        g = geo_fuer({"ort": s.get("sitz", ""), "region": s.get("region", "") + " " + s.get("land", "")}, orte)
        s["geo"] = g if isinstance(g, list) else None
        s["prioritaet"] = prioritaet_startup(s["relevanz"], s["aufwand"])
        s["quickwin"] = s["relevanz"] >= 4 and s["aufwand"] <= 2
    startups.sort(key=lambda s: (s["prioritaet"], -s["relevanz"], s["aufwand"], s["name"]))
    return neu_archiviert, ohne_geo


# ---------- iCalendar ----------

def ics_text(s):
    return (str(s).replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,")
            .replace("\r\n", "\\n").replace("\n", "\\n"))


def fold(line):
    raw = line.encode("utf-8")
    if len(raw) <= 75:
        return line
    parts, cur, cur_len, limit = [], "", 0, 75
    for ch in line:
        b = len(ch.encode("utf-8"))
        if cur_len + b > limit:
            parts.append(cur)
            cur, cur_len, limit = ch, b, 74
        else:
            cur += ch
            cur_len += b
    parts.append(cur)
    return "\r\n ".join(parts)


def ics_kalender(events, meta, jetzt_utc):
    stamp = jetzt_utc.strftime("%Y%m%dT%H%M%SZ")
    site = meta.get("site_url", "")
    z = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Start-up- und Event-Radar//DE", "CALSCALE:GREGORIAN",
         "METHOD:PUBLISH", "X-WR-CALNAME:Start-up- & Event-Radar", "X-WR-TIMEZONE:Europe/Berlin",
         "REFRESH-INTERVAL;VALUE=DURATION:PT12H", "X-PUBLISHED-TTL:PT12H"]
    for e in events:
        if e.get("archiv"):
            continue
        z += vevent(e, stamp, site)
    z.append("END:VCALENDAR")
    return "\r\n".join(fold(x) for x in z) + "\r\n"


def vevent(e, stamp, site):
    start = d(e["start"])
    ende = d(e["ende"]) + dt.timedelta(days=1)
    geschaetzt = e["status"] == "geschätzt"
    titel = f"[{e['prioritaet']}] {e['name']}" + (" (Termin geschätzt)" if geschaetzt else "")
    beschr = "\n".join([
        f"{e['format']} · {e['veranstalter']}",
        f"Priorität {e['prioritaet']} (Gesamtscore {str(e['gesamt']).replace('.', ',')})",
        f"Terminstatus: {e['status']}" + (" – bitte vor der Planung prüfen" if geschaetzt else ""),
        f"Warum relevant: {e['begruendung']}",
        f"Empfohlene Rolle: {', '.join(e['rolle'])}",
        f"Anmeldung: {e.get('anmeldung') or 'k. A.'}",
        f"Quelle: {e['quelle']}",
        f"Radar: {site}",
    ])
    v = ["BEGIN:VEVENT", f"UID:{e['id']}@startup-radar", f"DTSTAMP:{stamp}",
         f"DTSTART;VALUE=DATE:{start:%Y%m%d}", f"DTEND;VALUE=DATE:{ende:%Y%m%d}",
         f"SUMMARY:{ics_text(titel)}", f"LOCATION:{ics_text(e['ort'] + ', ' + e['region'])}",
         f"DESCRIPTION:{ics_text(beschr)}", f"URL:{e['quelle']}",
         f"CATEGORIES:{ics_text(e['kategorie'])}",
         "STATUS:" + ("TENTATIVE" if geschaetzt else "CONFIRMED"), "TRANSP:TRANSPARENT"]
    for tage in (30, 7):
        v += ["BEGIN:VALARM", "ACTION:DISPLAY", f"DESCRIPTION:{ics_text(e['name'] + f' in {tage} Tagen')}",
              f"TRIGGER:-P{tage}D", "END:VALARM"]
    v.append("END:VEVENT")
    if e.get("anmeldeschluss"):
        f = d(e["anmeldeschluss"])
        art = e.get("frist_art") or "Anmeldeschluss"
        v += ["BEGIN:VEVENT", f"UID:{e['id']}-frist@startup-radar", f"DTSTAMP:{stamp}",
              f"DTSTART;VALUE=DATE:{f:%Y%m%d}", f"DTEND;VALUE=DATE:{f + dt.timedelta(days=1):%Y%m%d}",
              f"SUMMARY:{ics_text('Frist: ' + e['name'] + ' – ' + art)}",
              f"DESCRIPTION:{ics_text(art + ' für ' + e['name'] + '. Quelle: ' + e['quelle'])}",
              f"URL:{e['quelle']}", "TRANSP:TRANSPARENT",
              "BEGIN:VALARM", "ACTION:DISPLAY", f"DESCRIPTION:{ics_text('Frist in 7 Tagen: ' + e['name'])}",
              "TRIGGER:-P7D", "END:VALARM", "END:VEVENT"]
    return v


# ---------- Wochenhinweis & Feed ----------

def fmt_datum(s):
    x = d(s)
    return f"{x:%d.%m.%Y}"


def zeitraum_text(e):
    if e["start"] == e["ende"]:
        return fmt_datum(e["start"])
    a, b = d(e["start"]), d(e["ende"])
    return f"{a:%d.%m.}–{b:%d.%m.%Y}"


def anstehend(events, heute, tage=30):
    bis = heute + dt.timedelta(days=tage)
    termine = [e for e in events if not e["archiv"] and d(e["start"]) <= bis and d(e["ende"]) >= heute]
    fristen = [e for e in events if e.get("anmeldeschluss") and heute <= d(e["anmeldeschluss"]) <= bis]
    termine.sort(key=lambda e: (e["start"], e["prioritaet"]))
    fristen.sort(key=lambda e: e["anmeldeschluss"])
    return termine, fristen


def baue_hinweis(events, meta, heute):
    termine, fristen = anstehend(events, heute)
    if not termine and not fristen:
        return None
    kw = heute.isocalendar()[1]
    zeilen = ["Hallo,", "",
              "hier der kurze Überblick aus dem Start-up- & Event-Radar für die nächsten 30 Tage:", ""]
    wichtig = [e for e in termine if e["prioritaet"] in ("A", "B")]
    rest = len(termine) - len(wichtig)
    if wichtig:
        zeilen.append("Termine (Priorität A und B):")
        for e in wichtig:
            geschaetzt = " (Termin geschätzt)" if e["status"] == "geschätzt" else ""
            zeilen.append(f"• {zeitraum_text(e)} – {e['name']}, {e['ort']}{geschaetzt} · Priorität {e['prioritaet']}"
                          f" · Empfehlung: {', '.join(e['rolle'])}")
        zeilen.append("")
    if rest:
        zeilen.append(f"Dazu {rest} weitere{'r' if rest == 1 else ''} Termin{'' if rest == 1 else 'e'} mit Priorität C"
                      " (siehe Radar).")
        zeilen.append("")
    if not wichtig and not fristen:
        return None
    if fristen:
        zeilen.append("Fristen:")
        for e in fristen:
            zeilen.append(f"• {fmt_datum(e['anmeldeschluss'])} – {e['name']}: {e.get('frist_art') or 'Anmeldeschluss'}")
        zeilen.append("")
    zeilen += ["Alle Details, Kalender-Downloads und die Excel-Liste:", meta.get("site_url", ""), "", "Viele Grüße"]
    return {"datum": heute.isoformat(),
            "titel": f"Start-up- & Event-Radar: Was in den nächsten 30 Tagen ansteht (KW {kw})",
            "text": "\n".join(zeilen)}


def rfc822(datum):
    x = dt.datetime.combine(d(datum), dt.time(7, 0), TZ)
    return x.strftime("%a, %d %b %Y %H:%M:%S %z")


def feed_xml(hinweise, meta):
    site = meta.get("site_url", "")
    items = []
    for h in sorted(hinweise, key=lambda h: h["datum"], reverse=True)[:20]:
        body = "".join(f"<p>{html.escape(p).replace(chr(10), '<br>')}</p>" for p in h["text"].split("\n\n"))
        items.append(
            "<item>"
            f"<title>{html.escape(h['titel'])}</title>"
            f"<link>{html.escape(site)}</link>"
            f"<guid isPermaLink=\"false\">startup-radar-hinweis-{h['datum']}</guid>"
            f"<pubDate>{rfc822(h['datum'])}</pubDate>"
            f"<description>{html.escape(body)}</description>"
            "</item>")
    last = rfc822(max([h["datum"] for h in hinweise], default=meta.get("stand", "2026-01-01")))
    return ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            "<rss version=\"2.0\"><channel>"
            "<title>Start-up- &amp; Event-Radar – Wochenhinweise</title>"
            f"<link>{html.escape(site)}</link>"
            "<description>Kurzer Hinweis, wenn in den nächsten 30 Tagen Termine oder Fristen anstehen.</description>"
            "<language>de-de</language>"
            f"<lastBuildDate>{last}</lastBuildDate>"
            + "".join(items) + "</channel></rss>\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--heute")
    ap.add_argument("--hinweis", action="store_true")
    ap.add_argument("--stand", action="store_true")
    ap.add_argument("--aenderung", action="append", default=[])
    ap.add_argument("--sperrwort", action="append", default=[])
    a = ap.parse_args()
    heute = d(a.heute) if a.heute else heute_default()

    events = lade("events.json", [])
    startups = lade("startups.json", [])
    meta = lade("meta.json", {})
    hinweise = lade("hinweise.json", [])
    runden = lade("runden.json", [])
    investoren = lade("investoren.json", [])

    fehler = []
    pruefe_events(events, fehler)
    pruefe_startups(startups, fehler)
    pruefe_kapital(runden, investoren, startups, fehler)
    pruefe_sperrwoerter(a.sperrwort, {"events.json": events, "startups.json": startups, "runden.json": runden,
                        "investoren.json": investoren, "meta.json": meta, "hinweise.json": hinweise,
                        "Änderungstexte": a.aenderung}, fehler)
    if fehler:
        print("FEHLER – nichts geschrieben:")
        for f in fehler:
            print(" -", f)
        sys.exit(1)

    neu_archiviert, ohne_geo = berechne(events, startups, heute)
    verknuepfe_kapital(runden, investoren, startups)

    if a.stand:
        meta["stand"] = heute.isoformat()
        if a.aenderung:
            meta["aenderungen"] = a.aenderung

    if a.hinweis:
        h = baue_hinweis(events, meta, heute)
        if h and not any(x["datum"] == h["datum"] for x in hinweise):
            hinweise.append(h)
            print("Wochenhinweis angelegt:", h["titel"])
        elif h:
            print("Wochenhinweis für heute existiert bereits.")
        else:
            print("Nichts steht an – kein Wochenhinweis.")

    meta["anzahl"] = {
        "events_aktiv": sum(1 for e in events if not e["archiv"]),
        "events_archiv": sum(1 for e in events if e["archiv"]),
        "startups": len(startups),
        "runden": len(runden),
        "investoren": len(investoren),
    }

    speichere("events.json", events)
    speichere("startups.json", startups)
    speichere("meta.json", meta)
    speichere("hinweise.json", hinweise)
    speichere("runden.json", runden)
    speichere("investoren.json", investoren)
    jetzt = dt.datetime.now(dt.timezone.utc)
    (ROOT / "events.ics").write_text(ics_kalender(events, meta, jetzt), encoding="utf-8", newline="")
    (ROOT / "feed.xml").write_text(feed_xml(hinweise, meta), encoding="utf-8")

    termine, fristen = anstehend(events, heute)
    print(f"OK: {meta['anzahl']['events_aktiv']} aktive Events, {meta['anzahl']['events_archiv']} im Archiv, "
          f"{len(startups)} Start-ups, {len(runden)} Runden/Deals, {len(investoren)} Investoren.")
    print(f"Nächste 30 Tage: {len(termine)} Termine, {len(fristen)} Fristen.")
    if neu_archiviert:
        print("Neu im Archiv:", ", ".join(e["name"] for e in neu_archiviert))
    if ohne_geo:
        print("HINWEIS – Ort ohne Koordinaten (erscheint nicht im Radar), bitte in tools/orte.json ergänzen:",
              ", ".join(f"{e['id']} ({e['ort']})" for e in ohne_geo))


if __name__ == "__main__":
    main()
