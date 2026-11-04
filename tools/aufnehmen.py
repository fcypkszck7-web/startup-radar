#!/usr/bin/env python3
"""Übernimmt geprüfte Abruf-Kandidaten als Termine in data/events.json und merkt sich jede Entscheidung.

Eingabe: eine JSON-Datei mit einer Liste von Entscheidungen, je Kandidat (Schlüssel aus abruf/neu.json):
  {"schluessel": "...", "aktion": "aufnehmen", "branchen": ["Energie & Solar"], "rubrik": "de",
   "region": "Bayern (Oberbayern)", "land": "DE", "format": "Webinar", "fokus": "PV-Speicher, Netzanschluss",
   "name": "(optional, sonst Titel)", "ort": "(optional)", "veranstalter": "(optional)", "kosten": "(optional)",
   "scores": {"relevanz": 2, "zugang": 3, "aufwand": 4, "verlaesslichkeit": 4}, "begruendung": "(optional)"}
  {"schluessel": "...", "aktion": "ablehnen", "grund": "kein Bezug zu den Branchen"}

    python3 tools/aufnehmen.py --kandidaten ../abruf-daten/abruf/neu.json --entscheidungen entscheidungen.json
Danach build.py ausführen. Fehlen Scores, gelten neutrale Werte (Priorität C) – bewertet wird nur zum Sortieren.
"""
import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from branchen import BRANCHEN  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
STANDARD_SCORES = {"relevanz": 2, "zugang": 3, "aufwand": 3, "verlaesslichkeit": 4}


def slug(t):
    t = t.lower()
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        t = t.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60].strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kandidaten", required=True)
    ap.add_argument("--entscheidungen", required=True)
    a = ap.parse_args()
    kand = {k["schluessel"]: k for k in json.loads(Path(a.kandidaten).read_text(encoding="utf-8"))}
    ents = json.loads(Path(a.entscheidungen).read_text(encoding="utf-8"))
    ev_p = ROOT / "data" / "events.json"
    events = json.loads(ev_p.read_text(encoding="utf-8"))
    ids = {e["id"] for e in events}
    ent_p = ROOT / "tools" / "abruf_entscheidungen.json"
    gemerkt = json.loads(ent_p.read_text(encoding="utf-8")) if ent_p.exists() else {}
    heute = dt.date.today().isoformat()
    neu, abgelehnt, fehler = 0, 0, []
    for e in ents:
        s = e.get("schluessel")
        k = kand.get(s)
        if not k:
            fehler.append(f"Schlüssel nicht gefunden: {s}")
            continue
        if e.get("aktion") == "ablehnen":
            gemerkt[s] = "abgelehnt: " + (e.get("grund") or "nicht passend")
            abgelehnt += 1
            continue
        if e.get("aktion") == "doppelt":
            gemerkt[s] = "schon erfasst: " + (e.get("id") or "")
            continue
        b = [x for x in e.get("branchen", []) if x in BRANCHEN]
        if not b:
            fehler.append(f"{s}: keine gültige Branche")
            continue
        name = (e.get("name") or k["titel"]).strip()
        start = e.get("start") or k["start"]
        ende = e.get("ende") or k.get("ende") or start
        if ende < start:
            ende = start
        basis = slug(name) or "termin"
        jahr = start[:4]
        eid = basis if basis.endswith(jahr) else f"{basis}-{jahr}"
        if eid in ids:
            eid = f"{eid}-{start[5:7]}{start[8:10]}"
        n = 2
        while eid in ids:
            eid = f"{basis}-{start}-{n}"
            n += 1
        ort = e.get("ort") or k.get("ort") or ("Online" if k.get("online") else "")
        if not ort:
            fehler.append(f"{s}: Ort fehlt – bitte 'ort' angeben")
            continue
        ereignis = {
            "id": eid, "name": name, "format": e.get("format") or "Veranstaltung",
            "veranstalter": e.get("veranstalter") or k.get("veranstalter") or k.get("quelle_name", ""),
            "ort": ort, "land": e.get("land") or "DE", "region": e.get("region") or "",
            "rubrik": e.get("rubrik") or "de", "start": start, "ende": ende,
            "turnus": e.get("turnus", ""), "zeitraum": e.get("zeitraum", ""),
            "status": e.get("status") or "bestätigt", "anmeldeschluss": e.get("anmeldeschluss"),
            "anmeldung": e.get("anmeldung") or "Anmeldung über die Veranstalterseite",
            "kosten": e.get("kosten", ""), "zielgruppe": e.get("zielgruppe", ""),
            "fokus": e.get("fokus") or k.get("kurz", "")[:160], "begruendung": e.get("begruendung", ""),
            "rolle": e.get("rolle") or ["Besuch"], "branchen": b,
            "scores": e.get("scores") or dict(STANDARD_SCORES),
            "quelle": e.get("quelle") or k.get("url"), "geprueft": heute, "herkunft": "abruf:" + k.get("quelle_id", ""),
        }
        if not ereignis["region"]:
            fehler.append(f"{s}: Region fehlt – bitte 'region' angeben")
            continue
        events.append(ereignis)
        ids.add(eid)
        gemerkt[s] = "aufgenommen: " + eid
        neu += 1
    ev_p.write_text(json.dumps(events, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    ent_p.write_text(json.dumps(dict(sorted(gemerkt.items())), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"OK: {neu} Termine aufgenommen, {abgelehnt} abgelehnt.")
    for f in fehler:
        print("HINWEIS:", f)


if __name__ == "__main__":
    main()
