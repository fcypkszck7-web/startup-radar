#!/usr/bin/env python3
"""Automatischer Abruf von Veranstaltungskalendern und Start-up-Listen (läuft als GitHub-Workflow).

Liest tools/quellen.json und schreibt Kandidaten in einen Ausgabeordner (Branch „abruf-daten“):
  abruf/status.json        – Ergebnis je Quelle (erreichbar, Methode, Anzahl, Fehler)
  abruf/events.json        – alle gefundenen künftigen Termine (strukturiert)
  abruf/neu.json           – davon die, die noch nicht in data/events.json stehen und nicht entschieden sind
  abruf/terminzeilen/*.txt – Zeilen mit Datumsangaben von Seiten ohne strukturierte Daten
  abruf/listen/*.json      – Namen und Links aus Start-up-Listen (Portfolios, Programme, Verzeichnisse)
  abruf/cache.json         – bereits gelesene Detailseiten (spart Abrufe)

Methoden je Seite: JSON-LD (schema.org/Event), iCal-Feeds, RSS, The-Events-Calendar-API (WordPress),
Luma-Kalender, Detailseiten mit JSON-LD, sonst Datumszeilen. robots.txt wird beachtet.

    python3 tools/abruf.py --quellen tools/quellen.json --repo . --aus ../abruf-daten [--nur id1,id2]
Nur Python-Standardbibliothek.
"""
import argparse
import concurrent.futures as cf
import datetime as dt
import gzip
import html
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
import zlib
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from branchen import vorschlag  # noqa: E402

CACHE_VERSION = 2
UA = "Mozilla/5.0 (compatible; StartupEventRadar/1.0; +https://fcypkszck7-web.github.io/startup-radar/)"
HEUTE = dt.date.today()
BIS = HEUTE + dt.timedelta(days=550)
EVENT_TYPEN = {"event", "businessevent", "educationevent", "exhibitionevent", "festival", "socialevent",
               "hackathon", "eventseries", "courseinstance", "conference", "saleevent", "childrensevent",
               "literaryevent", "screeningevent", "musicevent", "theaterevent", "publicationevent"}
DETAIL_MUSTER = re.compile(r"/(events?|veranstaltung(en)?|termine?|kalender|calendar|agenda|seminare?|webinare?|"
                           r"workshops?|messen?|kongress|vortr(a|ä)ge?)/[^?#]{3,}", re.I)
MONATE = {"jan": 1, "januar": 1, "january": 1, "feb": 2, "februar": 2, "february": 2, "mär": 3, "märz": 3,
          "maerz": 3, "mar": 3, "march": 3, "apr": 4, "april": 4, "mai": 5, "may": 5, "jun": 6, "juni": 6,
          "june": 6, "jul": 7, "juli": 7, "july": 7, "aug": 8, "august": 8, "sep": 9, "sept": 9, "september": 9,
          "okt": 10, "oktober": 10, "oct": 10, "october": 10, "nov": 11, "november": 11, "dez": 12,
          "dezember": 12, "dec": 12, "december": 12}
DATUM_RE = re.compile(
    r"(?<!\d)(\d{1,2})\.\s?(\d{1,2})\.\s?(20\d\d)(?!\d)"                                   # 12.03.2027
    r"|(?<!\d)(\d{1,2})\.?\s+(jan(?:uar)?|feb(?:ruar)?|m(?:ä|ae)rz|apr(?:il)?|mai|juni?|juli?|aug(?:ust)?|"
    r"sep(?:t(?:ember)?)?|okt(?:ober)?|nov(?:ember)?|dez(?:ember)?|january|february|march|may|june|july|"
    r"october|december)\.?\s+(20\d\d)"                                                    # 12. März 2027
    r"|(20\d\d)-(\d{2})-(\d{2})", re.I)                                                   # 2027-03-12

_lock_dom = {}
_lock_global = threading.Lock()
_robots = {}


# ---------------------------------------------------------------- Netz
def domain_sperre(host):
    with _lock_global:
        if host not in _lock_dom:
            _lock_dom[host] = [threading.Lock(), 0.0]
        return _lock_dom[host]


def erlaubt(url):
    p = urllib.parse.urlsplit(url)
    basis = f"{p.scheme}://{p.netloc}"
    with _lock_global:
        rp = _robots.get(basis)
    if rp is None:
        rp = urllib.robotparser.RobotFileParser()
        try:
            text = hole(basis + "/robots.txt", pruefe_robots=False, max_bytes=500_000, zeitlimit=15)[1]
            rp.parse(text.splitlines())
        except Exception:  # noqa: BLE001 – kein robots.txt → erlaubt
            rp.parse([])
        with _lock_global:
            _robots[basis] = rp
    return rp.can_fetch(UA, url) and rp.can_fetch("*", url)


def hole(url, pruefe_robots=True, max_bytes=6_000_000, zeitlimit=30, accept=None):
    """Gibt (finale_url, text, content_type) zurück; wirft Exception bei Fehler."""
    if pruefe_robots and not erlaubt(url):
        raise PermissionError("robots.txt verbietet den Abruf")
    host = urllib.parse.urlsplit(url).netloc
    sperre = domain_sperre(host)
    with sperre[0]:
        warten = sperre[1] + 1.2 - time.time()
        if warten > 0:
            time.sleep(warten)
        req = urllib.request.Request(url, headers={
            "User-Agent": UA, "Accept-Language": "de-DE,de;q=0.9,en;q=0.7",
            "Accept": accept or "text/html,application/xhtml+xml,application/json,text/calendar,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate"})
        try:
            with urllib.request.urlopen(req, timeout=zeitlimit) as r:
                roh = r.read(max_bytes + 1)
                enc = (r.headers.get("Content-Encoding") or "").lower()
                ctype = r.headers.get("Content-Type") or ""
                final = r.geturl()
        finally:
            sperre[1] = time.time()
    if enc == "gzip":
        roh = gzip.decompress(roh)
    elif enc == "deflate":
        roh = zlib.decompress(roh)
    m = re.search(r"charset=([\w-]+)", ctype)
    cs = m.group(1) if m else None
    if not cs:
        m2 = re.search(rb'<meta[^>]+charset=["\']?([\w-]+)', roh[:4000], re.I)
        cs = m2.group(1).decode() if m2 else "utf-8"
    try:
        text = roh.decode(cs, errors="replace")
    except LookupError:
        text = roh.decode("utf-8", errors="replace")
    return final, text, ctype


# ---------------------------------------------------------------- HTML
class Zerleger(HTMLParser):
    """Sammelt JSON-LD, Links (ohne Kopf/Navigation/Fuß), Überschriften, sichtbaren Text, Feed-Links."""
    STUMM = {"script", "style", "noscript", "template", "svg"}
    RAHMEN = {"nav", "header", "footer"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.jsonld, self.links, self.koepfe, self.text, self.feeds = [], [], [], [], []
        self.meta = {}
        self._stumm = 0
        self._rahmen = 0
        self._ld = None
        self._a = None
        self._kopf = None
        self.titel = ""
        self._im_titel = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
            self._ld = []
        if tag in self.STUMM:
            self._stumm += 1
        if tag in self.RAHMEN or (a.get("role") in ("navigation", "banner", "contentinfo")):
            self._rahmen += 1
        if tag == "title":
            self._im_titel = True
        if tag == "meta":
            k = (a.get("property") or a.get("name") or "").lower()
            if k in ("og:title", "og:description", "description", "og:url", "og:site_name"):
                self.meta[k] = a.get("content") or ""
        if tag == "link":
            rel = (a.get("rel") or "").lower()
            typ = (a.get("type") or "").lower()
            if "alternate" in rel and ("rss" in typ or "atom" in typ or "calendar" in typ):
                self.feeds.append((typ, a.get("href") or ""))
        if tag == "a" and a.get("href"):
            self._a = [a.get("href"), [], self._rahmen > 0]
        if tag in ("h1", "h2", "h3", "h4"):
            self._kopf = [tag, []]
        if tag in ("br", "p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "td", "section", "article", "time"):
            self.text.append("\n")

    def handle_endtag(self, tag):
        if tag == "script" and self._ld is not None:
            self.jsonld.append("".join(self._ld))
            self._ld = None
        if tag in self.STUMM and self._stumm:
            self._stumm -= 1
        if tag in self.RAHMEN and self._rahmen:
            self._rahmen -= 1
        if tag == "title":
            self._im_titel = False
        if tag == "a" and self._a:
            href, txt, rahmen = self._a
            t = " ".join("".join(txt).split())
            self.links.append({"text": t[:160], "href": href, "rahmen": rahmen})
            self._a = None
            self.text.append(" ")
        if tag in ("h1", "h2", "h3", "h4") and self._kopf:
            t = " ".join("".join(self._kopf[1]).split())
            if t:
                self.koepfe.append((self._kopf[0], t[:200]))
            self._kopf = None

    def handle_data(self, data):
        if self._ld is not None:
            self._ld.append(data)
            return
        if self._im_titel:
            self.titel += data
            return
        if self._stumm:
            return
        if self._a is not None:
            self._a[1].append(data)
        if self._kopf is not None:
            self._kopf[1].append(data)
        if not self._rahmen:
            self.text.append(data)


def zerlege(text):
    z = Zerleger()
    try:
        z.feed(text)
        z.close()
    except Exception:  # noqa: BLE001
        pass
    return z


def sichtbarer_text(z):
    roh = "".join(z.text)
    zeilen = [" ".join(x.split()) for x in roh.split("\n")]
    return [x for x in zeilen if x]


# ---------------------------------------------------------------- Datum
def iso_datum(s):
    """Wandelt schema.org-/iCal-Datumsangaben in JJJJ-MM-TT um."""
    if not s:
        return None
    s = str(s).strip()
    m = re.match(r"(\d{4})-?(\d{2})-?(\d{2})", s)
    if m:
        try:
            return dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3))).isoformat()
        except ValueError:
            return None
    m = DATUM_RE.search(s)
    return datum_aus_treffer(m) if m else None


def datum_aus_treffer(m):
    try:
        if m.group(1):
            return dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1))).isoformat()
        if m.group(4):
            mon = MONATE.get(m.group(5).lower().rstrip(".").replace("ae", "ä")) or MONATE.get(m.group(5).lower()[:3])
            return dt.date(int(m.group(6)), mon, int(m.group(4))).isoformat()
        if m.group(7):
            return dt.date(int(m.group(7)), int(m.group(8)), int(m.group(9))).isoformat()
    except (ValueError, TypeError):
        return None
    return None


def im_zeitraum(start):
    try:
        d = dt.date.fromisoformat(start)
    except (TypeError, ValueError):
        return False
    return HEUTE - dt.timedelta(days=1) <= d <= BIS


# ---------------------------------------------------------------- JSON-LD
def lade_json_locker(s):
    s = s.strip()
    s = re.sub(r"^\s*<!--|-->\s*$", "", s)
    s = re.sub(r"^\s*//\s*<!\[CDATA\[|//\s*\]\]>\s*$", "", s)
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        try:
            return json.loads(re.sub(r"[\x00-\x1f]", " ", s))
        except json.JSONDecodeError:
            return None


def typen(o):
    t = o.get("@type")
    if isinstance(t, list):
        return {str(x).lower() for x in t}
    return {str(t).lower()} if t else set()


def textwert(v):
    if isinstance(v, dict):
        return v.get("name") or v.get("@value") or ""
    if isinstance(v, list):
        return ", ".join(textwert(x) for x in v if textwert(x))
    return html.unescape(str(v)) if v else ""


def ort_aus(loc):
    if not loc:
        return "", False, ""
    if isinstance(loc, list):
        teile = [ort_aus(x) for x in loc]
        online = any(x[1] for x in teile)
        orte = [x[0] for x in teile if x[0]]
        laender = [x[2] for x in teile if x[2]]
        return (orte[0] if orte else ""), online, (laender[0] if laender else "")
    if isinstance(loc, str):
        return loc, False, ""
    if "virtuallocation" in typen(loc):
        return "Online", True, ""
    adr = loc.get("address") or {}
    if isinstance(adr, str):
        return " ".join(filter(None, [loc.get("name"), adr])), False, ""
    stadt = adr.get("addressLocality") or ""
    land = adr.get("addressCountry") or ""
    if isinstance(land, dict):
        land = land.get("name") or ""
    name = loc.get("name") or ""
    return ", ".join(x for x in [name, stadt] if x), False, str(land)


def events_aus_jsonld(bloecke, basis_url):
    gefunden = []

    def lauf(o):
        if isinstance(o, list):
            for x in o:
                lauf(x)
            return
        if not isinstance(o, dict):
            return
        if "@graph" in o:
            lauf(o["@graph"])
        if typen(o) & EVENT_TYPEN and o.get("startDate"):
            start = iso_datum(o.get("startDate"))
            ende = iso_datum(o.get("endDate")) or start
            ort, online, land = ort_aus(o.get("location"))
            modus = str(o.get("eventAttendanceMode") or "").lower()
            if "online" in modus and "mixed" not in modus:
                online = True
            url = o.get("url") or o.get("@id") or basis_url
            if isinstance(url, list):
                url = url[0]
            gefunden.append({
                "titel": " ".join(textwert(o.get("name")).split())[:250], "start": start, "ende": ende,
                "ort": ort[:200], "land": land, "online": online,
                "url": urllib.parse.urljoin(basis_url, str(url)),
                "veranstalter": textwert(o.get("organizer"))[:200],
                "kurz": " ".join(re.sub(r"<[^>]+>", " ", textwert(o.get("description"))).split())[:220],
                "methode": "json-ld"})
        for k in ("itemListElement", "item", "subEvent", "event", "events", "mainEntity"):
            if k in o:
                lauf(o[k])

    for b in bloecke:
        lauf(lade_json_locker(b))
    return gefunden


# ---------------------------------------------------------------- iCal & RSS
def ical_events(text, quelle_url):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n[ \t]", "", text)
    out = []
    for block in re.findall(r"BEGIN:VEVENT\n(.*?)\nEND:VEVENT", text, re.S):
        f = {}
        for zeile in block.split("\n"):
            if ":" not in zeile:
                continue
            k, v = zeile.split(":", 1)
            name = k.split(";")[0].upper()
            if name == "ORGANIZER":
                m = re.search(r"CN=\"?([^;:\"]+)", k)
                v = m.group(1) if m else ""
            f.setdefault(name, v)
        ent = lambda s: s.replace("\\n", " ").replace("\\,", ",").replace("\\;", ";").replace("\\\\", "\\")  # noqa: E731
        start = iso_datum(f.get("DTSTART"))
        ende = iso_datum(f.get("DTEND")) or start
        if ende and start and ende > start and re.fullmatch(r"\d{8}", (f.get("DTEND") or "").strip()):
            ende = (dt.date.fromisoformat(ende) - dt.timedelta(days=1)).isoformat()  # DTEND exklusiv bei Ganztag
        ort = ent(f.get("LOCATION", ""))
        out.append({"titel": ent(f.get("SUMMARY", ""))[:250], "start": start, "ende": ende, "ort": ort[:200],
                    "land": "", "online": bool(re.search(r"online|zoom|teams|webex|virtuell", ort, re.I)),
                    "url": ent(f.get("URL", "")) or quelle_url, "veranstalter": ent(f.get("ORGANIZER", ""))[:200],
                    "kurz": ent(f.get("DESCRIPTION", ""))[:220], "methode": "ical"})
    return out


def rss_eintraege(text):
    import xml.etree.ElementTree as ET
    try:
        wurzel = ET.fromstring(text.encode("utf-8", errors="replace"))
    except ET.ParseError:
        return []
    out = []
    for it in wurzel.iter():
        tag = it.tag.split("}")[-1]
        if tag not in ("item", "entry"):
            continue
        g = {c.tag.split("}")[-1]: c for c in it}
        titel = (g.get("title").text or "") if g.get("title") is not None else ""
        link = ""
        if g.get("link") is not None:
            link = g["link"].text or g["link"].attrib.get("href", "")
        beschr = ""
        for k in ("description", "summary", "content"):
            if g.get(k) is not None and g[k].text:
                beschr = re.sub(r"<[^>]+>", " ", g[k].text)
                break
        m = DATUM_RE.search(titel + " " + beschr)
        start = datum_aus_treffer(m) if m else None
        out.append({"titel": " ".join(titel.split())[:250], "start": start, "ende": start, "ort": "", "land": "",
                    "online": False, "url": link.strip(), "veranstalter": "",
                    "kurz": " ".join(beschr.split())[:220], "methode": "rss", "datum_aus_text": True})
    return out


def tribe_events(basis):
    url = urllib.parse.urljoin(basis, "/wp-json/tribe/events/v1/events?per_page=50&start_date=" + HEUTE.isoformat())
    out, seiten = [], 0
    while url and seiten < 6:
        _, text, _ = hole(url, accept="application/json")
        d = json.loads(text)
        for e in d.get("events", []):
            v = e.get("venue") or {}
            org = e.get("organizer") or []
            out.append({"titel": html.unescape(e.get("title", ""))[:250], "start": iso_datum(e.get("start_date")),
                        "ende": iso_datum(e.get("end_date")), "ort": ", ".join(x for x in [v.get("venue"), v.get("city")] if x)[:200]
                        if isinstance(v, dict) else "", "land": (v.get("country") or "") if isinstance(v, dict) else "",
                        "online": False, "url": e.get("url", ""),
                        "veranstalter": ", ".join(html.unescape(o.get("organizer", "")) for o in org if isinstance(o, dict))[:200],
                        "kurz": " ".join(re.sub(r"<[^>]+>", " ", html.unescape(e.get("description", ""))).split())[:220],
                        "methode": "tribe-api"})
        url = d.get("next_rest_url")
        seiten += 1
    return out


# ---------------------------------------------------------------- Quellen
ORG_TYPEN = {"organization", "corporation", "localbusiness", "professionalservice", "softwareapplication"}
PLZ_RE = re.compile(r"(?<![\d-])(?:(D|A|CH)-)?(\d{4,5})\s+([A-ZÄÖÜ][a-zäöüß]+(?:[ -](?:[A-ZÄÖÜ]?[a-zäöüß]+|im|am|an|der|bei)){0,3})")


ORT_ZEILE = re.compile(r"^(ort|veranstaltungsort|location|venue|wo|adresse|address|treffpunkt)\s*[:|]?\s*(.*)$", re.I)


def ort_aus_text(zeilen):
    """Sucht 'Ort: …'-Angaben, sonst PLZ + Ort; erkennt Online-Formate."""
    for i, zl in enumerate(zeilen[:400]):
        m = ORT_ZEILE.match(zl)
        if m:
            rest = m.group(2).strip(" :|-")
            if not rest and i + 1 < len(zeilen):
                rest = zeilen[i + 1]
            if rest and len(rest) < 160 and not re.match(r"^(und|oder|der|die|das)\b", rest, re.I):
                if not PLZ_RE.search(rest):
                    for nz in zeilen[i + 1: i + 4]:
                        m2 = PLZ_RE.search(nz)
                        if m2:
                            rest = f"{rest}, {m2.group(3)}"
                            break
                return rest[:120]
    for zl in zeilen[:400]:
        m = PLZ_RE.search(zl)
        if m and len(zl) < 200:
            return m.group(3)
    return ""


def detail_kandidat(url, text):
    """Detailseite ohne JSON-LD: Titel + erstes künftiges Datum im Text."""
    z = zerlege(text)
    titel = next((t for h, t in z.koepfe if h == "h1"), "") or z.meta.get("og:title") or z.titel
    if re.search(r"^(alle )?(events?|termine|veranstaltungen|kalender|übersicht)\b|kategorie|terminübersicht|"
                 r"verbandstermine|branchentermine|^veranstaltungen (in|zum)", titel.strip(), re.I):
        return None  # Übersichts- oder Kategorieseite, kein einzelner Termin
    zeilen = sichtbarer_text(z)
    for zl in zeilen[:400]:
        for m in DATUM_RE.finditer(zl):
            d = datum_aus_treffer(m)
            if d and im_zeitraum(d) and d != HEUTE.isoformat():
                ort = ort_aus_text(zeilen)
                return {"titel": " ".join(titel.split())[:250], "start": d, "ende": d, "ort": ort, "land": "",
                        "online": bool(re.search(r"\bonline\b|webinar|zoom|teams", " ".join(zeilen[:200]), re.I)),
                        "url": url, "veranstalter": z.meta.get("og:site_name", ""),
                        "kurz": (z.meta.get("og:description") or z.meta.get("description") or "")[:220],
                        "methode": "detailseite-text", "datum_aus_text": True}
    return None


def datumszeilen(zeilen):
    treffer = []
    for i, zl in enumerate(zeilen):
        ds = [datum_aus_treffer(m) for m in DATUM_RE.finditer(zl)]
        if any(d and im_zeitraum(d) for d in ds):
            treffer.append(" | ".join(zeilen[max(0, i - 1): i + 2])[:400])
    return list(dict.fromkeys(treffer))


def verarbeite_zeilenquelle(q, url, cache, max_detail):
    """Artikel-/Übersichtsseiten (z. B. Wochen-Terminübersichten): Datumszeilen aus Seite und verlinkten Beiträgen."""
    final, text, _ = hole(url)
    z = zerlege(text)
    zeilen = datumszeilen(sichtbarer_text(z))
    folge = re.compile(q["folge"], re.I) if q.get("folge") else None
    host = urllib.parse.urlsplit(final).netloc
    if folge:
        ziele = []
        for l in z.links:
            u = urllib.parse.urljoin(final, l["href"]).split("#")[0]
            if urllib.parse.urlsplit(u).netloc == host and folge.search(u) and u not in ziele and u.rstrip("/") != final.rstrip("/"):
                ziele.append(u)
        for u in ziele[:max_detail]:
            c = cache.get(u)
            if c and c.get("geholt", "") >= (HEUTE - dt.timedelta(days=14)).isoformat() and "zeilen" in c:
                zeilen += c["zeilen"]
                continue
            try:
                _, t2, _ = hole(u)
                zz = datumszeilen(sichtbarer_text(zerlege(t2)))
                cache[u] = {"geholt": HEUTE.isoformat(), "zeilen": zz}
                zeilen += [f"[{u}] " + x for x in zz]
            except Exception:  # noqa: BLE001
                continue
    return {"events": [], "methoden": ["datumszeilen"], "zeilen": list(dict.fromkeys(zeilen))[:600], "links": []}


def verarbeite_seite(q, cache, max_detail, url=None):
    url = url or q["url"]
    if q.get("modus") == "zeilen":
        return verarbeite_zeilenquelle(q, url, cache, max_detail)
    final, text, ctype = hole(url)
    ergebnis = {"events": [], "methoden": [], "zeilen": [], "links": []}
    low = text[:2000].lower()
    if "text/calendar" in ctype or low.startswith("begin:vcalendar"):
        ergebnis["events"] += ical_events(text, final)
        ergebnis["methoden"].append("ical")
        return ergebnis
    if ("xml" in ctype or low.lstrip().startswith("<?xml")) and ("<rss" in low or "<feed" in low):
        ergebnis["events"] += rss_eintraege(text)
        ergebnis["methoden"].append("rss")
        return ergebnis
    z = zerlege(text)
    ev = events_aus_jsonld(z.jsonld, final)
    if ev:
        ergebnis["events"] += ev
        ergebnis["methoden"].append("json-ld")
    # The Events Calendar (WordPress)
    if not ev and ("tribe-events" in text or "/wp-json/tribe/" in text):
        try:
            te = tribe_events(final)
            if te:
                ergebnis["events"] += te
                ergebnis["methoden"].append("tribe-api")
        except Exception as ex:  # noqa: BLE001
            ergebnis["methoden"].append(f"tribe-api-fehler:{type(ex).__name__}")
    # iCal-Links und Luma
    if not ergebnis["events"]:
        ics = []
        for l in z.links:
            h = l["href"]
            if re.search(r"\.ics(\?|$)|[?&]ical=|webcal:|/ical/?$|format=ical", h, re.I):
                ics.append(urllib.parse.urljoin(final, h.replace("webcal:", "https:")))
        m = re.search(r"\b(cal-[A-Za-z0-9]{8,})\b", text) if re.search(r"lu\.ma|luma\.com", final) else None
        if m:
            ics.insert(0, f"https://api.lu.ma/ics/get?entity=calendar&id={m.group(1)}")
        for u in list(dict.fromkeys(ics))[:2]:
            try:
                _, t2, _ = hole(u, accept="text/calendar,*/*")
                e2 = ical_events(t2, u)
                if e2:
                    ergebnis["events"] += e2
                    ergebnis["methoden"].append("ical-link")
                    break
            except Exception:  # noqa: BLE001
                continue
    # Detailseiten
    folge = re.compile(q["folge"], re.I) if q.get("folge") else DETAIL_MUSTER
    host = urllib.parse.urlsplit(final).netloc
    details = []
    for l in z.links:
        if l["rahmen"]:
            continue
        u = urllib.parse.urljoin(final, l["href"]).split("#")[0]
        if urllib.parse.urlsplit(u).netloc != host and not q.get("fremde_details"):
            continue
        if u.rstrip("/") == final.rstrip("/") or not folge.search(urllib.parse.urlsplit(u).path + "?" + urllib.parse.urlsplit(u).query):
            continue
        if u not in details:
            details.append(u)
    bekannte = {e["url"].split("#")[0] for e in ergebnis["events"]}
    neu_geholt = 0
    for u in details:
        if u in bekannte:
            continue
        c = cache.get(u)
        if c and c.get("v") == CACHE_VERSION and c.get("geholt", "") >= (HEUTE - dt.timedelta(days=21)).isoformat():
            ergebnis["events"] += c.get("events", [])
            continue
        if neu_geholt >= max_detail:
            break
        neu_geholt += 1
        try:
            f2, t2, _ = hole(u)
            z2 = zerlege(t2)
            e2 = events_aus_jsonld(z2.jsonld, f2)
            if e2 and any(not e.get("ort") for e in e2):
                o = ort_aus_text(sichtbarer_text(z2))
                for e in e2:
                    if not e.get("ort") and o:
                        e["ort"] = o
            if not e2:
                k = detail_kandidat(f2, t2)
                e2 = [k] if k else []
            for e in e2:
                if not e.get("url") or e["url"] == final:
                    e["url"] = f2
            cache[u] = {"geholt": HEUTE.isoformat(), "events": e2, "v": CACHE_VERSION}
            ergebnis["events"] += e2
        except Exception as ex:  # noqa: BLE001
            cache[u] = {"geholt": HEUTE.isoformat(), "events": [], "fehler": type(ex).__name__}
    if details:
        ergebnis["methoden"].append(f"detailseiten:{len(details)}")
    # Datumszeilen als Rückfall
    if not ergebnis["events"]:
        ergebnis["zeilen"] = datumszeilen(sichtbarer_text(z))[:300]
        if ergebnis["zeilen"]:
            ergebnis["methoden"].append("datumszeilen")
    return ergebnis


def sitz_aus_zeilen(zeilen, profil):
    """Sucht im Impressum die erste Zeile mit Postleitzahl und Ort (Copyright-Zeilen ausgenommen)."""
    ctx = " ".join(zeilen[:400]).lower()
    for zl in zeilen[:400]:
        if re.search(r"©|copyright|\(c\)", zl, re.I):
            continue
        m = PLZ_RE.search(zl)
        if not m:
            continue
        vier = len(m.group(2)) == 4 and not m.group(1)
        if vier and (1990 <= int(m.group(2)) <= 2035 or not re.search(r"schweiz|switzerland|österreich|austria", ctx)):
            continue
        profil["sitz"] = m.group(3).strip()
        pre = m.group(1) or ""
        profil["plz"] = m.group(2)
        if pre == "A" or (len(m.group(2)) == 4 and ("österreich" in ctx or "austria" in ctx)):
            profil["land"] = "AT"
        elif pre == "CH" or (len(m.group(2)) == 4 and ("schweiz" in ctx or "switzerland" in ctx)):
            profil["land"] = "CH"
        elif len(m.group(2)) == 5:
            profil["land"] = "DE"
        return True
    return False


def firmenprofil(url, cache):
    """Öffentliche Unternehmensangaben einer Start-up-Website: Name, Kurzbeschreibung, Sitz laut Impressum."""
    c = cache.get("firma:" + url)
    if c and c.get("geholt", "") >= (HEUTE - dt.timedelta(days=60)).isoformat():
        return c.get("profil")
    profil = {"website": url}
    try:
        final, text, _ = hole(url)
        z = zerlege(text)
        profil["website"] = final
        profil["name"] = (z.meta.get("og:site_name") or z.titel or "").strip()[:120]
        profil["kurz"] = (z.meta.get("og:description") or z.meta.get("description") or "").strip()[:300]
        for b in z.jsonld:
            o = lade_json_locker(b)
            stapel = [o]
            while stapel:
                x = stapel.pop()
                if isinstance(x, list):
                    stapel += x
                elif isinstance(x, dict):
                    if "@graph" in x:
                        stapel.append(x["@graph"])
                    if typen(x) & ORG_TYPEN and isinstance(x.get("address"), dict):
                        adr = x["address"]
                        profil.setdefault("sitz", adr.get("addressLocality") or "")
                        land = adr.get("addressCountry") or ""
                        profil.setdefault("land", land.get("name", "") if isinstance(land, dict) else land)
                        if x.get("foundingDate"):
                            profil.setdefault("gruendung", str(x["foundingDate"])[:4])
        imp = next((urllib.parse.urljoin(final, l["href"]) for l in z.links
                    if re.search(r"impressum|imprint|legal notice|legal-notice|mentions l", l["text"] + " " + l["href"], re.I)), "")
        selbst = re.search(r"impressum|imprint|legal", final, re.I)
        if selbst and not profil.get("sitz"):
            profil["impressum"] = final
            sitz_aus_zeilen(sichtbarer_text(z), profil)
        if imp and not profil.get("sitz") and imp != final:
            profil["impressum"] = imp
            _, t2, _ = hole(imp)
            sitz_aus_zeilen(sichtbarer_text(zerlege(t2)), profil)
    except Exception as ex:  # noqa: BLE001
        profil["fehler"] = type(ex).__name__
    cache["firma:" + url] = {"geholt": HEUTE.isoformat(), "profil": profil}
    return profil


def verarbeite_liste(q, cache, max_detail):
    final, text, _ = hole(q["url"])
    z = zerlege(text)
    host = urllib.parse.urlsplit(final).netloc
    sozial = re.compile(r"(linkedin|facebook|twitter|x\.com|instagram|youtube|xing|tiktok|mailto:|tel:|javascript:)", re.I)
    links = []
    for l in z.links:
        if l["rahmen"] or not l["text"] or sozial.search(l["href"]):
            continue
        u = urllib.parse.urljoin(final, l["href"]).split("#")[0]
        links.append({"text": l["text"], "url": u, "extern": urllib.parse.urlsplit(u).netloc != host})
    eintraege = []
    folge = re.compile(q["folge"], re.I) if q.get("folge") else None
    if folge:
        ziele = list(dict.fromkeys(l["url"] for l in links if not l["extern"] and folge.search(l["url"])))
        neu = 0
        for u in ziele:
            c = cache.get(u)
            if c and c.get("geholt", "") >= (HEUTE - dt.timedelta(days=45)).isoformat():
                if c.get("eintrag"):
                    eintraege.append(c["eintrag"])
                continue
            if neu >= max_detail:
                break
            neu += 1
            try:
                f2, t2, _ = hole(u)
                z2 = zerlege(t2)
                web = next((urllib.parse.urljoin(f2, l["href"]) for l in z2.links if not l["rahmen"]
                            and urllib.parse.urlsplit(urllib.parse.urljoin(f2, l["href"])).netloc not in ("", host)
                            and not sozial.search(l["href"])), "")
                e = {"name": next((t for h, t in z2.koepfe if h == "h1"), "") or z2.meta.get("og:title", ""),
                     "seite": f2, "website": web,
                     "kurz": (z2.meta.get("og:description") or z2.meta.get("description") or "")[:220]}
                cache[u] = {"geholt": HEUTE.isoformat(), "eintrag": e}
                eintraege.append(e)
            except Exception as ex:  # noqa: BLE001
                cache[u] = {"geholt": HEUTE.isoformat(), "fehler": type(ex).__name__}
    firmen = []
    if q.get("website_text") or q.get("profile"):
        ziele = []
        if q.get("website_text"):
            wt = re.compile(q["website_text"], re.I)
            ziele += [l["url"] for l in links if l["extern"] and wt.search(l["text"])]
        if q.get("profile"):
            ziele += [e["website"] for e in eintraege if e.get("website")]
        for u in list(dict.fromkeys(ziele))[: q.get("max_firmen", 120)]:
            firmen.append(firmenprofil(u, cache))
    return {"koepfe": [t for h, t in z.koepfe if h in ("h2", "h3", "h4")][:400],
            "links": links[:800], "eintraege": eintraege, "firmen": firmen}


# ---------------------------------------------------------------- Entdecken
ENTDECK_RE = re.compile(r"veranstaltung|termin|event|kalender|calendar|agenda|messe|seminar|webinar|weiterbildung|"
                        r"akademie|vortr|kongress|tagung|portfolio|startups?|gr(ü|ue)nd", re.I)


def entdecke(q):
    """Sucht auf Startseite und Quellseite nach Links zu Kalendern, Feeds und Listen."""
    p = urllib.parse.urlsplit(q["url"])
    starts = [f"{p.scheme}://{p.netloc}/"]
    eltern = q["url"].rsplit("/", 2)[0] + "/"
    if eltern not in starts and eltern.startswith("http"):
        starts.append(eltern)
    funde, feeds, fehler = [], [], []
    for u in starts:
        try:
            final, text, _ = hole(u)
        except Exception as ex:  # noqa: BLE001
            fehler.append(f"{u}: {type(ex).__name__} {getattr(ex, 'code', '')}")
            continue
        z = zerlege(text)
        for l in z.links:
            ziel = urllib.parse.urljoin(final, l["href"]).split("#")[0]
            if not ziel.startswith("http"):
                continue
            if ENTDECK_RE.search(l["text"]) or ENTDECK_RE.search(urllib.parse.urlsplit(ziel).path):
                funde.append({"text": l["text"][:80], "url": ziel})
            if re.search(r"\.ics(\?|$)|ical|webcal|/feed/?$|rss", ziel, re.I):
                feeds.append(ziel)
        feeds += [urllib.parse.urljoin(final, h) for _, h in z.feeds if h]
        for m in re.findall(r"https?://[^\s\"']+(?:wp-json|/api/)[^\s\"']*", text)[:10]:
            feeds.append(m)
    sauber = []
    for f in funde:
        if f["url"] not in [x["url"] for x in sauber]:
            sauber.append(f)
    return {"start": starts, "links": sauber[:60], "feeds": list(dict.fromkeys(feeds))[:20], "fehler": fehler}


# ---------------------------------------------------------------- Abgleich
def norm_url(u):
    p = urllib.parse.urlsplit((u or "").strip().lower())
    return (p.netloc.replace("www.", "") + p.path.rstrip("/"))


def woerter(t):
    return {w for w in re.findall(r"[a-zäöüß0-9]{3,}", (t or "").lower()) if w not in {"und", "der", "die", "das", "for", "the", "mit", "von", "zum", "zur"}}


def schon_erfasst(k, events):
    ku = norm_url(k.get("url"))
    kw = woerter(k.get("titel"))
    for e in events:
        if ku and ku == norm_url(e.get("quelle")):
            return e["id"]
        if not k.get("start"):
            continue
        try:
            nah = abs((dt.date.fromisoformat(e["start"]) - dt.date.fromisoformat(k["start"])).days) <= 3
        except ValueError:
            nah = False
        if nah and kw:
            ew = woerter(e.get("name"))
            if ew and len(kw & ew) / min(len(kw), len(ew)) >= 0.5:
                return e["id"]
    return None


def schluessel(k):
    return (k.get("start") or "") + "|" + (norm_url(k.get("url")) or " ".join(sorted(woerter(k.get("titel"))))[:80])


# ---------------------------------------------------------------- Hauptteil
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quellen", default="tools/quellen.json")
    ap.add_argument("--repo", default=".")
    ap.add_argument("--aus", required=True)
    ap.add_argument("--nur", default="")
    ap.add_argument("--max-detail", type=int, default=25)
    ap.add_argument("--parallel", type=int, default=10)
    ap.add_argument("--entdecken", action="store_true", help="Nur Links zu Kalendern/Listen auf den Websites suchen")
    a = ap.parse_args()

    repo, aus = Path(a.repo), Path(a.aus)
    (aus / "abruf" / "terminzeilen").mkdir(parents=True, exist_ok=True)
    (aus / "abruf" / "listen").mkdir(parents=True, exist_ok=True)
    quellen = json.loads(Path(a.quellen).read_text(encoding="utf-8"))["quellen"]
    if a.nur:
        ids = set(a.nur.split(","))
        quellen = [q for q in quellen if q["id"] in ids]
    quellen = [q for q in quellen if q.get("aktiv", True) and q.get("url")]
    if a.entdecken:
        erg = {}
        with cf.ThreadPoolExecutor(max_workers=a.parallel) as ex:
            for q, r in zip(quellen, ex.map(entdecke, quellen)):
                erg[q["id"]] = r
                print(q["id"], len(r["links"]), len(r["feeds"]), r["fehler"][:1], flush=True)
        (aus / "abruf" / "entdecken.json").write_text(json.dumps(erg, ensure_ascii=False, indent=1), encoding="utf-8")
        return
    cache_p = aus / "abruf" / "cache.json"
    cache = json.loads(cache_p.read_text(encoding="utf-8")) if cache_p.exists() else {}
    verlauf_p = aus / "abruf" / "verlauf.json"
    verlauf = json.loads(verlauf_p.read_text(encoding="utf-8")) if verlauf_p.exists() else {}
    events = json.loads((repo / "data" / "events.json").read_text(encoding="utf-8"))
    entsch_p = repo / "tools" / "abruf_entscheidungen.json"
    entscheidungen = json.loads(entsch_p.read_text(encoding="utf-8")) if entsch_p.exists() else {}
    alter_status_p = aus / "abruf" / "status.json"
    alter_status = {s["id"]: s for s in json.loads(alter_status_p.read_text(encoding="utf-8")).get("quellen", [])} if alter_status_p.exists() else {}

    status, kandidaten = [], []
    sperre = threading.Lock()

    def eine(q):
        t0 = time.time()
        st = {"id": q["id"], "name": q.get("name", q["id"]), "art": q.get("art", "events"), "url": q["url"],
              "ok": False, "methoden": [], "anzahl": 0, "fehler": ""}
        try:
            if q.get("art") == "firmen":
                r = {"koepfe": [], "links": [], "eintraege": [],
                     "firmen": [firmenprofil(u, cache) for u in dict.fromkeys(q.get("urls", []))]}
                (aus / "abruf" / "listen" / f"{q['id']}.json").write_text(json.dumps({
                    "quelle": q["id"], "name": q.get("name"), "url": q["url"], "abgerufen": HEUTE.isoformat(), **r},
                    ensure_ascii=False, indent=1), encoding="utf-8")
                st["anzahl"] = len([f for f in r["firmen"] if not f.get("fehler")])
                st["methoden"] = ["firmenprofile"]
            elif q.get("art") == "liste":
                r = verarbeite_liste(q, cache, a.max_detail)
                (aus / "abruf" / "listen" / f"{q['id']}.json").write_text(json.dumps({
                    "quelle": q["id"], "name": q.get("name"), "url": q["url"], "abgerufen": HEUTE.isoformat(), **r},
                    ensure_ascii=False, indent=1), encoding="utf-8")
                st["anzahl"] = len(r["firmen"]) or len(r["eintraege"]) or len([l for l in r["links"] if l["extern"]])
                st["methoden"] = ["liste"] + (["detailseiten"] if r["eintraege"] else [])
            else:
                r = {"events": [], "methoden": [], "zeilen": []}
                fehler_teil = []
                for u in [q["url"]] + list(q.get("weitere_urls", [])):
                    try:
                        t = verarbeite_seite(q, cache, a.max_detail, u)
                        r["events"] += t["events"]
                        r["zeilen"] += t["zeilen"]
                        r["methoden"] += [m for m in t["methoden"] if m not in r["methoden"]]
                    except Exception as ex:  # noqa: BLE001
                        if u == q["url"] and not q.get("weitere_urls"):
                            raise
                        fehler_teil.append(f"{type(ex).__name__}")
                if fehler_teil and not r["events"] and not r["zeilen"]:
                    raise RuntimeError("alle Seiten fehlgeschlagen: " + ", ".join(fehler_teil))
                st["methoden"] = r["methoden"]
                gut = []
                for e in r["events"]:
                    if not e.get("start") or not e.get("titel") or not im_zeitraum(e["start"]):
                        continue
                    e["quelle_id"], e["quelle_name"] = q["id"], q.get("name", q["id"])
                    e["region_hinweis"] = q.get("region", "")
                    e["branchen_vorschlag"] = vorschlag(" ".join([e["titel"], e.get("kurz", ""), e.get("veranstalter", ""),
                                                                   " ".join(q.get("branchen", []))]), 4) or q.get("branchen", [])
                    gut.append(e)
                with sperre:
                    kandidaten.extend(gut)
                st["anzahl"] = len(gut)
                zp = aus / "abruf" / "terminzeilen" / f"{q['id']}.txt"
                if r["zeilen"]:
                    zp.write_text(f"# {q.get('name')} – {q['url']} – abgerufen {HEUTE}\n" + "\n".join(r["zeilen"]) + "\n", encoding="utf-8")
                    st["zeilen"] = len(r["zeilen"])
                elif zp.exists():
                    zp.unlink()
            st["ok"] = True
        except urllib.error.HTTPError as ex:
            st["fehler"] = f"HTTP {ex.code}"
        except PermissionError as ex:
            st["fehler"] = str(ex)
        except Exception as ex:  # noqa: BLE001
            st["fehler"] = f"{type(ex).__name__}: {str(ex)[:160]}"
        st["sekunden"] = round(time.time() - t0, 1)
        alt = alter_status.get(q["id"], {})
        st["zuletzt_ok"] = HEUTE.isoformat() if st["ok"] else alt.get("zuletzt_ok", "")
        return st

    with cf.ThreadPoolExecutor(max_workers=a.parallel) as ex:
        for st in ex.map(eine, quellen):
            status.append(st)
            print(f"{'OK ' if st['ok'] else 'ERR'} {st['id']:<34} {st['anzahl']:>4}  {','.join(st['methoden'])[:60]}  {st['fehler']}", flush=True)

    # Teilabruf: Ergebnisse der übrigen Quellen behalten
    if a.nur:
        bearbeitet = {q["id"] for q in quellen}
        alte_ev_p = aus / "abruf" / "events.json"
        if alte_ev_p.exists():
            for k in json.loads(alte_ev_p.read_text(encoding="utf-8")):
                if k.get("quelle_id") not in bearbeitet and im_zeitraum(k.get("start")):
                    kandidaten.append(k)
        status += [s for i, s in alter_status.items() if i not in bearbeitet]
    # zusammenführen
    zusammen = {}
    for k in kandidaten:
        s = schluessel(k)
        if s in zusammen:
            alt = zusammen[s]
            for f in ("ort", "veranstalter", "kurz", "ende", "land"):
                if not alt.get(f) and k.get(f):
                    alt[f] = k[f]
            if k["quelle_id"] not in alt["quellen"]:
                alt["quellen"].append(k["quelle_id"])
            continue
        k["schluessel"] = s
        k["quellen"] = list(dict.fromkeys([k["quelle_id"]] + k.get("quellen", [])))
        zusammen[s] = k
    liste = sorted(zusammen.values(), key=lambda k: (k["start"], k["titel"]))
    for k in liste:
        k["zuerst_gesehen"] = verlauf.get(k["schluessel"], HEUTE.isoformat())
        verlauf[k["schluessel"]] = k["zuerst_gesehen"]
        k["erfasst_als"] = schon_erfasst(k, events)
        k["entscheidung"] = entscheidungen.get(k["schluessel"], "")
    neu = [k for k in liste if not k["erfasst_als"] and not k["entscheidung"]]
    # Verlauf schlank halten
    grenze = (HEUTE - dt.timedelta(days=400)).isoformat()
    verlauf = {s: d for s, d in verlauf.items() if s[:10] >= grenze[:10]}
    cache = {u: c for u, c in cache.items() if c.get("geholt", "") >= (HEUTE - dt.timedelta(days=120)).isoformat()}

    def schreibe(name, obj):
        (aus / "abruf" / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    schreibe("events.json", liste)
    schreibe("neu.json", neu)
    schreibe("cache.json", cache)
    schreibe("verlauf.json", verlauf)
    ok = sum(1 for s in status if s["ok"])
    schreibe("status.json", {"abgerufen": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
                              "quellen_gesamt": len(status), "quellen_ok": ok, "kandidaten": len(liste), "neu": len(neu),
                              "quellen": sorted(status, key=lambda s: s["id"])})
    print(f"\nFERTIG: {ok}/{len(status)} Quellen erreichbar, {len(liste)} Termine gefunden, davon {len(neu)} neu.")


if __name__ == "__main__":
    main()
