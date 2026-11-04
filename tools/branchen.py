#!/usr/bin/env python3
"""Branchen-Vorschläge per Stichwort – Hilfe für Abruf und Pflege, keine endgültige Zuordnung.

    from branchen import vorschlag
    vorschlag("PV-Montage auf dem Dach, Fachvortrag")   # → ['Dach & Gebäudehülle', 'Energie & Solar', ...]
"""
import re

BRANCHEN = ["Bau & Immobilien", "Dach & Gebäudehülle", "Energie & Solar", "Gebäudetechnik", "Industrie & Fertigung",
            "Metall & Oberflächen", "Material & Kreislauf", "Handwerk", "Software, KI & Daten", "Logistik & Handel",
            "Gründung & Innovation"]

# Stichwörter je Branche. Kurze Wörter (≤ 3 Zeichen) gelten nur als ganzes Wort.
STICHWORTE = {
    "Bau & Immobilien": ["bau", "contech", "proptech", "bim", "immobil", "architekt", "construction", "built",
                         "real estate", "bauwende", "dgnb", "holzbau", "tiefbau", "hochbau", "infrastruktur",
                         "smart city", "stadtentwicklung", "quartier", "wohnungs", "baustelle", "bauwesen",
                         "baubranche", "bauindustrie", "facility"],
    "Dach & Gebäudehülle": ["dach", "fassade", "gebäudehülle", "spengler", "roof", "fenster", "dämm", "abdicht",
                            "entwässerung", "schneefang", "dachrinne", "gründach", "klempner", "bedachung"],
    "Energie & Solar": ["energie", "solar", "pv", "photovolta", "intersolar", "smarter e", "e-world", "speicher",
                        "batterie", "battery", "wasserstoff", "hydrogen", "strom", "stromnetz", "energy", "cleantech",
                        "klimaschutz", "windkraft", "wind", "e-mobil", "ladeinfra", "wärmewende", "energiewende",
                        "netzbetreib", "agri-pv", "balkonkraftwerk"],
    "Gebäudetechnik": ["gebäudetechnik", "tga", "shk", "hlk", "heizung", "lüftung", "wärmepumpe", "smart building",
                       "smart home", "light + building", "light+building", "ish", "sanitär", "elektrotechnik",
                       "gebäudeautomation", "klimatechnik", "kältetechnik", "installateur"],
    "Industrie & Fertigung": ["industrie", "fertigung", "produktion", "automatisier", "robot", "hannover messe", "sps",
                              "formnext", "maschinenbau", "manufactur", "industry", "3d-druck", "additive", "iiot",
                              "industrie 4.0", "qualitätssicherung", "fabrik", "factory", "mechatronik", "automation",
                              "werkzeugbau", "zulieferer", "produktions"],
    "Metall & Oberflächen": ["metall", "blech", "stahl", "aluminium", "guss", "verzink", "galvan", "beschicht",
                             "oberfläche", "paint", "pulverlack", "lackier", "euroblech", "blechexpo", "intergalva",
                             "schweiß", "stanz", "umform", "zerspan", "korrosion", "schmiede", "gießerei", "steel"],
    "Material & Kreislauf": ["material", "kreislauf", "circular", "recycling", "nachhaltig", "epd", "co2", "co₂",
                             "lca", "ökobilanz", "ressourcen", "rohstoff", "baustoff", "beton", "zement", "dekarbon",
                             "sustainab", "esg", "emission", "upcycling", "biobasiert", "lehm", "holzwerkstoff"],
    "Handwerk": ["handwerk", "hwk", "dachdecker", "spengler", "installateur", "handwerker", "meister", "gewerk",
                 "craft", "zimmerer", "elektriker", "betriebsnachfolge"],
    "Software, KI & Daten": ["software", "ki", "ai", "künstliche intelligenz", "artificial intelligence", "daten",
                             "data", "digital", "saas", "app", "plattform", "platform", "cloud", "cyber", "it",
                             "drohne", "drone", "digital twin", "digitaler zwilling", "machine learning", "iot",
                             "sensor", "computer vision", "robotic process", "erp", "crm"],
    "Logistik & Handel": ["logistik", "logistics", "handel", "zoll", "export", "außenhandel", "supply chain",
                          "lieferkette", "einkauf", "e-commerce", "beschaffung", "procurement", "großhandel",
                          "fachhandel", "marktplatz", "marketplace", "intralogistik"],
    "Gründung & Innovation": ["startup", "start-up", "gründ", "accelerator", "inkubator", "incubator", "pitch",
                              "investor", "venture", "innovation", "hackathon", "demo day", "business angel",
                              "founder", "entrepreneur", "scale-up", "scaleup", "open innovation", "corporate"],
}

_MUSTER = {}
for _b, _ws in STICHWORTE.items():
    teile = []
    for w in _ws:
        if len(w) <= 3:
            teile.append(r"(?<![a-zäöüß0-9])" + re.escape(w) + r"(?![a-zäöüß0-9])")
        else:
            teile.append(re.escape(w))
    _MUSTER[_b] = re.compile("|".join(teile), re.I)

SUCHFELD_BRANCHEN = {
    "Dach-Solar-Integration": ["Dach & Gebäudehülle", "Energie & Solar"],
    "Smarte Dach- und Entwässerungssysteme": ["Dach & Gebäudehülle", "Software, KI & Daten"],
    "Digitale Planung und Vertrieb": ["Software, KI & Daten", "Bau & Immobilien"],
    "Fertigung, Qualität und Energie": ["Industrie & Fertigung"],
    "Nachhaltigkeit und Material": ["Material & Kreislauf"],
    "Außenhandel und Zoll": ["Logistik & Handel"],
}


def vorschlag(text, max_anzahl=4):
    """Liefert Branchen in Reihenfolge der Trefferzahl (höchstens max_anzahl)."""
    t = (text or "").lower()
    treffer = []
    for b in BRANCHEN:
        n = len(_MUSTER[b].findall(t))
        if n:
            treffer.append((n, BRANCHEN.index(b), b))
    treffer.sort(key=lambda x: (-x[0], x[1]))
    return [b for _, _, b in treffer[:max_anzahl]]


if __name__ == "__main__":
    import sys
    print(vorschlag(" ".join(sys.argv[1:])))
