/* Start-up- & Event-Radar – Seitenlogik. Statisch, ohne Server, ohne Cookies, ohne externe Anfragen. */
(function () {
  "use strict";
  var X = window.RadarExport, Radar = window.Radar;

  var RUBRIK = { region: "Region Regensburg", de: "Deutschland", eu: "EU", noneu: "Schweiz, UK, Norwegen" };
  var REITER = [["", "Alle"], ["region", "Region Regensburg"], ["de", "Deutschland"], ["eu", "EU & Europa"]];
  var REITER_TEXT = {
    "": "Alle kommenden Veranstaltungen der nächsten 18 Monate, sortiert nach Datum.",
    region: "Oberpfalz, Niederbayern, Landkreis Kelheim und Umgebung bis etwa 100 km. München und Nürnberg stehen unter Deutschland.",
    de: "Übriges Deutschland einschließlich München und Nürnberg.",
    eu: "EU-Staaten ohne Deutschland mit Schwerpunkt Österreich und große europäische Start-up-Events. Darunter gesondert: wichtige Termine in der Schweiz, im Vereinigten Königreich und in Norwegen."
  };
  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var MON_KURZ = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sep", "Okt", "Nov", "Dez"];
  var WTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var WTAG_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var FENSTER = [[3, "3 Monate"], [6, "6 Monate"], [12, "12 Monate"], [18, "18 Monate"]];
  var TITEL = { uebersicht: "Übersicht", termine: "Termine", startups: "Start-ups", kapital: "Kapital", archiv: "Archiv", merkliste: "Merkliste" };
  var SU_REGIONEN = [["", "Alle"], ["Ostbayern", "Ostbayern"], ["Bayern", "Bayern"], ["Deutschland", "Deutschland"], ["Europa", "Europa"]];
  var SU_TEXT = {
    "": "Start-ups rund um Dach, Solar, Bau und Fertigung – von Ostbayern bis Europa. Je näher, desto geringer meist der Aufwand für eine Zusammenarbeit.",
    Ostbayern: "Regensburg, Oberpfalz und Niederbayern – kurze Wege, schnelle Piloten.",
    Bayern: "Übriges Bayern, vor allem München und Augsburg.",
    Deutschland: "Start-ups aus dem übrigen Deutschland, deren Lösung besonders gut passt.",
    Europa: "Europäische Start-ups, vor allem aus Österreich, dem Baltikum, Skandinavien und den Niederlanden."
  };
  var SU_AKZENT = { "": "alle", Ostbayern: "region", Bayern: "bayern", Deutschland: "de", Europa: "eu" };
  var SUCHFELD_FARBE = {
    "Dach-Solar-Integration": "#d4831c",
    "Smarte Dach- und Entwässerungssysteme": "#178a87",
    "Digitale Planung und Vertrieb": "#5868d0",
    "Fertigung, Qualität und Energie": "#bf4f36",
    "Nachhaltigkeit und Material": "#3f8f3c",
    "Außenhandel und Zoll": "#8a55c2"
  };
  var LAND = { DE: "Deutschland", AT: "Österreich", EE: "Estland", FI: "Finnland", NL: "Niederlande", GB: "Vereinigtes Königreich", FR: "Frankreich", CH: "Schweiz" };
  var reduziert = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  var I = {
    ort: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    kal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    kalPlus: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>',
    uhr: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    leute: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.5 14.3c2.4-.4 4.4 1 5 3.7"/></svg>',
    euro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 6.5A6.5 6.5 0 1 0 17 17.5M4.5 10.5h9M4.5 13.5h9"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    stern: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6l-5.3 2.9 1.1-5.9L3.4 9.5l6-.8z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    links: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5"/></svg>',
    rechts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5L16 12l-6.5 6.5"/></svg>',
    suche: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    liste: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4.2" cy="6.5" r="1"/><circle cx="4.2" cy="12" r="1"/><circle cx="4.2" cy="17.5" r="1"/></svg>',
    zeit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M6 8.5h5M10 15.5h7"/><path d="M6 6.5v4M10 13.5v4"/></svg>',
    radar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><path d="M12 12L18 6"/></svg>',
    excel: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9h17M3.5 14.5h17M10 4v16"/></svg>',
    datei: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h6"/></svg>',
    druck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6.5L20.5 7"/></svg>',
    kopie: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/></svg>',
    abo: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M9 14.5a3 3 0 0 1 5.3-1.6M15 12v1.6h-1.6M15 16a3 3 0 0 1-5.3 1.4M9 18.3v-1.6h1.6"/></svg>',
    ziel: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" class="fill"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6"/></svg>',
    rakete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 2 4.5 5.5 4.5 9l-2 4h-5l-2-4C7.5 8.5 9 5 12 3z"/><path d="M9.5 16l-2 4M14.5 16l2 4"/><circle cx="12" cy="10" r="1.6"/></svg>',
    welt: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.5 3.6 8.5S14.5 17.9 12 20.5M12 3.5C9.5 6.1 8.4 9 8.4 12s1.1 5.9 3.6 8.5"/></svg>'
  };

  /* ---------- Speicher (nur dieser Browser) ---------- */
  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* nicht verfügbar */ } }
  };

  var S = {
    events: [], startups: [], meta: {}, hinweise: [], heute: heuteISO(), route: null, geladen: false,
    fenster: 6, heldPrio: { A: true, B: true, C: true },
    t: neuerFilter("liste"), a: neuerFilter("liste"),
    s: { feld: "", region: "", q: "", merk: false },
    runden: [], investoren: [], logos: {}, k: { art: "", thema: "", nurRadar: false },
    liste: [], suListe: [], radare: [], druck: null, panel: null
  };
  function neuerFilter(ansicht) { return { rubrik: "", prio: { A: true, B: true, C: true }, kat: "", monat: "", q: "", merk: false, best: false, ansicht: ansicht, kal: null }; }
  var merk = new Set(store.get("radar-merkliste", []));

  /* ---------- Hilfen ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function heuteISO() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function dt(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +(p[2] || 1)); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addTage(s, n) { var d = dt(s); d.setDate(d.getDate() + n); return iso(d); }
  function addMonate(s, n) { var d = dt(s); var t = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); var max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(t, max)); return iso(d); }
  function tageBis(s) { return Math.round((dt(s) - dt(S.heute)) / 86400000); }
  function de(s) { if (!s) return ""; var p = s.split("-"); return p[2] + "." + p[1] + "." + p[0]; }
  function deKurz(s) { var p = s.split("-"); return +p[2] + "." + +p[1] + "."; }
  function wt(s) { return dt(s).getDay(); }
  function langDatum(s, ohneWt) { var d = dt(s); return (ohneWt ? "" : WTAG[d.getDay()] + ", ") + d.getDate() + ". " + MONATE[d.getMonth()] + " " + d.getFullYear(); }
  function komma(x) { return String(x).replace(".", ","); }
  function monatLabel(ym) { var p = ym.split("-"); return MONATE[+p[1] - 1] + " " + p[0]; }
  function naechsterMonat(ym) { var p = ym.split("-"), y = +p[0], m = +p[1] + 1; if (m > 12) { m = 1; y++; } return y + "-" + pad(m); }
  function vorherMonat(ym) { var p = ym.split("-"), y = +p[0], m = +p[1] - 1; if (m < 1) { m = 12; y--; } return y + "-" + pad(m); }
  function vorbei(e) { return e.ende < S.heute; }
  function laeuft(e) { return e.start <= S.heute && e.ende >= S.heute; }
  function kurzname(e) { return e.name.split(" – ")[0]; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function site() { return S.meta.site_url || (location.origin + location.pathname.replace(/index\.html$/, "")); }
  function dateiname(teil, ext) { return "startup-radar-" + teil.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + S.heute + "." + ext; }
  function kurzUrl(u) { try { var x = new URL(u); return x.hostname.replace(/^www\./, "") + (x.pathname.length > 1 ? x.pathname.slice(0, 36) + (x.pathname.length > 36 ? "…" : "") : ""); } catch (e) { return u; } }
  function plural(n, a, b) { return n + " " + (n === 1 ? a : b); }
  function findeEvent(id) { for (var i = 0; i < S.events.length; i++) if (S.events[i].id === id) return S.events[i]; return null; }
  function findeDeal(id) { for (var i = 0; i < S.runden.length; i++) if (S.runden[i].id === id) return S.runden[i]; return null; }
  function findeInvestor(id) { for (var i = 0; i < S.investoren.length; i++) if (S.investoren[i].id === id) return S.investoren[i]; return null; }
  function findeStartup(id) { for (var i = 0; i < S.startups.length; i++) if (S.startups[i].id === id) return S.startups[i]; return null; }
  function nachStart(a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : (a.name < b.name ? -1 : 1); }
  function kommende() { return S.events.filter(function (e) { return !vorbei(e); }).sort(nachStart); }

  function relativ(e) {
    if (laeuft(e)) return e.start === e.ende ? "heute" : "läuft gerade";
    var n = tageBis(e.start);
    if (n < 0) { var m = -tageBis(e.ende); return m < 14 ? "vor " + plural(m, "Tag", "Tagen") : m < 60 ? "vor " + plural(Math.round(m / 7), "Woche", "Wochen") : "vor " + plural(Math.round(m / 30.4), "Monat", "Monaten"); }
    if (n === 1) return "morgen";
    if (n < 14) return "in " + n + " Tagen";
    if (n < 60) return "in " + Math.round(n / 7) + " Wochen";
    return "in " + plural(Math.round(n / 30.4), "Monat", "Monaten");
  }
  function entfernung(e) {
    if (e.online) return "online";
    if (!e.geo) return "";
    var d = Radar.proj(e.geo[0], e.geo[1]).d;
    if (d < 12) return "in Regensburg";
    return (Math.round(d / 5) * 5).toLocaleString("de-DE") + " km";
  }
  function zeitraum(e) {
    if (e.start === e.ende) return WTAG[wt(e.start)] + ", " + de(e.start);
    var a = e.start.split("-"), b = e.ende.split("-");
    if (a[0] === b[0] && a[1] === b[1]) return +a[2] + ".–" + +b[2] + "." + b[1] + "." + b[0];
    if (a[0] === b[0]) return +a[2] + "." + a[1] + ".–" + +b[2] + "." + b[1] + "." + b[0];
    return de(e.start) + " – " + de(e.ende);
  }
  function zeitraumLang(e) {
    if (e.start === e.ende) return langDatum(e.start);
    var a = dt(e.start), b = dt(e.ende);
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return WTAG[a.getDay()] + "–" + WTAG[b.getDay()] + ", " + a.getDate() + ".–" + b.getDate() + ". " + MONATE[a.getMonth()] + " " + a.getFullYear();
    return langDatum(e.start) + " bis " + langDatum(e.ende);
  }
  function datumsBlock(e) {
    var a = dt(e.start), b = dt(e.ende);
    if (e.start === e.ende) return { tag: a.getDate() + ".", unter: WTAG_LANG[a.getDay()] };
    if (a.getMonth() === b.getMonth()) return { tag: a.getDate() + ".–" + b.getDate() + ".", unter: WTAG[a.getDay()] + "–" + WTAG[b.getDay()] };
    return { tag: a.getDate() + ".–" + b.getDate() + ".", unter: "bis " + b.getDate() + ". " + MON_KURZ[b.getMonth()] };
  }

  function schild(p, g, gross) {
    var t = "Priorität " + p + (g != null ? ", Gesamtscore " + komma(g) : "");
    return '<span class="schild schild-' + p + (gross ? " gross" : "") + '" title="' + esc(t) + '"><b>' + p + "</b>" + (g != null ? "<span>" + komma(g.toFixed ? g.toFixed(1) : g) + "</span>" : "") + "</span>";
  }
  function status(e) {
    return e.status === "bestätigt" ? '<span class="status" title="Termin vom Veranstalter veröffentlicht">bestätigt</span>'
      : '<span class="status schaetz" title="Aus dem Vorjahr abgeleitet – vor der Planung prüfen">geschätzt</span>';
  }
  function sternKnopf(id, name) {
    var an = merk.has(id);
    return '<button type="button" class="icon-knopf stern' + (an ? " an" : "") + '" data-stern="' + esc(id) + '" aria-pressed="' + an + '" title="' + (an ? "Von der Merkliste nehmen" : "Merken") + '" aria-label="' + esc((an ? "Von der Merkliste nehmen: " : "Merken: ") + name) + '">' + I.stern + "</button>";
  }
  function icsKnopf(e) { return '<button type="button" class="icon-knopf" data-ics="' + esc(e.id) + '" title="In Kalender speichern" aria-label="' + esc("In Kalender speichern: " + e.name) + '">' + I.kalPlus + "</button>"; }
  function mini(wert, art) {
    var h = '<span class="mini ' + art + '" title="' + (art === "aufwand" ? "Umsetzungsaufwand " : "Relevanz ") + wert + ' von 5">' + (art === "aufwand" ? "Aufwand" : "Relevanz") + "<i>";
    for (var i = 1; i <= 5; i++) h += "<em" + (i <= wert ? ' class="v"' : "") + "></em>";
    return h + "</i></span>";
  }

  /* ---------- Daten laden ---------- */
  function lade(pfad) {
    return fetch(pfad + "?v=" + Date.now(), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(pfad + ": " + r.status);
      return r.json();
    });
  }
  var leer = function (d) { return function () { return d; }; };
  Promise.all([lade("data/events.json"), lade("data/startups.json"), lade("data/meta.json"), lade("data/hinweise.json").catch(leer([])),
    lade("data/runden.json").catch(leer([])), lade("data/investoren.json").catch(leer([])), lade("assets/logos/index.json").catch(leer({}))])
    .then(function (r) {
      S.events = r[0]; S.startups = r[1]; S.meta = r[2]; S.hinweise = r[3] || [];
      S.runden = r[4] || []; S.investoren = r[5] || []; S.logos = r[6] || {};
      S.geladen = true;
      zeigeMerkZahl(false);
      routen();
    })
    .catch(function (err) {
      $("#ansicht").innerHTML = '<div class="fehler"><h1>Die Daten konnten nicht geladen werden.</h1><p>Bitte die Seite neu laden. Wenn der Fehler bleibt, ist die Seite gerade in Aktualisierung – in ein paar Minuten noch einmal versuchen.</p><p class="klein">' + esc(err.message) + "</p></div>";
    });

  /* ---------- Navigation ---------- */
  window.addEventListener("hashchange", routen);
  function leseHash() {
    var h = decodeURIComponent(location.hash.slice(1)) || "uebersicht";
    if (h === "alle" || h === "termine") return { r: "termine", rub: "" };
    if (h === "region" || h === "de" || h === "eu") return { r: "termine", rub: h };
    if (TITEL[h]) return { r: h, rub: null };
    return { r: "uebersicht", rub: null };
  }
  function routen() {
    if (!S.geladen) return;
    var z = leseHash();
    var wechsel = z.r !== S.route;
    if (z.r === "termine") { if (S.t.rubrik !== z.rub) S.t.monat = ""; S.t.rubrik = z.rub; }
    S.route = z.r;
    $$("[data-nav]").forEach(function (a) {
      var an = a.getAttribute("data-nav") === z.r;
      a.classList.toggle("aktiv", an);
      if (an) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.title = TITEL[z.r] + " – Start-up- & Event-Radar";
    var zeichne = function () {
      aufraeumen();
      ({ uebersicht: zeigeUebersicht, termine: zeigeTermine, startups: zeigeStartups, kapital: zeigeKapital, archiv: zeigeArchiv, merkliste: zeigeMerkliste })[z.r]();
      if (wechsel) window.scrollTo(0, 0);
    };
    if (wechsel && document.startViewTransition && !reduziert.matches && S.schonGezeichnet) {
      try {
        var vt = document.startViewTransition(zeichne);
        [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (pr) { if (pr && pr.catch) pr.catch(function () { /* Übergang übersprungen */ }); });
      } catch (e) { zeichne(); }
    } else zeichne();
    S.schonGezeichnet = true;
  }
  function aufraeumen() {
    S.radare.forEach(function (r) { r.entferne(); });
    S.radare = [];
    ansichtRadarWeg();
    tooltip(null);
  }
  function ansichtRadarWeg() { if (S.ansichtRadar) { S.ansichtRadar.entferne(); S.ansichtRadar = null; } }

  /* ---------- Dunkler Seitenkopf für Unterseiten ---------- */
  function kopfband(o) {
    return '<section class="kopfband" data-akzent="' + esc(o.akzent || "alle") + '" id="kopfband"><div class="kopfband-innen">' +
      '<div class="kb-text"><h1>' + esc(o.titel) + "</h1>" + '<p class="kb-intro"' + (o.textId ? ' id="' + o.textId + '"' : "") + ">" + esc(o.text) + "</p>" +
      (o.reiter || "") + (o.unten || "") + "</div>" +
      (o.rechts ? '<div class="kb-rechts">' + o.rechts + "</div>" : "") + "</div></section>";
  }
  function bereichFuer(liste) {
    var max = 0;
    liste.forEach(function (x) { if (x.geo) max = Math.max(max, Radar.proj(x.geo[0], x.geo[1]).d); });
    return Math.max(70, Math.min(2400, max * 1.18 || 2400));
  }

  /* ---------- Logos und Kürzel ---------- */
  function kuerzel(name) {
    var w = name.replace(/[^A-Za-zÄÖÜäöü0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
    if (!w.length) return "?";
    if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
    return (w[0][0] + w[1][0]).toUpperCase();
  }
  function logo(s, gross) {
    var l = S.logos[s.id], farbe = SUCHFELD_FARBE[s.suchfeld] || "#5b6b7b";
    var cls = "logo" + (gross ? " gross" : "");
    if (l && l.datei) return '<span class="' + cls + ' bild" style="--f:' + farbe + '"><img src="assets/logos/' + esc(l.datei) + '" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'mono\');this.parentNode.classList.remove(\'bild\');this.parentNode.textContent=\'' + esc(kuerzel(s.name)) + '\'"></span>';
    return '<span class="' + cls + ' mono" style="--f:' + farbe + '" aria-hidden="true">' + esc(kuerzel(s.name)) + "</span>";
  }
  function suchfeldTag(feld) { return '<span class="sf-tag" style="--f:' + (SUCHFELD_FARBE[feld] || "#5b6b7b") + '">' + esc(feld) + "</span>"; }

  /* ---------- Tooltip ---------- */
  var tipEl = $("#tooltip");
  function tooltip(e, p) {
    if (!e) { tipEl.hidden = true; return; }
    tipEl.innerHTML = '<span class="tt-kopf">' + schild(e.prioritaet, e.gesamt) + '<span class="tt-zeile">' + esc(relativ(e)) + "</span></span>" +
      "<strong>" + esc(e.name) + '</strong><span class="tt-zeile">' + esc(zeitraum(e)) + "<br>" + esc(e.ort) + (entfernung(e) && !e.online ? ", " + esc(entfernung(e)) : "") +
      (e.status === "geschätzt" ? "<br>Termin geschätzt" : "") + "</span>";
    tipEl.hidden = false;
    var oben = p.y - p.r > 150;
    tipEl.classList.toggle("unten", !oben);
    var x = Math.max(160, Math.min(window.innerWidth - 160, p.x));
    tipEl.style.left = x + "px";
    tipEl.style.top = (oben ? p.y - p.r : p.y + p.r) + "px";
  }
  function tooltipStartup(s, p) {
    if (!s) { tipEl.hidden = true; return; }
    tipEl.innerHTML = '<span class="tt-kopf">' + schild(s.prioritaet) + '<span class="tt-zeile">' + esc(s.region) + "</span></span><strong>" + esc(s.name) + '</strong><span class="tt-zeile">' + esc(s.sitz) + "<br>" + esc(s.suchfeld) + "</span>";
    tipEl.hidden = false;
    var oben = p.y - p.r > 150;
    tipEl.classList.toggle("unten", !oben);
    tipEl.style.left = Math.max(160, Math.min(window.innerWidth - 160, p.x)) + "px";
    tipEl.style.top = (oben ? p.y - p.r : p.y + p.r) + "px";
  }
  document.addEventListener("pointerover", function (ev) {
    if (ev.pointerType && ev.pointerType !== "mouse") return;
    var t = ev.target.closest && ev.target.closest("[data-tip]");
    if (!t) return;
    var e = findeEvent(t.getAttribute("data-tip")); if (!e) return;
    var r = t.getBoundingClientRect();
    tooltip(e, { x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2, r: r.height / 2 + 2 });
  });
  document.addEventListener("pointerout", function (ev) {
    var t = ev.target.closest && ev.target.closest("[data-tip]");
    if (t && !(ev.relatedTarget && t.contains(ev.relatedTarget))) tooltip(null);
  });
  window.addEventListener("scroll", function () { if (!tipEl.hidden && !S.tipFest) tooltip(null); }, { passive: true });

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(text) {
    toastEl.textContent = text; toastEl.classList.add("an");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("an"); }, 2600);
  }

  /* ---------- Zahlen sanft hochzählen ---------- */
  function zaehle(el, bis) {
    var von = parseInt(el.textContent, 10) || 0;
    if (reduziert.matches || von === bis) { el.textContent = bis; return; }
    var t0 = performance.now(), dauer = 450;
    (function f(t) {
      var k = Math.min(1, (t - t0) / dauer), v = Math.round(von + (bis - von) * (1 - Math.pow(1 - k, 3)));
      el.textContent = v; if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ============================================================
     Übersicht
     ============================================================ */
  function heldListe() {
    var bis = addMonate(S.heute, S.fenster);
    return kommende().filter(function (e) { return e.start <= bis && S.heldPrio[e.prioritaet]; });
  }
  function zeigeUebersicht() {
    var aktiv = kommende();
    var h = "";
    h += '<section class="held" aria-labelledby="held-titel"><div class="held-innen">' +
      '<div class="held-text">' +
      '<p class="held-stand"><span class="live" aria-hidden="true"></span>Stand ' + esc(langDatum(S.meta.stand, true)) + "</p>" +
      '<h1 class="held-titel" id="held-titel"><span class="ht-zahl" id="ht-zahl">0</span> <span id="ht-text">Termine</span></h1>' +
      '<p class="held-sub" id="held-sub"></p>' +
      '<div class="held-steuer">' +
      '<div class="segment" role="radiogroup" aria-label="Zeitraum">' + FENSTER.map(function (f) {
        return '<button type="button" role="radio" data-fenster="' + f[0] + '" aria-checked="' + (S.fenster === f[0]) + '">' + f[1] + "</button>";
      }).join("") + "</div>" +
      prioWahl(S.heldPrio, "held") + "</div></div>" +
      '<div class="held-radar"><div class="radar" id="radar-held"></div>' +
      '<div class="radar-legende" id="held-legende"></div></div>' +
      '<div class="held-visier"><div class="visier-kopf"><h2>Als Nächstes</h2><a href="#termine">Alle ' + aktiv.length + " Termine</a></div>" +
      '<ol class="visier" id="visier"></ol></div>' +
      "</div></section>";

    if (!store.get("radar-hilfe-aus", false)) {
      h += '<div class="hilfe-hinweis" id="hilfe-hinweis"><div class="breite"><p><strong>Neu hier?</strong> Jeder Punkt im Radar ist eine Veranstaltung – Richtung und Abstand zeigen, wo sie von Regensburg aus liegt. Antippen öffnet alle Angaben.</p>' +
        '<button type="button" class="knopf leise klein" data-hilfe>So funktioniert die Seite</button><button type="button" class="knopf leise klein" id="hinweis-aus">Ausblenden</button></div></div>';
    }

    h += '<div class="breite">';
    h += '<section class="abschnitt" aria-labelledby="zs-titel"><div class="abschnitt-kopf"><h2 id="zs-titel">Die nächsten 18 Monate</h2><p>Jeder Balken ist ein Termin. Zum Blättern ziehen oder wischen, für Details antippen.</p></div><div id="zs-ueb"></div></section>';

    var fristen = S.events.filter(function (e) { return e.anmeldeschluss && e.anmeldeschluss >= S.heute; })
      .sort(function (a, b) { return a.anmeldeschluss < b.anmeldeschluss ? -1 : 1; }).slice(0, 5);
    var quick = S.startups.filter(function (s) { return s.quickwin; }).sort(function (a, b) { return b.relevanz - a.relevanz || a.aufwand - b.aufwand; });

    h += '<section class="abschnitt raster-3">';
    h += '<div class="block"><h2>Fristen</h2>' + (fristen.length ? '<ul class="fristen">' + fristen.map(function (e) {
      var n = tageBis(e.anmeldeschluss);
      return '<li><button type="button" data-oeffne="' + esc(e.id) + '"><span class="countdown' + (n <= 14 ? " dringend" : "") + '"><b>' + n + "</b><small>" + (n === 1 ? "Tag" : "Tage") + "</small></span>" +
        '<span><span class="f-name">' + esc(e.name) + '</span><span class="f-art">' + esc(e.frist_art || "Anmeldeschluss") + '</span><span class="f-datum">bis ' + esc(langDatum(e.anmeldeschluss)) + "</span></span></button></li>";
    }).join("") + "</ul>" : "<p>Aktuell sind keine Fristen bekannt. Neue Anmeldeschlüsse erscheinen hier, sobald die Veranstalter sie veröffentlichen.</p>") + "</div>";

    h += '<div class="block"><h2>Neu im Stand vom ' + esc(deKurz(S.meta.stand)) + '</h2><ul class="aenderungen">' +
      (S.meta.aenderungen || []).map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul></div>";

    h += '<div class="block"><div class="block-kopf"><h2>Start-ups mit schnellem Nutzen</h2></div><p>Hohe Relevanz bei geringem Aufwand.</p><ul class="quick">' + quick.slice(0, 6).map(function (s) {
      return '<li><button type="button" data-oeffne-su="' + esc(s.id) + '">' + logo(s) + '<span><span class="q-name">' + esc(s.name) + '</span><span class="q-text">' + esc(s.sitz) + ", " + esc(s.suchfeld) + "</span></span>" +
        '<span class="q-werte">' + mini(s.relevanz, "relevanz") + mini(s.aufwand, "aufwand") + "</span></button></li>";
    }).join("") + '</ul><p style="margin-top:12px"><a href="#startups">' + (quick.length > 6 ? (quick.length - 6) + " weitere Quick Wins und " : "") + "alle " + S.startups.length + " Start-ups ansehen</a></p></div>";
    h += "</section>";

    h += kapitalTeaser();
    h += dranbleibenHtml();
    h += priorisierungHtml(aktiv);
    h += "</div>";

    $("#ansicht").innerHTML = h;

    var radar = new Radar($("#radar-held"), {
      oeffnen: function (id) { oeffnePanel("event", id, heldListe().map(function (e) { return e.id; })); },
      hover: function (id) { $$("#visier button").forEach(function (b) { b.classList.toggle("fokus", b.getAttribute("data-oeffne") === id); }); },
      tooltip: tooltip
    });
    S.radare.push(radar);
    S.heldRadar = radar;
    heldAktualisieren(true);

    zeitstrahl($("#zs-ueb"), aktiv, { monate: 18 });

    $$("[data-fenster]").forEach(function (b) {
      b.addEventListener("click", function () {
        S.fenster = +b.getAttribute("data-fenster");
        $$("[data-fenster]").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
        heldAktualisieren();
      });
    });
    bindePrioWahl(S.heldPrio, "held", heldAktualisieren);
    var aus = $("#hinweis-aus");
    if (aus) aus.addEventListener("click", function () { store.set("radar-hilfe-aus", true); var x = $("#hilfe-hinweis"); if (x) x.remove(); });
    $$("[data-kopiere]").forEach(function (b) { b.addEventListener("click", function () { kopiere(b.getAttribute("data-kopiere") === "abo" ? site() + "events.ics" : (S.hinweisText || ""), b); }); });
  }

  function heldAktualisieren(erst) {
    var liste = heldListe();
    S.druck = { art: "events", liste: liste, titel: "Termine der nächsten " + S.fenster + " Monate" };
    zaehle($("#ht-zahl"), liste.length);
    $("#ht-text").textContent = (liste.length === 1 ? "Termin" : "Termine") + " in den nächsten " + S.fenster + " Monaten";
    var a = liste.filter(function (e) { return e.prioritaet === "A"; });
    var gesch = liste.filter(function (e) { return e.status === "geschätzt"; }).length;
    var naechsterA = a[0];
    var sub = "";
    if (!liste.length) sub = "Mit dieser Auswahl liegt nichts im Zeitraum. Zeitraum verlängern oder Prioritäten einschalten.";
    else {
      sub = a.length + " mit Priorität A" + (gesch ? ", bei " + gesch + " ist das Datum noch geschätzt" : "") + ".";
      if (naechsterA) sub += " Nächster A-Termin: <strong>" + esc(naechsterA.name) + "</strong>, " + esc(relativ(naechsterA)) + ".";
    }
    $("#held-sub").innerHTML = sub;

    var visier = liste.slice(0, 6);
    $("#visier").innerHTML = visier.length ? visier.map(function (e) {
      return '<li><button type="button" data-oeffne="' + esc(e.id) + '" data-kontext="held"><span class="v-datum">' + esc(deKurz(e.start)) + "<small>" + esc(relativ(e)) + "</small></span>" +
        '<span><span class="v-name">' + esc(e.name) + '</span><span class="v-ort">' + esc(e.ort) + (entfernung(e) && !e.online && entfernung(e) !== "in Regensburg" ? ", " + esc(entfernung(e)) : "") + "</span></span>" +
        schild(e.prioritaet, e.gesamt) + "</button></li>";
    }).join("") : '<li class="v-leer">Keine Termine in dieser Auswahl.</li>';
    $$("#visier button").forEach(function (b) {
      var id = b.getAttribute("data-oeffne");
      b.addEventListener("mouseenter", function () { S.heldRadar.fokus(id); });
      b.addEventListener("mouseleave", function () { S.heldRadar.fokus(null); });
      b.addEventListener("focus", function () { S.heldRadar.fokus(id); });
      b.addEventListener("blur", function () { S.heldRadar.fokus(null); });
    });

    var online = liste.filter(function (e) { return e.online; });
    var ohneOrt = liste.filter(function (e) { return !e.online && !e.geo; });
    $("#held-legende").innerHTML = radarLegende(online, ohneOrt);
    S.heldRadar.setze(liste, false);
  }
  function radarLegende(online, ohneOrt) {
    return '<span><i class="lg-punkt lg-A"></i>A</span><span><i class="lg-punkt lg-B"></i>B</span><span><i class="lg-punkt lg-C"></i>C</span>' +
      '<span><i class="lg-punkt lg-hohl"></i>Datum geschätzt</span><span><i class="lg-ring"></i>100 km um Regensburg</span>' +
      online.map(function (e) { return '<button type="button" class="online-chip" data-oeffne="' + esc(e.id) + '">' + I.welt.replace("<svg", '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"') + "Online: " + esc(kurzname(e)) + "</button>"; }).join("") +
      (ohneOrt.length ? "<span>" + plural(ohneOrt.length, "Termin", "Termine") + " ohne festen Ort</span>" : "");
  }

  function prioWahl(zustand, name) {
    return '<div class="prio-wahl" role="group" aria-label="Priorität">' + ["A", "B", "C"].map(function (p) {
      return '<button type="button" data-prio-' + name + '="' + p + '" aria-pressed="' + zustand[p] + '" title="Priorität ' + p + ' ein- oder ausblenden">' + schild(p) + "</button>";
    }).join("") + "</div>";
  }
  function bindePrioWahl(zustand, name, nachher) {
    $$("[data-prio-" + name + "]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-prio-" + name);
        zustand[p] = !zustand[p];
        if (!zustand.A && !zustand.B && !zustand.C) { zustand.A = zustand.B = zustand.C = true; $$("[data-prio-" + name + "]").forEach(function (x) { x.setAttribute("aria-pressed", "true"); }); }
        else b.setAttribute("aria-pressed", zustand[p]);
        nachher(true);
      });
    });
  }

  function dranbleibenHtml() {
    var feedUrl = site() + "feed.xml", icsUrl = site() + "events.ics", webcal = icsUrl.replace(/^https?:/, "webcal:");
    var hinweis = S.hinweise.slice().sort(function (a, b) { return a.datum < b.datum ? 1 : -1; })[0];
    S.hinweisText = hinweis ? hinweis.text : "";
    var h = '<section class="abschnitt"><div class="abschnitt-kopf"><h2>Auf dem Laufenden bleiben</h2><p>Die Seite wird jeden Montag geprüft und am ersten Werktag im Monat vollständig neu recherchiert.</p></div><div class="dranbleiben">';
    h += "<div><h3>" + I.mail + "E-Mail-Hinweise</h3><p>Steht in den nächsten 30 Tagen etwas an, kommt montags ein kurzer Hinweis – an eine Adresse deiner Wahl.</p>" +
      '<details class="aufklapp"><summary>So geht es</summary><ol class="schritte"><li>„Per E-Mail abonnieren“ öffnet den Dienst Feedrabbit.</li><li>E-Mail-Adresse eintragen und die Bestätigungsmail anklicken.</li><li>Abmelden geht jederzeit über den Link in jeder Mail.</li></ol><p class="klein">Feedrabbit ist ein externer, werbefreier Dienst; die Adresse wird dort gespeichert, nicht auf dieser Seite.</p></details>' +
      '<div class="knopfreihe"><a class="knopf" target="_blank" rel="noopener noreferrer" href="https://feedrabbit.com/subscriptions/new?url=' + encodeURIComponent(feedUrl) + '">' + I.mail + "Per E-Mail abonnieren</a></div></div>";
    h += "<div><h3>" + I.abo + "Kalender abonnieren</h3><p>Alle kommenden Termine als Internetkalender in Outlook, der sich selbst aktualisiert.</p>" +
      '<details class="aufklapp"><summary>Anleitung für Outlook</summary><ol class="schritte"><li><strong>Outlook im Web / neues Outlook:</strong> Kalender, „Kalender hinzufügen“, „Aus dem Internet abonnieren“, Link einfügen, „Importieren“.</li><li><strong>Klassisches Outlook:</strong> Kalender, „Kalender hinzufügen“, „Aus dem Internet …“, Link einfügen, OK.</li></ol>' +
      '<p class="klein">Abonnierte Kalender zeigen in Outlook meist keine Erinnerungen. Für Erinnerungen beim einzelnen Termin „In Kalender speichern“ nutzen.</p></details>' +
      '<div class="kopierfeld"><input class="feld" type="text" readonly value="' + esc(icsUrl) + '" aria-label="Link zum Kalender-Abo"><button type="button" class="knopf leise" data-kopiere="abo">' + I.kopie + "Kopieren</button></div>" +
      '<div class="knopfreihe"><a class="knopf leise" href="' + esc(webcal) + '">' + I.kal + "In Kalender-App öffnen</a></div></div>";
    h += "<div><h3>" + I.info + "Wochenhinweis</h3>" + (hinweis ? "<p>Vom " + esc(langDatum(hinweis.datum, true)) + " – zum Weiterleiten.</p>" +
      '<details class="aufklapp"><summary>Text ansehen</summary><pre class="hinweistext">' + esc(hinweis.text) + "</pre></details>" +
      '<div class="knopfreihe"><button type="button" class="knopf leise" data-kopiere="hinweis">' + I.kopie + 'Text kopieren</button><a class="knopf leise" href="mailto:?subject=' + encodeURIComponent(hinweis.titel) + "&body=" + encodeURIComponent(hinweis.text) + '">' + I.mail + "Als E-Mail öffnen</a></div>"
      : "<p>Aktuell steht nichts an.</p>") + "</div>";
    return h + "</div></section>";
  }

  function priorisierungHtml(aktiv) {
    var tab = {};
    aktiv.forEach(function (e) { var r = e.rubrik === "noneu" ? "eu" : e.rubrik; tab[r] = tab[r] || { A: 0, B: 0, C: 0, n: 0 }; tab[r][e.prioritaet]++; tab[r].n++; });
    var max = Math.max.apply(null, ["region", "de", "eu"].map(function (r) { return (tab[r] || { n: 0 }).n; }).concat([1]));
    var h = '<section class="abschnitt"><div class="abschnitt-kopf"><h2>So wird priorisiert</h2></div><div class="prio-erklaer"><div>' +
      "<p>Jede Veranstaltung bekommt in vier Kriterien 1 bis 5 Punkte. Daraus wird ein gewichteter Gesamtscore:</p>" +
      '<div class="gewichte"><div style="flex:40"><b>40 %</b><span>Relevanz für Dach, Solar, Bau, Handwerk</span></div><div style="flex:30"><b>30 %</b><span>Zugang zu Start-ups und Entscheidern</span></div><div style="flex:20"><b>20 %</b><span>Aufwand (5 = gering)</span></div><div style="flex:10"><b>10 %</b><span>Verlässlichkeit</span></div></div>' +
      '<div class="schwellen"><span>' + schild("A") + "ab 4,0: besonders lohnend</span><span>" + schild("B") + "3,0 bis 3,9: lohnend</span><span>" + schild("C") + "unter 3,0: bei passendem Anlass</span></div>" +
      '<p class="klein" style="margin-top:14px">„Geschätzt“ heißt: Der Veranstalter hat das Datum noch nicht veröffentlicht, es ist aus dem Vorjahr abgeleitet. Vor der Planung prüfen.</p></div>' +
      '<div><h3 style="font-size:20px;margin-bottom:10px">Kommende Termine nach Rubrik</h3><div class="verteilung">' + ["region", "de", "eu"].map(function (r) {
        var t = tab[r] || { A: 0, B: 0, C: 0, n: 0 };
        var w = function (x) { return (x / max * 100).toFixed(1) + "%"; };
        return '<a class="vt-zeile" href="#' + r + '" style="color:inherit;text-decoration:none"><span class="vt-name">' + esc(r === "eu" ? "EU & Europa" : RUBRIK[r]) + '</span><span class="vt-bar" title="A: ' + t.A + ", B: " + t.B + ", C: " + t.C + '"><i class="a" style="width:' + w(t.A) + '"></i><i class="b" style="width:' + w(t.B) + '"></i><i class="c" style="width:' + w(t.C) + '"></i></span><span class="vt-zahl">' + t.n + "</span></a>";
      }).join("") + '</div><p class="klein" style="margin-top:10px">Gelb A, Blau B, Grau C. Antippen öffnet die Rubrik.</p></div></div></section>';
    return h;
  }

  function kopiere(text, knopf) {
    var fertig = function () { toast("In die Zwischenablage kopiert"); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(fertig, alt); else alt();
    function alt() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); fertig(); } catch (e) { /* ignorieren */ } ta.remove();
    }
  }

  /* ============================================================
     Zeitstrahl
     ============================================================ */
  var messCtx;
  function textBreite(t) {
    if (!messCtx) { messCtx = document.createElement("canvas").getContext("2d"); }
    messCtx.font = '500 14px "Barlow", system-ui, sans-serif';
    return messCtx.measureText(t).width;
  }
  function zeitstrahl(ziel, liste, opt) {
    opt = opt || {};
    var von = (opt.von || S.heute).slice(0, 7);
    var monate = opt.monate || 18;
    if (liste.length) {
      var letzter = liste.reduce(function (m, e) { return e.ende > m ? e.ende : m; }, "0000").slice(0, 7);
      var erster = liste.reduce(function (m, e) { return e.start < m ? e.start : m; }, "9999").slice(0, 7);
      if (opt.anpassen) { von = erster; }
      var n = 1, m = von; while (m < letzter && n < 40) { m = naechsterMonat(m); n++; }
      monate = Math.max(opt.anpassen ? n : monate, n);
    }
    var mw = window.innerWidth < 640 ? 96 : 136;
    var mListe = [], m2 = von;
    for (var i = 0; i < monate; i++) { mListe.push(m2); m2 = naechsterMonat(m2); }
    var bisYm = mListe[mListe.length - 1];
    function x(s) {
      var ym = s.slice(0, 7), idx = mListe.indexOf(ym);
      if (idx < 0) return ym < von ? 0 : monate * mw;
      var d = dt(s), tage = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      return idx * mw + (d.getDate() - 1) / tage * mw;
    }
    var items = liste.filter(function (e) { return e.ende.slice(0, 7) >= von && e.start.slice(0, 7) <= bisYm; }).slice().sort(nachStart);
    var bahnen = [], h = "";
    items.forEach(function (e) {
      var x0 = x(e.start), x1 = Math.max(x(e.ende) + mw / 31, x0 + 12);
      var label = kurzname(e), lw = Math.min(textBreite(label) + 8, 240);
      var ende = x1 + 7 + lw;
      var b = 0; while (b < bahnen.length && bahnen[b] > x0 - 6) b++;
      bahnen[b] = ende;
      h += '<button type="button" class="zs-ev prio-' + e.prioritaet + (e.status === "geschätzt" ? " geschaetzt" : "") + '" data-oeffne="' + esc(e.id) + '" data-kontext="zs" data-tip="' + esc(e.id) + '" style="left:' + x0.toFixed(1) + "px;top:" + (40 + b * 32) + "px;max-width:" + (x1 - x0 + 7 + 250).toFixed(0) + 'px;--d:' + Math.min(900, Math.round(x0 / mw * 50)) + 'ms" aria-label="' + esc(e.name + ", " + zeitraum(e) + ", Priorität " + e.prioritaet) + '">' +
        '<span class="zs-bar" style="width:' + (x1 - x0).toFixed(1) + 'px;animation-delay:var(--d)"></span><span class="zs-name">' + esc(label) + "</span></button>";
    });
    var hoehe = 40 + Math.max(1, bahnen.length) * 32 + 14;
    var monatsHtml = mListe.map(function (ym, i) {
      var p = ym.split("-"), mi = +p[1] - 1;
      return '<div class="zs-monat" style="left:' + i * mw + "px;width:" + mw + 'px"><span>' + MON_KURZ[mi] + (mi === 0 || i === 0 ? '<span class="jahr">' + p[0] + "</span>" : "") + "</span></div>";
    }).join("");
    var heuteX = S.heute.slice(0, 7) >= von && S.heute.slice(0, 7) <= bisYm ? x(S.heute) : null;
    ziel.innerHTML = '<div class="zs"><div class="zs-scroll" tabindex="0" aria-label="Zeitstrahl, mit Pfeiltasten oder Wischen blättern"><div class="zs-flaeche" style="width:' + monate * mw + "px;height:" + hoehe + 'px">' + monatsHtml +
      (heuteX != null ? '<div class="zs-heute" style="left:' + heuteX.toFixed(1) + 'px"></div>' : "") + h + "</div></div>" +
      '<div class="zs-steuer"><button type="button" class="icon-knopf" data-zs="-1" aria-label="Zurückblättern">' + I.links + '</button><button type="button" class="icon-knopf" data-zs="1" aria-label="Weiterblättern">' + I.rechts + "</button></div>" +
      '<div class="zs-legende"><span><i class="zl-bar" style="background:var(--signal)"></i>Priorität A</span><span><i class="zl-bar" style="background:var(--solar)"></i>B</span><span><i class="zl-bar" style="background:var(--c-grau)"></i>C</span><span><i class="zl-bar" style="border:2px dashed var(--c-grau)"></i>Datum geschätzt</span>' + (items.length ? "" : "<span>Keine Termine in dieser Auswahl.</span>") + "</div></div>";
    var zs = $(".zs", ziel), sc = $(".zs-scroll", ziel);
    $$("[data-zs]", ziel).forEach(function (b) {
      b.addEventListener("click", function () { sc.scrollBy({ left: +b.getAttribute("data-zs") * sc.clientWidth * 0.75, behavior: reduziert.matches ? "auto" : "smooth" }); });
    });
    sc.addEventListener("keydown", function (ev) {
      if (ev.target !== sc) return;
      if (ev.key === "ArrowRight") { sc.scrollBy({ left: mw, behavior: "smooth" }); ev.preventDefault(); }
      if (ev.key === "ArrowLeft") { sc.scrollBy({ left: -mw, behavior: "smooth" }); ev.preventDefault(); }
    });
    ziehen(sc);
    if (opt.anpassen && heuteX == null) sc.scrollLeft = 0;
    if (reduziert.matches || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { zs.classList.add("reveal"); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(zs);
  }
  function ziehen(sc) {
    var start = null, links = 0, gezogen = false;
    sc.addEventListener("pointerdown", function (ev) {
      if (ev.pointerType !== "mouse" || ev.button !== 0) return;
      start = ev.clientX; links = sc.scrollLeft; gezogen = false;
    });
    window.addEventListener("pointermove", function (ev) {
      if (start === null) return;
      var dx = ev.clientX - start;
      if (!gezogen && Math.abs(dx) > 5) { gezogen = true; sc.classList.add("zieht"); tooltip(null); }
      if (gezogen) sc.scrollLeft = links - dx;
    });
    window.addEventListener("pointerup", function () {
      if (start === null) return;
      start = null;
      if (gezogen) { setTimeout(function () { sc.classList.remove("zieht"); }, 0); }
    });
  }

  /* ============================================================
     Termine & Archiv
     ============================================================ */
  function zeigeTermine() { listenSeite("termine"); }
  function zeigeArchiv() { listenSeite("archiv"); }
  function filterVon(art) { return art === "archiv" ? S.a : S.t; }
  function umfang(art, rubrik) {
    if (art === "archiv") return S.events.filter(vorbei).sort(function (a, b) { return nachStart(b, a); });
    var r = rubrik == null ? S.t.rubrik : rubrik;
    return kommende().filter(function (e) { return !r || e.rubrik === r || (r === "eu" && e.rubrik === "noneu"); });
  }
  function filtere(liste, f) {
    var q = f.q.trim().toLowerCase();
    var woerter = q ? q.split(/\s+/) : [];
    return liste.filter(function (e) {
      if (!f.prio[e.prioritaet]) return false;
      if (f.kat && e.kategorie !== f.kat) return false;
      if (f.monat && !(e.start.slice(0, 7) <= f.monat && e.ende.slice(0, 7) >= f.monat)) return false;
      if (f.merk && !merk.has(e.id)) return false;
      if (f.best && e.status !== "bestätigt") return false;
      if (woerter.length) {
        var t = [e.name, e.format, e.kategorie, e.veranstalter, e.ort, e.region, e.fokus, e.zielgruppe, e.begruendung, RUBRIK[e.rubrik]].join(" ").toLowerCase();
        if (woerter.some(function (w) { return t.indexOf(w) < 0; })) return false;
      }
      return true;
    });
  }
  function aktiveFilter(f) {
    return (f.prio.A && f.prio.B && f.prio.C ? 0 : 1) + (f.kat ? 1 : 0) + (f.monat ? 1 : 0) + (f.merk ? 1 : 0) + (f.best ? 1 : 0);
  }

  function listenSeite(art) {
    var f = filterVon(art);
    var basis = umfang(art);
    var kats = uniq(basis.map(function (e) { return e.kategorie; })).sort();
    var monate = [];
    basis.forEach(function (e) { var m = e.start.slice(0, 7); while (m <= e.ende.slice(0, 7)) { if (monate.indexOf(m) < 0) monate.push(m); m = naechsterMonat(m); } });
    monate.sort(); if (art === "archiv") monate.reverse();
    if (f.monat && monate.indexOf(f.monat) < 0) f.monat = "";
    if (f.kat && kats.indexOf(f.kat) < 0) f.kat = "";
    var ansichten = art === "archiv" ? [["liste", "Liste", I.liste], ["kalender", "Kalender", I.kal]]
      : [["liste", "Liste", I.liste], ["zeitstrahl", "Zeitstrahl", I.zeit], ["kalender", "Kalender", I.kal], ["radar", "Radar", I.radar]];
    if (!ansichten.some(function (a) { return a[0] === f.ansicht; })) f.ansicht = "liste";

    var h;
    if (art === "archiv") {
      h = kopfband({ akzent: "archiv", titel: "Archiv", text: "Vergangene Veranstaltungen zum Nachschlagen und für die Planung im nächsten Jahr. Termine wandern nach ihrem letzten Tag automatisch hierher.",
        unten: '<p class="kb-link"><a href="#termine">Zu den kommenden Terminen</a></p>' });
    } else {
      h = kopfband({ akzent: f.rubrik || "alle", titel: "Termine", textId: "reiter-text", text: REITER_TEXT[f.rubrik],
        reiter: '<div class="reiter" role="tablist" aria-label="Rubrik">' + REITER.map(function (r) {
          return '<button type="button" role="tab" data-rubrik="' + r[0] + '" aria-selected="' + (f.rubrik === r[0]) + '">' + esc(r[1]) + "<span>" + umfang("termine", r[0]).length + "</span></button>";
        }).join("") + "</div>",
        unten: '<p class="kb-link"><a href="#archiv">Archiv vergangener Termine</a></p>',
        rechts: '<div class="kb-radar"><div class="radar" id="radar-kopf"></div></div>' });
    }

    h += '<div class="filterleiste' + (S.filterOffen ? " offen" : "") + '" role="search"><div class="breite">' +
      '<label class="suchfeld">' + I.suche + '<span class="vh">In der Liste suchen</span><input class="feld" type="search" id="f-q" placeholder="Suchen, z. B. Solar, München, Pitch" value="' + esc(f.q) + '"></label>' +
      prioWahl(f.prio, "liste") +
      '<button type="button" class="knopf leise filter-knopf" id="filter-knopf" aria-expanded="' + !!S.filterOffen + '">' + I.filter + 'Filter<span id="filter-zahl"></span></button>' +
      '<div class="filter-mehr">' +
      '<label><span class="vh">Format</span><select class="feld" id="f-kat"><option value="">Alle Formate</option>' + kats.map(function (k) { return "<option" + (k === f.kat ? " selected" : "") + ">" + esc(k) + "</option>"; }).join("") + "</select></label>" +
      '<label><span class="vh">Monat</span><select class="feld" id="f-monat"><option value="">Alle Monate</option>' + monate.map(function (m) { return '<option value="' + m + '"' + (m === f.monat ? " selected" : "") + ">" + esc(monatLabel(m)) + "</option>"; }).join("") + "</select></label>" +
      '<label class="schalter"><input type="checkbox" id="f-merk"' + (f.merk ? " checked" : "") + "> Nur Merkliste</label>" +
      '<label class="schalter"><input type="checkbox" id="f-best"' + (f.best ? " checked" : "") + "> Nur bestätigte Termine</label>" +
      '<button type="button" class="knopf leise klein" id="f-reset" hidden>Filter zurücksetzen</button>' +
      "</div></div></div>";

    h += '<div class="breite"><div class="ergebnis-kopf"><span class="anzahl" id="anzahl"></span>' +
      '<div class="segment" role="group" aria-label="Ansicht">' + ansichten.map(function (a) {
        return '<button type="button" data-ansicht="' + a[0] + '" aria-pressed="' + (f.ansicht === a[0]) + '">' + a[2] + a[1] + "</button>";
      }).join("") + "</div>" +
      downloadsHtml("liste", true) + "</div>" +
      '<div id="ergebnis"></div></div>';
    $("#ansicht").innerHTML = h;
    if (art === "termine") kopfRadar(umfang("termine"));

    var q = $("#f-q"), tq;
    q.addEventListener("input", function () { clearTimeout(tq); tq = setTimeout(function () { f.q = q.value; aktualisiereListe(art, true); }, 120); });
    bindePrioWahl(f.prio, "liste", function () { aktualisiereListe(art, true); });
    $("#f-kat").addEventListener("change", function () { f.kat = this.value; aktualisiereListe(art, true); });
    $("#f-monat").addEventListener("change", function () { f.monat = this.value; if (this.value) f.kal = this.value; aktualisiereListe(art, true); });
    $("#f-merk").addEventListener("change", function () { f.merk = this.checked; aktualisiereListe(art, true); });
    $("#f-best").addEventListener("change", function () { f.best = this.checked; aktualisiereListe(art, true); });
    $("#f-reset").addEventListener("click", function () {
      var r = f.rubrik, a = f.ansicht;
      var neu = neuerFilter(a); neu.rubrik = r;
      if (art === "archiv") S.a = neu; else S.t = neu;
      listenSeite(art);
    });
    $("#filter-knopf").addEventListener("click", function () {
      S.filterOffen = !S.filterOffen;
      $(".filterleiste").classList.toggle("offen", S.filterOffen);
      this.setAttribute("aria-expanded", S.filterOffen);
    });
    $$("[data-ansicht]").forEach(function (b) {
      b.addEventListener("click", function () {
        f.ansicht = b.getAttribute("data-ansicht");
        $$("[data-ansicht]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        aktualisiereListe(art, false);
      });
    });
    $$("[data-rubrik]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = b.getAttribute("data-rubrik");
        if (r === f.rubrik) return;
        f.rubrik = r; f.monat = ""; f.kal = null;
        history.replaceState(null, "", "#" + (r || "termine"));
        $$("[data-rubrik]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        $("#reiter-text").textContent = REITER_TEXT[r];
        $("#kopfband").setAttribute("data-akzent", r || "alle");
        kopfRadar(umfang("termine"));
        var monSel = $("#f-monat"), mon = [];
        umfang("termine").forEach(function (e) { var m = e.start.slice(0, 7); while (m <= e.ende.slice(0, 7)) { if (mon.indexOf(m) < 0) mon.push(m); m = naechsterMonat(m); } });
        mon.sort();
        monSel.innerHTML = '<option value="">Alle Monate</option>' + mon.map(function (m) { return '<option value="' + m + '">' + esc(monatLabel(m)) + "</option>"; }).join("");
        aktualisiereListe(art, true);
      });
    });
    aktualisiereListe(art, false);
  }

  function kopfRadar(liste, fuerStartups) {
    var ziel = $("#radar-kopf");
    if (!ziel) return;
    S.radare.forEach(function (r) { r.entferne(); });
    S.radare = [];
    ziel.innerHTML = "";
    var r = new Radar(ziel, {
      bereich: bereichFuer(liste), sofort: true,
      oeffnen: function (id) { fuerStartups ? oeffnePanel("su", id, liste.map(function (x) { return x.id; })) : oeffnePanel("event", id, liste.map(function (x) { return x.id; })); },
      tooltip: fuerStartups ? tooltipStartup : tooltip,
      label: fuerStartups ? "Radar der Start-ups nach Sitz" : "Radar der Termine dieser Rubrik"
    });
    S.radare.push(r);
    r.setze(liste, false);
  }

  function downloadsHtml(quelle, mitIcs) {
    return '<div class="downloads"><span class="dl-label">Auswahl herunterladen:</span>' +
      '<button type="button" class="knopf leise klein" data-dl="xlsx" data-quelle="' + quelle + '">' + I.excel + "Excel</button>" +
      (mitIcs ? '<button type="button" class="knopf leise klein" data-dl="ics" data-quelle="' + quelle + '">' + I.kal + "Kalender</button>" : "") +
      '<button type="button" class="knopf leise klein" data-dl="csv" data-quelle="' + quelle + '">' + I.datei + "CSV</button>" +
      '<button type="button" class="knopf leise klein" data-dl="druck" data-quelle="' + quelle + '">' + I.druck + "Drucken</button></div>";
  }

  function aktualisiereListe(art, animiert) {
    var f = filterVon(art);
    var liste = filtere(umfang(art), f);
    S.liste = liste;
    var titel = art === "archiv" ? "Archiv" : "Termine – " + (f.rubrik ? (f.rubrik === "eu" ? "EU & Europa" : RUBRIK[f.rubrik]) : "alle Rubriken");
    S.druck = { art: "events", liste: liste, titel: titel };
    $("#anzahl").innerHTML = plural(liste.length, "Termin", "Termine") + (liste.length !== umfang(art).length ? "<small>von " + umfang(art).length + "</small>" : "");
    var nf = aktiveFilter(f);
    $("#filter-zahl").textContent = nf ? " (" + nf + ")" : "";
    $("#f-reset").hidden = !(nf || f.q.trim());
    var ziel = $("#ergebnis");
    ansichtRadarWeg(); tooltip(null);
    if (f.ansicht === "zeitstrahl") return zeitstrahl(ziel, liste, { monate: 18 });
    if (f.ansicht === "kalender") return kalender(ziel, liste, art);
    if (f.ansicht === "radar") return radarAnsicht(ziel, liste);
    var neuZeichnen = function () { ziel.innerHTML = listeHtml(liste, art, f); };
    if (animiert) flip(ziel, neuZeichnen); else neuZeichnen();
  }

  function listeHtml(liste, art, f) {
    if (!liste.length) {
      return '<div class="leer"><h3>' + (art === "archiv" && !umfang("archiv").length ? "Noch nichts im Archiv" : "Kein Termin passt zu den Filtern") + "</h3><p>" +
        (art === "archiv" && !umfang("archiv").length ? "Vergangene Veranstaltungen landen hier automatisch nach ihrem letzten Tag." : "Suchbegriff kürzen oder Filter zurücksetzen.") + "</p>" +
        (art === "archiv" && !umfang("archiv").length ? '<a class="knopf leise" href="#termine">Kommende Termine ansehen</a>' : "") + "</div>";
    }
    var gruppen = function (l) {
      var h = "", aktM = null, puffer = [];
      var flush = function () {
        if (!puffer.length) return;
        h += '<h3 class="monat-kopf">' + esc(monatLabel(aktM)) + "<span>" + plural(puffer.length, "Termin", "Termine") + '</span></h3><ul class="zeilen">' + puffer.map(zeileHtml).join("") + "</ul>";
        puffer = [];
      };
      l.forEach(function (e) {
        var m = (art !== "archiv" && e.start < S.heute ? S.heute : e.start).slice(0, 7);
        if (m !== aktM) { flush(); aktM = m; }
        puffer.push(e);
      });
      flush();
      return h;
    };
    if (art === "termine" && f.rubrik === "eu") {
      var eu = liste.filter(function (e) { return e.rubrik === "eu"; }), ne = liste.filter(function (e) { return e.rubrik === "noneu"; });
      return gruppen(eu) + (ne.length ? '<h2 class="zwischen-kopf">Außerhalb der EU: Schweiz, Vereinigtes Königreich, Norwegen</h2><p>Gesondert aufgeführt, weil sie für Dach, Bau und Solar besonders wichtig sind.</p>' + gruppen(ne) : "");
    }
    return gruppen(liste);
  }

  function zeileHtml(e) {
    var d = datumsBlock(e), bald = !vorbei(e) && tageBis(e.start) <= 30;
    var ent = entfernung(e);
    return '<li class="zeile prio-' + e.prioritaet + " rb-" + e.rubrik + '" data-id="' + esc(e.id) + '">' +
      '<button type="button" class="zeile-knopf" data-oeffne="' + esc(e.id) + '" data-kontext="liste">' +
      '<span class="z-datum"><span class="z-tag">' + esc(d.tag) + '</span><span class="z-mon">' + esc(d.unter) + "</span></span>" +
      '<span class="z-haupt"><span class="z-titel">' + esc(e.name) + "</span>" +
      '<span class="z-meta"><span>' + I.ort + esc(e.ort) + (ent && !e.online && ent !== "in Regensburg" ? ", " + esc(ent) : "") + "</span><span>" + esc(e.kategorie) + "</span>" +
      (e.rubrik === "noneu" ? '<span class="nicht-eu-marke">außerhalb der EU</span>' : "") + "</span>" +
      '<span class="z-grund">' + esc(e.begruendung) + "</span></span>" +
      '<span class="z-rechts">' + schild(e.prioritaet, e.gesamt) + status(e) + '<span class="z-wann' + (bald ? " bald" : "") + '">' + esc(relativ(e)) + "</span></span>" +
      "</button>" +
      '<div class="z-aktionen">' + sternKnopf(e.id, e.name) + (vorbei(e) ? "" : icsKnopf(e)) + "</div></li>";
  }

  /* Sanftes Umsortieren beim Filtern (FLIP) */
  function flip(container, aendern) {
    if (reduziert.matches || !Element.prototype.animate) { aendern(); return; }
    var vorher = {};
    $$("[data-id]", container).forEach(function (el) { vorher[el.getAttribute("data-id")] = el.getBoundingClientRect(); });
    aendern();
    var neu = $$("[data-id]", container);
    if (neu.length > 90) return;
    neu.forEach(function (el, i) {
      var a = vorher[el.getAttribute("data-id")], b = el.getBoundingClientRect();
      if (a) {
        var dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" });
      } else {
        el.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 280, delay: Math.min(i * 18, 240), easing: "ease-out", fill: "backwards" });
      }
    });
  }

  /* Kalender */
  function kalender(ziel, liste, art, richtung) {
    var f = filterVon(art);
    if (!f.kal) {
      var erste = liste.slice().sort(nachStart)[0];
      f.kal = f.monat || (art === "archiv" ? (erste ? liste[0].start.slice(0, 7) : S.heute.slice(0, 7)) : (erste ? (erste.start < S.heute ? S.heute : erste.start).slice(0, 7) : S.heute.slice(0, 7)));
    }
    var ym = f.kal, p = ym.split("-"), y = +p[0], m = +p[1];
    var tage = new Date(y, m, 0).getDate(), versatz = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    var imMonat = liste.filter(function (e) { return e.start.slice(0, 7) <= ym && e.ende.slice(0, 7) >= ym; });
    var h = '<div class="kal-nav"><button type="button" class="knopf leise" data-kal="' + vorherMonat(ym) + '" data-richtung="links" aria-label="Vorheriger Monat">' + I.links + '<span class="kal-mname">' + esc(MONATE[(m + 10) % 12]) + "</span></button>" +
      "<h3>" + esc(monatLabel(ym)) + " <span>" + plural(imMonat.length, "Termin", "Termine") + "</span></h3>" +
      '<button type="button" class="knopf leise" data-kal="' + naechsterMonat(ym) + '" data-richtung="rechts" aria-label="Nächster Monat"><span class="kal-mname">' + esc(MONATE[m % 12]) + "</span>" + I.rechts + "</button></div>";
    h += '<div class="kal' + (richtung ? " rein-" + richtung : "") + '" aria-label="' + esc(monatLabel(ym)) + '">';
    ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach(function (w) { h += '<div class="kal-wt" aria-hidden="true">' + w + "</div>"; });
    for (var i = 0; i < versatz; i++) h += '<div class="kal-tag aussen" aria-hidden="true"></div>';
    for (var t = 1; t <= tage; t++) {
      var s = y + "-" + pad(m) + "-" + pad(t);
      var hier = imMonat.filter(function (e) { return e.start <= s && e.ende >= s; });
      h += '<div class="kal-tag' + (hier.length ? "" : " ohne") + (s === S.heute ? " heute" : "") + '"><span class="kal-nr"><span class="wt">' + WTAG[wt(s)] + " </span>" + t + ".</span>" +
        hier.map(function (e) {
          return '<button type="button" class="kal-ev prio-' + e.prioritaet + (e.status === "geschätzt" ? " geschaetzt" : "") + '" data-oeffne="' + esc(e.id) + '" data-kontext="liste" data-tip="' + esc(e.id) + '">' + esc(kurzname(e)) + "</button>";
        }).join("") + "</div>";
    }
    var rest = (7 - (versatz + tage) % 7) % 7;
    for (var r = 0; r < rest; r++) h += '<div class="kal-tag aussen" aria-hidden="true"></div>';
    h += "</div>";
    if (!imMonat.length) h += '<p class="leer" style="margin-top:12px">In diesem Monat gibt es mit den aktuellen Filtern keine Termine.</p>';
    h += '<div class="kal-legende"><span class="kal-ev prio-A">A</span><span class="kal-ev prio-B">B</span><span class="kal-ev prio-C">C</span><span class="kal-ev prio-C geschaetzt">gestrichelt</span> = Datum geschätzt. Antippen zeigt alle Angaben.</div>';
    ziel.innerHTML = h;
    $$("[data-kal]", ziel).forEach(function (b) {
      b.addEventListener("click", function () { f.kal = b.getAttribute("data-kal"); kalender(ziel, liste, art, b.getAttribute("data-richtung") === "links" ? "links" : "rechts"); });
    });
  }

  /* Radar als Ansicht der gefilterten Liste */
  function radarAnsicht(ziel, liste) {
    var online = liste.filter(function (e) { return e.online; }), ohneOrt = liste.filter(function (e) { return !e.online && !e.geo; });
    ziel.innerHTML = '<div class="radar-ansicht"><div class="radar" id="radar-liste"></div><div class="radar-text"><h3>' + plural(liste.length, "Termin", "Termine") + " auf dem Radar</h3>" +
      "<p>Richtung und Abstand zeigen, wo die Termine von Regensburg aus liegen. Der gestrichelte Ring markiert 100 km, außen geht es bis etwa 2.000 km. Die Entfernung ist gestaucht, damit die Region nicht untergeht.</p>" +
      '<p>Über einen Punkt fahren zeigt den Termin, Antippen öffnet alle Angaben.</p><div class="radar-legende">' + radarLegende(online, ohneOrt) + "</div></div></div>";
    var r = new Radar($("#radar-liste"), { oeffnen: function (id) { oeffnePanel("event", id, liste.map(function (e) { return e.id; })); }, tooltip: tooltip, sofort: true });
    S.ansichtRadar = r;
    r.setze(liste, false);
  }

  /* ============================================================
     Start-ups
     ============================================================ */
  function suUmfang(region) {
    var r = region == null ? S.s.region : region;
    return S.startups.filter(function (s) { return !r || s.region === r; });
  }
  function zeigeStartups() {
    var sf = S.s;
    var felder = uniq(S.startups.map(function (s) { return s.suchfeld; })).sort();
    var h = kopfband({ akzent: SU_AKZENT[sf.region], titel: "Start-ups", textId: "su-text", text: SU_TEXT[sf.region],
      reiter: '<div class="reiter" role="tablist" aria-label="Region">' + SU_REGIONEN.map(function (r) {
        return '<button type="button" role="tab" data-su-region="' + esc(r[0]) + '" aria-selected="' + (sf.region === r[0]) + '">' + esc(r[1]) + "<span>" + suUmfang(r[0]).length + "</span></button>";
      }).join("") + "</div>",
      unten: '<p class="kb-link"><a href="#kapital">Finanzierungen und Investoren ansehen</a></p>',
      rechts: '<div class="kb-radar"><div class="radar" id="radar-kopf"></div></div>' });
    h += '<div class="filterleiste" role="search"><div class="breite">' +
      '<label class="suchfeld">' + I.suche + '<span class="vh">Start-ups durchsuchen</span><input class="feld" type="search" id="s-q" placeholder="Suchen, z. B. EPD, Zoll, Sensor, Investor" value="' + esc(sf.q) + '"></label>' +
      '<label><span class="vh">Suchfeld</span><select class="feld" id="s-feld"><option value="">Alle Suchfelder</option>' + felder.map(function (x) { return "<option" + (x === sf.feld ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("") + "</select></label>" +
      '<label class="schalter"><input type="checkbox" id="s-merk"' + (sf.merk ? " checked" : "") + "> Nur Merkliste</label></div></div>";
    h += '<div class="breite"><div class="su-raster"><div class="matrix-block"><h2>Relevanz und Aufwand</h2><p>Oben links liegen die Quick Wins: hohe Relevanz bei geringem Umsetzungsaufwand.</p>' +
      '<div class="matrix-wrap"><div class="achse-y">Relevanz, oben hoch</div><div class="matrix" id="matrix"></div><div class="achse-x">Umsetzungsaufwand, links gering</div></div>' +
      '<div class="matrix-legende"><span><span class="m-chip prio-A" style="padding:1px 6px">A</span>Priorität A</span><span><span class="m-chip prio-B" style="padding:1px 6px">B</span>B</span><span><span class="m-chip" style="padding:1px 6px">C</span>C</span><span><i class="ost-punkt"></i>Sitz in Ostbayern</span></div>' +
      '<div class="sf-legende">' + felder.map(function (x) { return suchfeldTag(x); }).join("") + "</div></div>";
    h += '<div><div class="ergebnis-kopf"><span class="anzahl" id="s-anzahl"></span>' + downloadsHtml("su", false) + "</div>" +
      '<ul class="zeilen" id="s-liste"></ul></div></div></div>';
    $("#ansicht").innerHTML = h;
    kopfRadar(suUmfang().filter(function (s) { return s.geo; }), true);
    var tq;
    $("#s-q").addEventListener("input", function () { var v = this.value; clearTimeout(tq); tq = setTimeout(function () { S.s.q = v; aktualisiereStartups(true); }, 120); });
    $("#s-feld").addEventListener("change", function () { S.s.feld = this.value; aktualisiereStartups(true); });
    $("#s-merk").addEventListener("change", function () { S.s.merk = this.checked; aktualisiereStartups(true); });
    $$("[data-su-region]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = b.getAttribute("data-su-region");
        if (r === S.s.region) return;
        S.s.region = r;
        $$("[data-su-region]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        $("#su-text").textContent = SU_TEXT[r];
        $("#kopfband").setAttribute("data-akzent", SU_AKZENT[r]);
        kopfRadar(suUmfang().filter(function (s) { return s.geo; }), true);
        aktualisiereStartups(true);
      });
    });
    aktualisiereStartups(false, true);
  }
  function filtereStartups() {
    var sf = S.s, q = sf.q.trim().toLowerCase(), w = q ? q.split(/\s+/) : [];
    return suUmfang().filter(function (s) {
      if (sf.feld && s.suchfeld !== sf.feld) return false;
      if (sf.merk && !merk.has(s.id)) return false;
      if (w.length) {
        var t = [s.name, s.sitz, s.region, LAND[s.land] || "", s.loesung, s.suchfeld, s.mehrwert, s.reifegrad, s.anbindung, s.kooperation, (s.investoren_alle || []).join(" ")].join(" ").toLowerCase();
        if (w.some(function (x) { return t.indexOf(x) < 0; })) return false;
      }
      return true;
    });
  }
  function aktualisiereStartups(animiert, erst) {
    var l = filtereStartups();
    S.suListe = l;
    S.druck = { art: "startups", liste: l, titel: "Start-ups" + (S.s.region ? " – " + S.s.region : "") };
    var basis = suUmfang();
    $("#s-anzahl").innerHTML = plural(l.length, "Start-up", "Start-ups") + (l.length !== basis.length ? "<small>von " + basis.length + "</small>" : "");
    var ids = {}; l.forEach(function (s) { ids[s.id] = true; });
    var m = "";
    for (var r = 5; r >= 1; r--) {
      for (var a = 1; a <= 5; a++) {
        var hier = basis.filter(function (s) { return s.relevanz === r && s.aufwand === a; });
        m += '<div class="m-zelle' + (r >= 4 && a <= 2 ? " quick" : "") + '" aria-label="Relevanz ' + r + ", Aufwand " + a + '">' +
          (r === 5 && a === 1 ? '<span class="quick-label">Quick Wins</span>' : "") +
          (r === 5 && a === 1 && hier.length ? '<span style="height:16px"></span>' : "") +
          hier.map(function (s, i) {
            return '<button type="button" class="m-chip prio-' + s.prioritaet + (s.region === "Ostbayern" ? " ost" : "") + (ids[s.id] ? "" : " aus") + '" data-oeffne-su="' + esc(s.id) + '" data-su-chip="' + esc(s.id) + '" style="animation-delay:' + ((5 - r) * 60 + a * 40 + i * 30) + 'ms" title="' + esc(s.name + ", " + s.sitz + ", Relevanz " + r + ", Aufwand " + a) + '">' + esc(s.name) + "</button>";
          }).join("") + '<span class="m-koord" aria-hidden="true">' + r + "/" + a + "</span></div>";
      }
    }
    var mx = $("#matrix");
    mx.innerHTML = m;
    if (erst && !reduziert.matches) mx.classList.add("reveal");
    var zeichne = function () {
      $("#s-liste").innerHTML = l.length ? l.map(suZeileHtml).join("") : '<li class="leer" style="border:0">Kein Start-up passt zu den Filtern.</li>';
    };
    if (animiert) flip($("#s-liste"), zeichne); else zeichne();
    $$("#s-liste .zeile").forEach(function (z) {
      var id = z.getAttribute("data-id");
      z.addEventListener("mouseenter", function () { var c = $('[data-su-chip="' + id + '"]'); if (c) c.classList.add("fokus"); });
      z.addEventListener("mouseleave", function () { var c = $('[data-su-chip="' + id + '"]'); if (c) c.classList.remove("fokus"); });
    });
  }
  function suZeileHtml(s) {
    var lr = s.letzte_runde;
    return '<li class="zeile su-zeile prio-' + s.prioritaet + '" data-id="' + esc(s.id) + '">' +
      '<button type="button" class="zeile-knopf" data-oeffne-su="' + esc(s.id) + '">' + logo(s) +
      '<span class="z-haupt"><span class="z-titel">' + esc(s.name) + "</span>" +
      '<span class="z-meta"><span>' + I.ort + esc(s.sitz) + (s.land && s.land !== "DE" ? ", " + esc(LAND[s.land] || s.land) : "") + "</span>" + suchfeldTag(s.suchfeld) +
      (lr ? '<span class="z-geld">' + esc(lr.runde) + ": " + esc(lr.betrag) + " (" + esc(monatJahr(lr.datum)) + ")</span>" : "") + "</span>" +
      '<span class="z-grund">' + esc(s.loesung) + "</span></span>" +
      '<span class="z-rechts">' + schild(s.prioritaet) + '<span class="su-region r-' + esc(SU_AKZENT[s.region] || "alle") + '">' + esc(s.region) + "</span>" +
      (s.quickwin ? '<span class="quick-badge">Quick Win</span>' : "") + '<span class="werte">' + mini(s.relevanz, "relevanz") + mini(s.aufwand, "aufwand") + "</span></span>" +
      "</button>" + '<div class="z-aktionen">' + sternKnopf(s.id, s.name) + "</div></li>";
  }
  function monatJahr(d) { var p = d.split("-"); return (p[2] ? +p[2] + ". " : "") + MON_KURZ[+p[1] - 1] + " " + p[0]; }

  /* ============================================================
     Kapital: Finanzierungsrunden, Übernahmen, Investoren
     ============================================================ */
  var ARTEN = [["", "Alle"], ["Finanzierungsrunde", "Finanzierungsrunden"], ["Übernahme", "Übernahmen"], ["Fonds", "Fonds"]];
  function fmtMio(x) { return (Math.round(x * 10) / 10).toLocaleString("de-DE") + " Mio. €"; }
  function dealsGefiltert() {
    var k = S.k;
    return S.runden.filter(function (r) { return (!k.art || r.art === k.art) && (!k.thema || r.thema === k.thema) && (!k.nurRadar || r.startup_id); });
  }
  function zeigeKapital() {
    var seit = addMonate(S.heute, -12).slice(0, 7);
    var jahr = S.runden.filter(function (r) { return r.datum >= seit; });
    var runden12 = jahr.filter(function (r) { return r.art === "Finanzierungsrunde"; });
    var summe = runden12.reduce(function (x, r) { return x + (r.betrag_mio_eur || 0); }, 0);
    var themen = uniq(S.runden.map(function (r) { return r.thema; })).sort();
    var rechts = '<dl class="kb-stats">' +
      "<div><dt>Finanzierungsrunden seit " + esc(monatJahr(seit)) + "</dt><dd>" + runden12.length + "</dd></div>" +
      "<div><dt>Summe der in Euro genannten Beträge</dt><dd>" + esc(fmtMio(summe)) + "</dd></div>" +
      "<div><dt>Übernahmen im selben Zeitraum</dt><dd>" + jahr.filter(function (r) { return r.art === "Übernahme"; }).length + "</dd></div>" +
      "<div><dt>Investoren mit Profil</dt><dd>" + S.investoren.length + "</dd></div></dl>";
    var h = kopfband({ akzent: "kapital", titel: "Kapital", text: "Öffentlich bekannte Finanzierungsrunden, Übernahmen und Investoren rund um Dach, Solar, Bau und Fertigung – jeweils mit Quelle. Eigene Bewertungen und Finanzanalysen gehören nicht auf diese Seite.", rechts: rechts });
    h += '<div class="breite">';
    h += '<section class="abschnitt" aria-labelledby="deals-titel"><div class="abschnitt-kopf"><h2 id="deals-titel">Deals</h2><p>Finanzierungsrunden der Start-ups im Radar und weitere Runden, Übernahmen und neue Fonds in diesen Themen. Neueste zuerst.</p></div>' +
      '<div class="deal-filter"><div class="segment" role="radiogroup" aria-label="Art">' + ARTEN.map(function (a) {
        return '<button type="button" role="radio" data-k-art="' + esc(a[0]) + '" aria-checked="' + (S.k.art === a[0]) + '">' + esc(a[1]) + "</button>";
      }).join("") + "</div>" +
      '<label><span class="vh">Thema</span><select class="feld" id="k-thema"><option value="">Alle Themen</option>' + themen.map(function (t) { return "<option" + (t === S.k.thema ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("") + "</select></label>" +
      '<label class="schalter"><input type="checkbox" id="k-radar"' + (S.k.nurRadar ? " checked" : "") + "> Nur Start-ups im Radar</label></div>" +
      '<div class="ergebnis-kopf"><span class="anzahl" id="d-anzahl"></span>' + downloadsHtml("deals", false) + "</div>" +
      '<ul class="zeilen deals" id="d-liste"></ul></section>';
    h += '<section class="abschnitt" aria-labelledby="netz-titel"><div class="abschnitt-kopf"><h2 id="netz-titel">Wer in diese Themen investiert</h2><p>Links Investoren, rechts Unternehmen. Eine Linie heißt: an mindestens einer erfassten Runde beteiligt. Gezeigt werden Investoren mit Profil und alle, die bei mindestens zwei Unternehmen dabei sind.</p></div>' +
      '<div class="netz" id="netz"></div></section>';
    h += '<section class="abschnitt" aria-labelledby="inv-titel"><div class="abschnitt-kopf"><h2 id="inv-titel">Investoren mit Fokus auf diese Themen</h2><p>Fonds, Konzern-Investoren und öffentliche Beteiligungsgesellschaften, die in Bau, Energie und Industrie investieren.</p></div>' +
      '<div class="ergebnis-kopf"><span class="anzahl">' + plural(S.investoren.length, "Investor", "Investoren") + "</span>" + downloadsHtml("investoren", false) + "</div>" +
      '<div class="inv-raster">' + S.investoren.map(investorKarte).join("") + "</div></section>";
    h += '<p class="klein kapital-hinweis">Nur veröffentlichte Angaben aus Pressemitteilungen und Fachmedien. Beträge in US-Dollar sind nicht umgerechnet und fließen nicht in die Summe ein. Nicht genannte Runden oder Beträge fehlen hier bewusst.</p></div>';
    $("#ansicht").innerHTML = h;
    $$("[data-k-art]").forEach(function (b) {
      b.addEventListener("click", function () {
        S.k.art = b.getAttribute("data-k-art");
        $$("[data-k-art]").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
        aktualisiereDeals(true);
      });
    });
    $("#k-thema").addEventListener("change", function () { S.k.thema = this.value; aktualisiereDeals(true); });
    $("#k-radar").addEventListener("change", function () { S.k.nurRadar = this.checked; aktualisiereDeals(true); });
    aktualisiereDeals(false);
    netzwerk($("#netz"));
  }
  function aktualisiereDeals(animiert) {
    var l = dealsGefiltert();
    S.dealListe = l;
    S.druck = { art: "runden", liste: l, titel: "Kapital – Deals" };
    $("#d-anzahl").innerHTML = plural(l.length, "Deal", "Deals") + (l.length !== S.runden.length ? "<small>von " + S.runden.length + "</small>" : "");
    var zeichne = function () { $("#d-liste").innerHTML = l.length ? l.map(dealZeile).join("") : '<li class="leer" style="border:0">Kein Deal passt zu den Filtern.</li>'; };
    if (animiert) flip($("#d-liste"), zeichne); else zeichne();
  }
  function dealZeile(r) {
    var p = r.datum.split("-");
    var artCls = r.art === "Übernahme" ? "uebernahme" : r.art === "Fonds" ? "fonds" : "runde";
    return '<li class="zeile deal-zeile art-' + artCls + '" data-id="' + esc(r.id) + '"><button type="button" class="zeile-knopf" data-oeffne-deal="' + esc(r.id) + '">' +
      '<span class="z-datum"><span class="z-tag">' + esc(MON_KURZ[+p[1] - 1]) + '</span><span class="z-mon">' + esc(p[0]) + "</span></span>" +
      '<span class="z-haupt"><span class="z-titel">' + esc(r.unternehmen) + "</span>" +
      '<span class="z-meta"><span>' + I.ort + esc(r.sitz) + "</span>" + suchfeldTag(r.thema) + (r.startup_id ? '<span class="im-radar">im Radar</span>' : "") + "</span>" +
      '<span class="z-grund">' + esc(r.kurz) + "</span></span>" +
      '<span class="z-rechts"><span class="deal-summe">' + esc(r.betrag) + '</span><span class="art-badge ' + artCls + '">' + esc(r.runde) + "</span>" +
      ((r.lead || []).length ? '<span class="z-wann">' + (r.art === "Übernahme" ? "Käufer: " : r.art === "Fonds" ? "" : "Lead: ") + esc(r.lead.slice(0, 2).join(", ")) + "</span>" : "") + "</span>" +
      "</button></li>";
  }
  function investorKarte(x) {
    return '<article class="inv-karte"><div class="inv-kopf"><span class="inv-typ">' + esc(x.typ) + "</span><span>" + esc(x.sitz) + "</span></div>" +
      '<h3><button type="button" class="linkknopf" data-oeffne-inv="' + esc(x.id) + '">' + esc(x.name) + "</button></h3>" +
      "<p>" + esc(x.kurz) + "</p>" +
      '<dl class="inv-daten"><dt>Ticket</dt><dd>' + esc(x.ticket) + "</dd><dt>Volumen</dt><dd>" + esc(x.volumen) + "</dd></dl>" +
      ((x.portfolio || []).length ? '<div class="inv-portfolio"><span>Im Radar:</span>' + x.portfolio.map(function (p) {
        return p.startup_id ? '<button type="button" class="inv-chip profil" data-oeffne-su="' + esc(p.startup_id) + '">' + esc(p.unternehmen) + "</button>" : '<button type="button" class="inv-chip" data-oeffne-deal="' + esc(p.runde_id) + '">' + esc(p.unternehmen) + "</button>";
      }).join("") + "</div>" : "") + "</article>";
  }

  /* Netzwerk-Grafik: Investoren links, Unternehmen rechts */
  function netzwerk(ziel) {
    var kanten = [], invMap = {}, firmaInfo = {};
    S.runden.forEach(function (r) {
      if (r.art !== "Finanzierungsrunde") return;
      firmaInfo[r.unternehmen] = firmaInfo[r.unternehmen] || { startup_id: r.startup_id, runde_id: r.id };
      uniq((r.lead || []).concat(r.investoren || [])).forEach(function (n) {
        var p = investorProfil(n), key = p ? p.name : n;
        invMap[key] = invMap[key] || { name: key, profil: p, firmen: [] };
        if (invMap[key].firmen.indexOf(r.unternehmen) < 0) { invMap[key].firmen.push(r.unternehmen); kanten.push([key, r.unternehmen]); }
      });
    });
    var inv = Object.keys(invMap).map(function (k) { return invMap[k]; }).filter(function (x) { return x.profil || x.firmen.length >= 2; })
      .sort(function (a, b) { return b.firmen.length - a.firmen.length || (a.name < b.name ? -1 : 1); });
    var invNamen = inv.map(function (x) { return x.name; });
    var firmen = uniq(kanten.filter(function (k) { return invNamen.indexOf(k[0]) >= 0; }).map(function (k) { return k[1]; }));
    var bary = {};
    firmen.forEach(function (f) {
      var pos = kanten.filter(function (k) { return k[1] === f && invNamen.indexOf(k[0]) >= 0; }).map(function (k) { return invNamen.indexOf(k[0]); });
      bary[f] = pos.reduce(function (a, b) { return a + b; }, 0) / pos.length;
    });
    firmen.sort(function (a, b) { return bary[a] - bary[b]; });
    var zeichnen = function () {
      var W = Math.max(320, ziel.clientWidth || 900), schmal = W < 640;
      var labelW = Math.min(230, W * (schmal ? 0.38 : 0.3));
      var zeileH = schmal ? 26 : 30, n = Math.max(inv.length, firmen.length);
      var H = n * zeileH + 24;
      var xl = labelW + 16, xr = W - labelW - 16;
      var yPos = function (i, anzahl) { return anzahl <= 1 ? H / 2 : 12 + zeileH / 2 + i * ((H - 24 - zeileH) / (anzahl - 1)); };
      var fs = schmal ? 12 : 14;
      var kuerze = function (t) { var max = Math.floor(labelW / (fs * 0.52)); return t.length > max ? t.slice(0, max - 1) + "…" : t; };
      var svg = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Netzwerk aus Investoren und Unternehmen" font-size="' + fs + '">';
      kanten.forEach(function (k) {
        var i = invNamen.indexOf(k[0]), j = firmen.indexOf(k[1]);
        if (i < 0 || j < 0) return;
        var y1 = yPos(i, inv.length), y2 = yPos(j, firmen.length), mx = (xl + xr) / 2;
        svg += '<path class="kante" data-i="' + i + '" data-f="' + j + '" d="M' + xl + "," + y1.toFixed(1) + " C" + mx + "," + y1.toFixed(1) + " " + mx + "," + y2.toFixed(1) + " " + xr + "," + y2.toFixed(1) + '"/>';
      });
      inv.forEach(function (x, i) {
        var y = yPos(i, inv.length), r = 4 + Math.min(x.firmen.length, 5) * 1.6;
        svg += '<g class="knoten inv' + (x.profil ? " profil" : "") + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(x.name + ", " + x.firmen.length + " Beteiligungen") + '"' + (x.profil ? ' data-oeffne-inv="' + esc(x.profil.id) + '"' : "") + ">" +
          '<circle cx="' + xl + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '"/><text x="' + (xl - r - 8) + '" y="' + y.toFixed(1) + '" text-anchor="end" dominant-baseline="central">' + esc(kuerze(x.name)) + "</text></g>";
      });
      firmen.forEach(function (f, j) {
        var y = yPos(j, firmen.length), info = firmaInfo[f] || {};
        var attr = info.startup_id ? ' data-oeffne-su="' + esc(info.startup_id) + '"' : ' data-oeffne-deal="' + esc(info.runde_id) + '"';
        svg += '<g class="knoten firma' + (info.startup_id ? " im-radar" : "") + '" data-f="' + j + '" tabindex="0" role="button" aria-label="' + esc(f) + '"' + attr + ">" +
          '<rect x="' + (xr - 5) + '" y="' + (y - 5).toFixed(1) + '" width="10" height="10" rx="2"/><text x="' + (xr + 12) + '" y="' + y.toFixed(1) + '" dominant-baseline="central">' + esc(kuerze(f)) + "</text></g>";
      });
      svg += "</svg>";
      ziel.innerHTML = svg + '<div class="netz-legende"><span><i class="nl-inv"></i>Investor (größer = mehr Beteiligungen)</span><span><i class="nl-profil"></i>mit Profil</span><span><i class="nl-firma"></i>Start-up im Radar</span><span><i class="nl-firma andere"></i>weiteres Unternehmen</span></div>';
      var el = ziel.querySelector("svg");
      var markiere = function (art, idx) {
        el.classList.toggle("hover", art !== null);
        $$(".kante", el).forEach(function (k) { k.classList.toggle("an", art !== null && k.getAttribute("data-" + art) === String(idx)); });
        var anI = {}, anF = {};
        $$(".kante.an", el).forEach(function (k) { anI[k.getAttribute("data-i")] = 1; anF[k.getAttribute("data-f")] = 1; });
        $$(".knoten.inv", el).forEach(function (g) { g.classList.toggle("an", !!anI[g.getAttribute("data-i")]); });
        $$(".knoten.firma", el).forEach(function (g) { g.classList.toggle("an", !!anF[g.getAttribute("data-f")]); });
      };
      $$(".knoten", el).forEach(function (g) {
        var art = g.classList.contains("inv") ? "i" : "f", idx = g.getAttribute(art === "i" ? "data-i" : "data-f");
        g.addEventListener("mouseenter", function () { markiere(art, idx); });
        g.addEventListener("focus", function () { markiere(art, idx); });
        g.addEventListener("mouseleave", function () { markiere(null); });
        g.addEventListener("blur", function () { markiere(null); });
        g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); g.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
      });
    };
    zeichnen();
    var t;
    var ro = window.ResizeObserver ? new ResizeObserver(function () { clearTimeout(t); t = setTimeout(function () { if (document.contains(ziel)) zeichnen(); else ro.disconnect(); }, 150); }) : null;
    if (ro) ro.observe(ziel);
  }

  function kapitalTeaser() {
    var neu = S.runden.slice(0, 4);
    if (!neu.length) return "";
    return '<section class="abschnitt"><div class="abschnitt-kopf"><h2>Neu bei Finanzierungen und Übernahmen</h2><p><a href="#kapital">Alle Deals und Investoren</a></p></div><ul class="zeilen deals">' + neu.map(dealZeile).join("") + "</ul></section>";
  }

  /* ============================================================
     Merkliste
     ============================================================ */
  function zeigeMerkliste() {
    var ev = S.events.filter(function (e) { return merk.has(e.id); }).sort(nachStart);
    var su = S.startups.filter(function (s) { return merk.has(s.id); });
    S.merkEv = ev; S.merkSu = su;
    S.druck = { art: "beide", liste: ev, su: su, titel: "Merkliste" };
    var h = kopfband({ akzent: "merk", titel: "Merkliste", text: "Deine gemerkten Termine und Start-ups. Die Liste liegt nur in diesem Browser – jede Person hat ihre eigene, und nichts wird übertragen." }) + '<div class="breite" style="padding-top:24px">';
    if (!ev.length && !su.length) {
      h += '<div class="leer"><h3>Noch nichts gemerkt</h3><p>Tippe bei einem Termin oder Start-up auf den Stern. Hier sammelt sich dann alles, was du im Blick behalten willst – zum Herunterladen als Excel oder Kalenderdatei.</p><a class="knopf" href="#termine">Termine ansehen</a></div></div>';
      $("#ansicht").innerHTML = h; return;
    }
    if (ev.length) {
      h += '<div class="ergebnis-kopf"><span class="anzahl">' + plural(ev.length, "Termin", "Termine") + "</span>" + downloadsHtml("merk-ev", true) + "</div>" +
        '<ul class="zeilen">' + ev.map(zeileHtml).join("") + "</ul>";
    }
    if (su.length) {
      h += '<div class="ergebnis-kopf" style="margin-top:28px"><span class="anzahl">' + plural(su.length, "Start-up", "Start-ups") + "</span>" + downloadsHtml("merk-su", false) + "</div>" +
        '<ul class="zeilen">' + su.map(suZeileHtml).join("") + "</ul>";
    }
    h += "</div>";
    $("#ansicht").innerHTML = h;
  }
  function zeigeMerkZahl(pop) {
    var n = merk.size, el = $("#merk-zahl");
    el.hidden = !n; el.textContent = n;
    $(".merk-link").classList.toggle("hat", n > 0);
    if (pop && n) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
  }
  function umschalteMerk(id, knopf) {
    var an = !merk.has(id);
    if (an) merk.add(id); else merk.delete(id);
    store.set("radar-merkliste", Array.from(merk));
    var name = (findeEvent(id) || findeStartup(id) || {}).name || "";
    $$('[data-stern="' + id.replace(/"/g, "") + '"]').forEach(function (b) {
      b.classList.toggle("an", an); b.setAttribute("aria-pressed", an);
      b.title = an ? "Von der Merkliste nehmen" : "Merken";
      b.setAttribute("aria-label", (an ? "Von der Merkliste nehmen: " : "Merken: ") + name);
    });
    if (knopf && an && !reduziert.matches) { knopf.classList.remove("wackel"); void knopf.offsetWidth; knopf.classList.add("wackel"); }
    zeigeMerkZahl(an);
    toast(an ? "Auf der Merkliste: " + name : "Von der Merkliste genommen");
    if (S.route === "merkliste" && !$("#panel").open) zeigeMerkliste();
    else if ((S.route === "termine" && S.t.merk) || (S.route === "archiv" && S.a.merk)) aktualisiereListe(S.route, true);
    else if (S.route === "startups" && S.s.merk) aktualisiereStartups(true);
  }

  /* ============================================================
     Seitenpanel mit allen Angaben
     ============================================================ */
  var panel = $("#panel"), panelInhalt = $("#panel-inhalt");
  function oeffnePanel(typ, id, kontext, richtung) {
    if (!panel.open) S.panelVorher = document.activeElement;
    S.panel = { typ: typ, id: id, kontext: kontext && kontext.length ? kontext : [id] };
    var idx = S.panel.kontext.indexOf(id);
    if (idx < 0) { S.panel.kontext = [id]; idx = 0; }
    S.panel.idx = idx;
    var inhalt = typ === "event" ? panelEvent(findeEvent(id)) : typ === "su" ? panelStartup(findeStartup(id))
      : typ === "deal" ? panelDeal(findeDeal(id)) : typ === "inv" ? panelInvestor(findeInvestor(id)) : panelHilfe();
    if (panel.classList.contains("schliesst")) { schliessToken++; panel.classList.remove("schliesst"); }
    var k = S.panel.kontext.length;
    var fuss = (typ !== "hilfe" && k > 1) ? '<div class="p-fuss"><button type="button" class="knopf leise" data-blaettern="-1"' + (idx === 0 ? " disabled" : "") + ">" + I.links + "Vorheriger</button><span>" + (idx + 1) + " von " + k + '</span><button type="button" class="knopf leise" data-blaettern="1"' + (idx === k - 1 ? " disabled" : "") + ">Nächster" + I.rechts + "</button></div>" : "";
    panelInhalt.innerHTML = inhalt + fuss;
    if (richtung && !reduziert.matches) { var pi = $(".p-inhalt", panelInhalt); if (pi) pi.classList.add(richtung > 0 ? "wechsel-r" : "wechsel-l"); }
    panelInhalt.scrollTop = 0;
    tooltip(null);
    if (!panel.open) {
      panel.classList.remove("schliesst");
      if (panel.showModal) panel.showModal(); else panel.setAttribute("open", "");
      document.documentElement.classList.add("gesperrt");
    }
    var zu = $("[data-panel-zu]", panelInhalt); if (zu && !richtung) zu.focus({ preventScroll: true });
  }
  var schliessToken = 0;
  function schliessePanel() {
    if (!panel.open || panel.classList.contains("schliesst")) return;
    var token = ++schliessToken;
    var fertig = function () {
      if (token !== schliessToken) return;
      panel.classList.remove("schliesst");
      if (panel.open) panel.close();
    };
    if (reduziert.matches || !("onanimationend" in window)) return fertig();
    panel.classList.add("schliesst");
    var t = setTimeout(fertig, 320);
    panel.addEventListener("animationend", function h(ev) {
      if (ev.target !== panel) return;
      clearTimeout(t); panel.removeEventListener("animationend", h); fertig();
    });
  }
  panel.addEventListener("cancel", function (ev) { ev.preventDefault(); schliessePanel(); });
  panel.addEventListener("close", function () {
    document.documentElement.classList.remove("gesperrt");
    if (S.route === "merkliste") zeigeMerkliste();
    if (S.panelVorher && S.panelVorher.focus && document.contains(S.panelVorher)) S.panelVorher.focus({ preventScroll: true });
  });
  panel.addEventListener("click", function (ev) { if (ev.target === panel) schliessePanel(); });
  panel.addEventListener("keydown", function (ev) {
    if (!S.panel || S.panel.typ === "hilfe" || /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
    if (ev.key === "ArrowRight") blaettern(1);
    if (ev.key === "ArrowLeft") blaettern(-1);
  });
  function blaettern(r) {
    var p = S.panel; if (!p) return;
    var n = p.idx + r; if (n < 0 || n >= p.kontext.length) return;
    oeffnePanel(p.typ, p.kontext[n], p.kontext, r);
  }
  function panelKopf(art, id, name) {
    return '<div class="p-kopf"><span class="p-art">' + esc(art) + "</span>" + (id ? sternKnopf(id, name) : "") +
      '<button type="button" class="icon-knopf" data-panel-zu aria-label="Schließen" title="Schließen (Esc)">' + I.x + "</button></div>";
  }
  function fakt(icon, html) { return '<div class="p-fakt">' + icon + "<div>" + html + "</div></div>"; }
  function zeile(k, v) { return "<dt>" + esc(k) + "</dt><dd>" + esc(v == null || v === "" ? "k. A." : v) + "</dd>"; }

  function panelEvent(e) {
    var sc = e.scores, ent = entfernung(e);
    var h = panelKopf(e.rubrik === "noneu" ? "Veranstaltung außerhalb der EU" : "Veranstaltung, " + (e.rubrik === "eu" ? "EU" : RUBRIK[e.rubrik]), e.id, e.name) + '<div class="p-inhalt">';
    h += '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' + schild(e.prioritaet, e.gesamt, true) + status(e) + "</div>";
    h += '<h2 id="panel-titel">' + esc(e.name) + "</h2>";
    h += '<div class="p-fakten">' +
      fakt(I.kal, "<strong>" + esc(zeitraumLang(e)) + "</strong><br>" + esc(relativ(e)) + (e.status === "geschätzt" ? ", Datum aus dem Vorjahr abgeleitet" : "")) +
      fakt(I.ort, "<strong>" + esc(e.ort) + "</strong><br>" + esc(e.region) + (ent && !e.online ? ", " + esc(ent === "in Regensburg" ? "in Regensburg" : ent + " von Regensburg") : "")) +
      fakt(I.leute, esc(e.format) + ", " + esc(e.veranstalter)) +
      fakt(I.euro, esc(e.kosten)) + "</div>";
    h += '<div class="p-aktionen">' + (vorbei(e) ? "" : '<button type="button" class="knopf signal" data-ics="' + esc(e.id) + '">' + I.kalPlus + "In Kalender speichern</button>") +
      '<a class="knopf leise" href="' + esc(e.quelle) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Quelle öffnen</a></div>";
    if (e.anmeldeschluss && e.anmeldeschluss >= S.heute) {
      var n = tageBis(e.anmeldeschluss);
      h += '<div class="frist-box"><span class="countdown' + (n <= 14 ? " dringend" : "") + '"><b>' + n + "</b><small>" + (n === 1 ? "Tag" : "Tage") + "</small></span><div><strong>" + esc(e.frist_art || "Anmeldeschluss") + "</strong><br>bis " + esc(langDatum(e.anmeldeschluss)) + "</div></div>";
    }
    h += '<section class="p-abschnitt"><h3>Warum relevant</h3><p>' + esc(e.begruendung) + '</p><div class="rollen">' + e.rolle.map(function (r) { return '<span class="rolle">' + esc(r) + "</span>"; }).join("") + "</div></section>";
    var bar = function (name, gew, wert, hinweis) {
      return '<div class="sc"><span>' + name + "<small>" + gew + (hinweis ? ", " + hinweis : "") + '</small></span><span class="sc-bar"><i style="width:' + wert * 20 + '%"></i></span><b>' + wert + "</b></div>";
    };
    h += '<section class="p-abschnitt"><h3>Bewertung</h3><div class="scores">' +
      bar("Relevanz", "40 %", sc.relevanz) + bar("Zugang", "30 %", sc.zugang) + bar("Aufwand", "20 %", sc.aufwand, "5 = gering") + bar("Verlässlichkeit", "10 %", sc.verlaesslichkeit) +
      '</div><div class="sc-gesamt">Gesamtscore ' + schild(e.prioritaet, e.gesamt) + "</div></section>";
    h += '<section class="p-abschnitt"><h3>Alle Angaben</h3><dl class="angaben">' +
      zeile("Veranstalter", e.veranstalter) + zeile("Format", e.format + " (" + e.kategorie + ")") + zeile("Ort", e.ort) + zeile("Land / Bundesland", e.region) +
      zeile("Rubrik", RUBRIK[e.rubrik]) + zeile("Start und Ende", de(e.start) + (e.ende !== e.start ? " – " + de(e.ende) : "")) + zeile("Turnus", e.turnus) +
      zeile("Üblicher Zeitraum", e.zeitraum) + zeile("Terminstatus", e.status) +
      zeile("Anmeldeschluss", e.anmeldeschluss ? de(e.anmeldeschluss) + (e.frist_art ? " – " + e.frist_art : "") : "") + zeile("Anmeldung", e.anmeldung) +
      zeile("Kosten", e.kosten) + zeile("Zielgruppe", e.zielgruppe) + zeile("Themenfokus", e.fokus) + zeile("Empfohlene Rolle", e.rolle.join(", ")) +
      '<dt>Quelle</dt><dd><a href="' + esc(e.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(e.quelle)) + "</a></dd>" + zeile("Zuletzt geprüft", de(e.geprueft)) +
      "</dl></section></div>";
    return h;
  }
  function investorProfil(name) {
    var n = name.toLowerCase();
    for (var i = 0; i < S.investoren.length; i++) {
      var x = S.investoren[i];
      if (x.name.toLowerCase() === n || (x.aliase || []).some(function (a) { return a.toLowerCase() === n; })) return x;
    }
    return null;
  }
  function investorChip(name) {
    var p = investorProfil(name);
    return p ? '<button type="button" class="inv-chip profil" data-oeffne-inv="' + esc(p.id) + '">' + esc(name) + "</button>"
      : '<span class="inv-chip">' + esc(name) + "</span>";
  }
  function rundeZeit(r) {
    return '<li><span class="rz-datum">' + esc(monatJahr(r.datum)) + '</span><span class="rz-punkt" aria-hidden="true"></span><div><button type="button" class="linkknopf" data-oeffne-deal="' + esc(r.id) + '"><strong>' + esc(r.runde) + "</strong>, " + esc(r.betrag) + "</button>" +
      ((r.lead || []).length ? '<span class="rz-lead">Lead: ' + esc(r.lead.join(", ")) + "</span>" : "") + "</div></li>";
  }
  function panelStartup(s) {
    var runden = S.runden.filter(function (r) { return r.startup_id === s.id && r.art === "Finanzierungsrunde"; });
    var h = panelKopf("Start-up, " + s.region, s.id, s.name) + '<div class="p-inhalt">';
    h += '<div class="p-logo-zeile">' + logo(s, true) + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' + schild(s.prioritaet, null, true) + (s.quickwin ? '<span class="quick-badge">Quick Win</span>' : "") + suchfeldTag(s.suchfeld) + "</div></div>";
    h += '<h2 id="panel-titel">' + esc(s.name) + "</h2>";
    h += '<div class="p-fakten">' + fakt(I.ort, "<strong>" + esc(s.sitz) + "</strong>" + (s.land && s.land !== "DE" ? ", " + esc(LAND[s.land] || s.land) : "") + (s.gruendung && s.gruendung !== "k. A." ? ", gegründet " + esc(s.gruendung) : "")) +
      fakt(I.rakete, esc(s.reifegrad)) + "</div>";
    h += '<div class="p-aktionen">' + (s.website ? '<a class="knopf" href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Website</a>" : "") +
      '<a class="knopf leise" href="' + esc(s.quelle) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Quelle öffnen</a></div>";
    h += '<section class="p-abschnitt"><h3>Lösung</h3><p>' + esc(s.loesung) + "</p></section>";
    h += '<section class="p-abschnitt"><h3>Möglicher Mehrwert</h3><p>' + esc(s.mehrwert) + "</p><p><strong>Mögliche Kooperation:</strong> " + esc(s.kooperation) + "</p></section>";
    h += '<section class="p-abschnitt"><h3>Finanzierung und Investoren</h3><p>' + esc(s.finanzierung) + "</p>" +
      (runden.length ? '<ol class="rundenzeit">' + runden.map(rundeZeit).join("") + "</ol>" : "") +
      ((s.investoren_alle || []).length ? '<p class="klein" style="margin:12px 0 6px">Öffentlich bekannte Investoren</p><div class="inv-chips">' + s.investoren_alle.map(investorChip).join("") + "</div>" : "") +
      geteilteInvestoren(s) + "</section>";
    var bar = function (name, hinweis, wert) { return '<div class="sc"><span>' + name + "<small>" + hinweis + '</small></span><span class="sc-bar"><i style="width:' + wert * 20 + '%"></i></span><b>' + wert + "</b></div>"; };
    h += '<section class="p-abschnitt"><h3>Einordnung</h3><div class="scores">' + bar("Relevanz", "5 = sehr relevant", s.relevanz) + bar("Aufwand", "1 = gering", s.aufwand) + "</div></section>";
    h += '<section class="p-abschnitt"><h3>Alle Angaben</h3><dl class="angaben">' +
      zeile("Sitz", s.sitz) + zeile("Land", LAND[s.land] || s.land) + zeile("Region", s.region) + zeile("Gründungsjahr", s.gruendung) + zeile("Suchfeld", s.suchfeld) + zeile("Reifegrad", s.reifegrad) +
      zeile("Finanzierung", s.finanzierung) + zeile("Anbindung", s.anbindung) + zeile("Mögliche Kooperationsform", s.kooperation) +
      zeile("Bewertung", "Relevanz " + s.relevanz + "/5, Umsetzungsaufwand " + s.aufwand + "/5 (1 = gering), Priorität " + s.prioritaet) +
      "<dt>Website</dt><dd>" + (s.website ? '<a href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(s.website)) + "</a>" : "k. A.") + "</dd>" +
      '<dt>Quelle</dt><dd><a href="' + esc(s.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(s.quelle)) + "</a></dd>" + zeile("Zuletzt geprüft", de(s.geprueft)) +
      "</dl></section></div>";
    return h;
  }
  /* Investoren, die auch bei anderen Unternehmen im Radar beteiligt sind */
  function geteilteInvestoren(s) {
    var treffer = [];
    (s.investoren_alle || []).forEach(function (name) {
      var n = name.toLowerCase(), p = investorProfil(name);
      var namen = p ? [p.name].concat(p.aliase || []).map(function (x) { return x.toLowerCase(); }) : [n];
      var andere = [];
      S.runden.forEach(function (r) {
        if (r.art !== "Finanzierungsrunde" || r.startup_id === s.id) return;
        if ((r.lead || []).concat(r.investoren || []).some(function (x) { return namen.indexOf(x.toLowerCase()) >= 0; }) && andere.indexOf(r.unternehmen) < 0) andere.push(r.unternehmen);
      });
      if (andere.length) treffer.push([name, andere]);
    });
    if (!treffer.length) return "";
    return '<p class="klein" style="margin:14px 0 6px">Diese Investoren stecken auch in anderen Unternehmen im Radar</p><ul class="geteilt">' + treffer.map(function (t) {
      return "<li>" + investorChip(t[0]) + "<span>" + esc(t[1].join(", ")) + "</span></li>";
    }).join("") + "</ul>";
  }
  function panelDeal(r) {
    var su = r.startup_id ? findeStartup(r.startup_id) : null;
    var h = panelKopf(r.art === "Übernahme" ? "Übernahme" : r.art === "Fonds" ? "Neuer Fonds" : "Finanzierungsrunde") + '<div class="p-inhalt">';
    h += '<div class="deal-betrag">' + esc(r.betrag) + "</div>";
    h += '<h2 id="panel-titel">' + esc(r.unternehmen) + "</h2>";
    h += '<div class="p-fakten">' + fakt(I.kal, "<strong>" + esc(monatJahr(r.datum)) + "</strong>, " + esc(r.runde)) +
      fakt(I.ort, esc(r.sitz) + (r.land && r.land !== "DE" ? ", " + esc(LAND[r.land] || r.land) : "")) + fakt(I.ziel, esc(r.thema)) + "</div>";
    h += '<p class="deal-kurz">' + esc(r.kurz) + "</p>";
    h += '<div class="p-aktionen">' + (su ? '<button type="button" class="knopf" data-oeffne-su="' + esc(su.id) + '">' + I.rakete + "Start-up im Radar ansehen</button>" : "") +
      '<a class="knopf leise" href="' + esc(r.quelle) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Quelle öffnen</a></div>";
    if ((r.lead || []).length) h += '<section class="p-abschnitt"><h3>' + (r.art === "Übernahme" ? "Käufer" : r.art === "Fonds" ? "Träger" : "Lead") + '</h3><div class="inv-chips">' + r.lead.map(investorChip).join("") + "</div></section>";
    var weitere = (r.investoren || []).filter(function (x) { return (r.lead || []).indexOf(x) < 0; });
    if (weitere.length) h += '<section class="p-abschnitt"><h3>' + (r.art === "Fonds" ? "Geldgeber" : "Weitere Beteiligte") + '</h3><div class="inv-chips">' + weitere.map(investorChip).join("") + "</div></section>";
    h += '<section class="p-abschnitt"><h3>Angaben</h3><dl class="angaben">' + zeile("Art", r.art) + zeile("Runde", r.runde) + zeile("Betrag", r.betrag) +
      '<dt>Quelle</dt><dd><a href="' + esc(r.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(r.quelle)) + "</a></dd>" + zeile("Zuletzt geprüft", de(r.geprueft)) + "</dl></section></div>";
    return h;
  }
  function panelInvestor(x) {
    var h = panelKopf(x.typ) + '<div class="p-inhalt">';
    h += '<h2 id="panel-titel">' + esc(x.name) + "</h2>";
    h += '<div class="p-fakten">' + fakt(I.ort, "<strong>" + esc(x.sitz) + "</strong>") + fakt(I.rakete, esc(x.phasen)) + fakt(I.euro, "Ticket: " + esc(x.ticket) + "<br>Volumen: " + esc(x.volumen)) + "</div>";
    h += '<p class="deal-kurz">' + esc(x.kurz) + "</p>";
    h += '<div class="p-aktionen">' + (x.website ? '<a class="knopf" href="' + esc(x.website) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Website</a>" : "") +
      '<a class="knopf leise" href="' + esc(x.quelle) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Quelle öffnen</a></div>";
    h += '<section class="p-abschnitt"><h3>Themen</h3><div class="sf-legende">' + (x.themen || []).map(suchfeldTag).join("") + "</div></section>";
    h += '<section class="p-abschnitt"><h3>Beteiligungen im Radar</h3>' + ((x.portfolio || []).length ? '<ul class="portfolio">' + x.portfolio.map(function (p) {
      var su = p.startup_id ? findeStartup(p.startup_id) : null;
      return "<li>" + (su ? logo(su) : "") + '<button type="button" class="linkknopf" ' + (su ? 'data-oeffne-su="' + esc(su.id) + '"' : 'data-oeffne-deal="' + esc(p.runde_id) + '"') + ">" + esc(p.unternehmen) + "</button></li>";
    }).join("") + "</ul>" : "<p>In den hier erfassten Runden noch nicht vertreten.</p>") + "</section>";
    h += '<section class="p-abschnitt"><h3>Angaben</h3><dl class="angaben">' + zeile("Typ", x.typ) + zeile("Sitz", x.sitz) + zeile("Phasen", x.phasen) + zeile("Ticket", x.ticket) + zeile("Volumen", x.volumen) +
      '<dt>Quelle</dt><dd><a href="' + esc(x.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(x.quelle)) + "</a></dd>" + zeile("Zuletzt geprüft", de(x.geprueft)) + "</dl></section></div>";
    return h;
  }
  function panelHilfe() {
    return panelKopf("Hilfe") + '<div class="p-inhalt"><h2 id="panel-titel">So funktioniert die Seite</h2>' +
      '<ol class="hilfe-schritte">' +
      "<li><div><strong>Überblick im Radar</strong>Die Startseite zeigt alle Termine rund um Regensburg. Richtung und Abstand entsprechen der Lage, die Farbe der Priorität. Oben wählst du den Zeitraum.</div></li>" +
      "<li><div><strong>Termine finden</strong>Unter „Termine“ nach Region, Priorität, Format oder Monat filtern und zwischen Liste, Zeitstrahl, Kalender und Radar wechseln. Strg+K durchsucht alles.</div></li>" +
      "<li><div><strong>In den Kalender</strong>„In Kalender speichern“ legt einen Termin in Outlook an, mit Erinnerung 30 und 7 Tage vorher und – falls bekannt – 7 Tage vor dem Anmeldeschluss.</div></li>" +
      "<li><div><strong>Merken und mitnehmen</strong>Der Stern legt Termine und Start-ups auf deine Merkliste. „Excel“, „Kalender“, „CSV“ und „Drucken“ nehmen genau die aktuell gefilterte Auswahl mit.</div></li>" +
      "<li><div><strong>Kapital</strong>Unter „Kapital“ stehen öffentlich bekannte Finanzierungsrunden, Übernahmen und Investoren. Die Grafik zeigt, welche Investoren hinter welchen Unternehmen stehen.</div></li></ol>" +
      '<section class="p-abschnitt" style="margin-top:20px"><h3>Was die Zeichen bedeuten</h3><div class="schwellen" style="margin:0 0 12px">' + schild("A") + "<span>besonders lohnend (ab 4,0)</span>" + schild("B") + "<span>lohnend</span>" + schild("C") + "<span>bei passendem Anlass</span></div>" +
      '<p><span class="status">bestätigt</span> Datum vom Veranstalter veröffentlicht. <span class="status schaetz">geschätzt</span> Datum aus dem Vorjahr abgeleitet, vor der Planung prüfen.</p></section>' +
      '<section class="p-abschnitt"><h3>Tastenkürzel</h3><div class="tasten"><span><kbd>Strg</kbd> + <kbd>K</kbd> oder <kbd>/</kbd></span><span>Suchen</span><span><kbd>←</kbd> <kbd>→</kbd></span><span>Im Detailfenster blättern</span><span><kbd>Esc</kbd></span><span>Fenster schließen</span></div></section>' +
      '<section class="p-abschnitt"><h3>Daten und Datenschutz</h3><p>Alle Angaben stammen aus öffentlichen Quellen und sind mit Quelle und Prüfdatum versehen. Die Seite setzt keine Cookies, nutzt kein Tracking und lädt nichts von fremden Servern. Merkliste und Farbschema liegen nur in deinem Browser.</p></section></div>';
  }

  /* ============================================================
     Schnellsuche
     ============================================================ */
  var suche = $("#suche"), sucheFeld = $("#suche-feld"), sucheTreffer = $("#suche-treffer");
  var sucheAuswahl = 0, sucheListe = [];
  function oeffneSuche() {
    if (!S.geladen) return;
    if (panel.open) { S.panelVorher = null; panel.classList.remove("schliesst"); panel.close(); }
    sucheFeld.value = ""; sucheAuswahl = 0; sucheRendern();
    if (suche.showModal) suche.showModal(); else suche.setAttribute("open", "");
    sucheFeld.focus();
  }
  function sucheRendern() {
    var q = sucheFeld.value.trim().toLowerCase(), w = q ? q.split(/\s+/) : [];
    var treffer = [];
    if (!w.length) {
      kommende().slice(0, 5).forEach(function (e) { treffer.push({ typ: "event", x: e, p: 0 }); });
      S.startups.filter(function (s) { return s.quickwin; }).slice(0, 3).forEach(function (s) { treffer.push({ typ: "su", x: s, p: 0 }); });
    } else {
      S.events.forEach(function (e) {
        var t = [e.name, e.format, e.kategorie, e.veranstalter, e.ort, e.region, e.fokus, e.zielgruppe, RUBRIK[e.rubrik]].join(" ").toLowerCase();
        if (w.every(function (x) { return t.indexOf(x) >= 0; })) {
          var n = e.name.toLowerCase();
          treffer.push({ typ: "event", x: e, p: (n.indexOf(q) === 0 ? 30 : n.indexOf(q) > 0 ? 15 : 0) + (vorbei(e) ? -20 : 0) + ({ A: 3, B: 2, C: 1 })[e.prioritaet] });
        }
      });
      S.startups.forEach(function (s) {
        var t = [s.name, s.sitz, s.region, s.loesung, s.suchfeld, s.mehrwert, s.reifegrad].join(" ").toLowerCase();
        if (w.every(function (x) { return t.indexOf(x) >= 0; })) {
          var n = s.name.toLowerCase();
          treffer.push({ typ: "su", x: s, p: (n.indexOf(q) === 0 ? 30 : n.indexOf(q) > 0 ? 15 : 0) + 1 });
        }
      });
      S.investoren.forEach(function (x) {
        var t = [x.name, x.typ, x.sitz, x.kurz, (x.aliase || []).join(" "), (x.themen || []).join(" ")].join(" ").toLowerCase();
        if (w.every(function (y) { return t.indexOf(y) >= 0; })) { var n = x.name.toLowerCase(); treffer.push({ typ: "inv", x: x, p: (n.indexOf(q) === 0 ? 28 : n.indexOf(q) > 0 ? 14 : 0) }); }
      });
      S.runden.forEach(function (r) {
        var t = [r.unternehmen, r.art, r.runde, r.sitz, r.thema, r.kurz, (r.lead || []).join(" "), (r.investoren || []).join(" ")].join(" ").toLowerCase();
        if (w.every(function (y) { return t.indexOf(y) >= 0; })) { var n = r.unternehmen.toLowerCase(); treffer.push({ typ: "deal", x: r, p: (n.indexOf(q) === 0 ? 20 : 0) - 2 }); }
      });
      treffer.sort(function (a, b) { return b.p - a.p || (a.x.start && b.x.start ? (a.x.start < b.x.start ? -1 : 1) : 0); });
      treffer = treffer.slice(0, 30);
    }
    sucheListe = treffer;
    if (sucheAuswahl >= treffer.length) sucheAuswahl = 0;
    var mark = function (text) {
      var h = esc(text);
      w.forEach(function (x) { if (x.length < 2) return; var re = new RegExp("(" + esc(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"); h = h.replace(re, "<mark>$1</mark>"); });
      return h;
    };
    sucheTreffer.innerHTML = treffer.length ? treffer.map(function (t, i) {
      var x = t.x;
      var sub = t.typ === "event" ? zeitraum(x) + ", " + x.ort + (vorbei(x) ? " (vorbei)" : "")
        : t.typ === "su" ? x.sitz + ", " + x.suchfeld
        : t.typ === "inv" ? x.typ + ", " + x.sitz
        : monatJahr(x.datum) + ", " + x.runde + ", " + x.betrag;
      var name = t.typ === "deal" ? x.unternehmen : x.name;
      var art = { event: "Termin", su: "Start-up", inv: "Investor", deal: "Deal" }[t.typ];
      var rechts = t.typ === "event" || t.typ === "su" ? schild(x.prioritaet) : "";
      return '<li role="option" id="st-' + i + '" data-i="' + i + '" aria-selected="' + (i === sucheAuswahl) + '"><span class="st-art">' + art + "</span>" +
        '<span><span class="st-name">' + mark(name) + '</span><span class="st-sub">' + esc(sub) + "</span></span>" + rechts + "</li>";
    }).join("") : '<li class="suche-leer" role="presentation">Nichts gefunden. Anderen Begriff versuchen, zum Beispiel einen Ort oder ein Thema.</li>';
    if (!w.length && treffer.length) sucheTreffer.insertAdjacentHTML("afterbegin", '<li class="st-art" role="presentation" style="display:block;padding:6px 10px 2px;width:auto;cursor:default">Als Nächstes und Quick Wins</li>');
    sucheFeld.setAttribute("aria-activedescendant", treffer.length ? "st-" + sucheAuswahl : "");
  }
  function sucheWaehle(i) {
    var t = sucheListe[i]; if (!t) return;
    suche.close();
    var ids = sucheListe.filter(function (x) { return x.typ === t.typ; }).map(function (x) { return x.x.id; });
    oeffnePanel(t.typ, t.x.id, ids);
  }
  sucheFeld.addEventListener("input", function () { sucheAuswahl = 0; sucheRendern(); });
  sucheFeld.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowDown") { sucheAuswahl = Math.min(sucheListe.length - 1, sucheAuswahl + 1); markiereSuche(); ev.preventDefault(); }
    if (ev.key === "ArrowUp") { sucheAuswahl = Math.max(0, sucheAuswahl - 1); markiereSuche(); ev.preventDefault(); }
    if (ev.key === "Enter") { sucheWaehle(sucheAuswahl); ev.preventDefault(); }
  });
  function markiereSuche() {
    $$("li[data-i]", sucheTreffer).forEach(function (li) { var an = +li.getAttribute("data-i") === sucheAuswahl; li.setAttribute("aria-selected", an); if (an) li.scrollIntoView({ block: "nearest" }); });
    sucheFeld.setAttribute("aria-activedescendant", "st-" + sucheAuswahl);
  }
  sucheTreffer.addEventListener("click", function (ev) { var li = ev.target.closest("li[data-i]"); if (li) sucheWaehle(+li.getAttribute("data-i")); });
  sucheTreffer.addEventListener("mousemove", function (ev) { var li = ev.target.closest("li[data-i]"); if (li && +li.getAttribute("data-i") !== sucheAuswahl) { sucheAuswahl = +li.getAttribute("data-i"); markiereSuche(); } });
  suche.addEventListener("click", function (ev) { if (ev.target === suche) suche.close(); });
  $("#suche-zu").addEventListener("click", function () { suche.close(); });
  $("#such-oeffnen").addEventListener("click", oeffneSuche);
  document.addEventListener("keydown", function (ev) {
    var tippt = /INPUT|SELECT|TEXTAREA/.test((ev.target.tagName || "")) || ev.target.isContentEditable;
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === "k" || ev.key === "K")) { ev.preventDefault(); suche.open ? suche.close() : oeffneSuche(); }
    else if (ev.key === "/" && !tippt && !suche.open) { ev.preventDefault(); oeffneSuche(); }
  });

  /* ============================================================
     Allgemeine Klicks (Delegation)
     ============================================================ */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-stern],[data-ics],[data-oeffne],[data-oeffne-su],[data-oeffne-deal],[data-oeffne-inv],[data-dl],[data-hilfe],[data-panel-zu],[data-blaettern]");
    if (!t) return;
    if (t.closest(".zs-scroll.zieht")) { ev.preventDefault(); return; }
    if (t.hasAttribute("data-stern")) return umschalteMerk(t.getAttribute("data-stern"), t);
    if (t.hasAttribute("data-ics")) {
      var e = findeEvent(t.getAttribute("data-ics"));
      X.download(X.buildICS([e], site(), e.name), dateiname(kurzname(e), "ics"), "text/calendar;charset=utf-8");
      return toast("Kalenderdatei geladen – öffnen, um den Termin in Outlook zu speichern");
    }
    if (t.hasAttribute("data-oeffne")) {
      var id = t.getAttribute("data-oeffne"), k = t.getAttribute("data-kontext");
      var kontext = k === "held" ? heldListe().map(function (x) { return x.id; })
        : k === "liste" ? S.liste.map(function (x) { return x.id; })
        : k === "zs" ? $$("[data-kontext=zs]", t.closest(".zs")).map(function (x) { return x.getAttribute("data-oeffne"); }).sort(function (a, b) { return nachStart(findeEvent(a), findeEvent(b)); })
        : S.route === "merkliste" ? (S.merkEv || []).map(function (x) { return x.id; }) : null;
      return oeffnePanel("event", id, kontext);
    }
    if (t.hasAttribute("data-oeffne-su")) {
      var kont = S.route === "startups" ? S.suListe.map(function (x) { return x.id; }) : S.route === "merkliste" ? (S.merkSu || []).map(function (x) { return x.id; }) : S.startups.filter(function (s) { return s.quickwin; }).map(function (x) { return x.id; });
      return oeffnePanel("su", t.getAttribute("data-oeffne-su"), kont);
    }
    if (t.hasAttribute("data-oeffne-deal")) {
      var dk = S.route === "kapital" && S.dealListe ? S.dealListe : S.runden;
      return oeffnePanel("deal", t.getAttribute("data-oeffne-deal"), dk.map(function (x) { return x.id; }));
    }
    if (t.hasAttribute("data-oeffne-inv")) return oeffnePanel("inv", t.getAttribute("data-oeffne-inv"), S.investoren.map(function (x) { return x.id; }));
    if (t.hasAttribute("data-dl")) return herunterladen(t.getAttribute("data-dl"), t.getAttribute("data-quelle"));
    if (t.hasAttribute("data-hilfe")) return oeffnePanel("hilfe", "hilfe");
    if (t.hasAttribute("data-panel-zu")) return schliessePanel();
    if (t.hasAttribute("data-blaettern")) return blaettern(+t.getAttribute("data-blaettern"));
  });
  $("#hilfe-oeffnen").addEventListener("click", function () { if (S.geladen) oeffnePanel("hilfe", "hilfe"); });
  $("#thema").addEventListener("click", function () {
    var jetzt = document.documentElement.getAttribute("data-theme") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var neu = jetzt === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", neu);
    store.set("radar-theme", neu);
    toast(neu === "dark" ? "Dunkles Farbschema" : "Helles Farbschema");
  });

  /* ============================================================
     Herunterladen & Drucken
     ============================================================ */
  function herunterladen(art, quelle) {
    if (quelle === "deals" || quelle === "investoren") {
      var kl = quelle === "deals" ? (S.dealListe || S.runden) : S.investoren;
      var cols = quelle === "deals" ? X.RUNDEN_COLS : X.INVESTOR_COLS, nm = quelle === "deals" ? "kapital-deals" : "kapital-investoren";
      if (art === "druck") { S.druck = { art: quelle === "deals" ? "runden" : "investoren", liste: kl, titel: quelle === "deals" ? "Kapital – Deals" : "Kapital – Investoren" }; return setTimeout(function () { window.print(); }, 30); }
      if (!kl.length) return toast("Die Auswahl ist leer – erst Filter anpassen.");
      if (art === "csv") X.download(X.buildCSV(kl, cols), dateiname(nm, "csv"), "text/csv;charset=utf-8");
      if (art === "xlsx") X.download(X.buildXLSX(kl, cols, quelle === "deals" ? "Deals" : "Investoren"), dateiname(nm, "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return toast((art === "xlsx" ? "Excel-Datei" : "CSV-Datei") + " mit " + plural(kl.length, quelle === "deals" ? "Deal" : "Investor", quelle === "deals" ? "Deals" : "Investoren") + " geladen");
    }
    var ev = quelle === "merk-ev" ? S.merkEv : S.liste, su = quelle === "merk-su" ? S.merkSu : S.suListe;
    var istSu = quelle === "su" || quelle === "merk-su";
    var liste = istSu ? su : ev;
    var teil = quelle === "merk-ev" ? "merkliste-termine" : quelle === "merk-su" ? "merkliste-start-ups" : istSu ? "start-ups" : (S.route === "archiv" ? "archiv" : "termine-" + (S.t.rubrik || "alle"));
    if (art === "druck") {
      S.druck = istSu ? { art: "startups", liste: liste, titel: quelle === "merk-su" ? "Merkliste – Start-ups" : "Start-ups" } : { art: "events", liste: liste, titel: quelle === "merk-ev" ? "Merkliste – Termine" : S.druck && S.druck.titel || "Termine" };
      return setTimeout(function () { window.print(); }, 30);
    }
    if (!liste || !liste.length) return toast("Die Auswahl ist leer – erst Filter anpassen.");
    if (istSu) {
      if (art === "csv") X.download(X.buildCSV(liste, X.STARTUP_COLS), dateiname(teil, "csv"), "text/csv;charset=utf-8");
      if (art === "xlsx") X.download(X.buildXLSX(liste, X.STARTUP_COLS, "Start-ups"), dateiname(teil, "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } else {
      if (art === "ics") X.download(X.buildICS(liste, site(), "Start-up- & Event-Radar"), dateiname(teil, "ics"), "text/calendar;charset=utf-8");
      if (art === "csv") X.download(X.buildCSV(liste, X.EVENT_COLS), dateiname(teil, "csv"), "text/csv;charset=utf-8");
      if (art === "xlsx") X.download(X.buildXLSX(liste, X.EVENT_COLS, "Veranstaltungen"), dateiname(teil, "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }
    toast((art === "xlsx" ? "Excel-Datei" : art === "ics" ? "Kalenderdatei" : "CSV-Datei") + " mit " + plural(liste.length, istSu ? "Start-up" : "Termin", istSu ? "Start-ups" : "Terminen") + " geladen");
  }

  window.addEventListener("beforeprint", function () {
    var d = S.druck || { art: "events", liste: kommende(), titel: "Termine" };
    var dl = function (paare) { return '<dl class="d-dl">' + paare.map(function (p) { return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1] == null || p[1] === "" ? "k. A." : p[1]) + "</dd>"; }).join("") + "</dl>"; };
    var evHtml = function (e) {
      return '<div class="d-ev"><div class="d-datum">' + esc(zeitraum(e)) + "<br>" + esc(e.status) + "</div><div><h2><span class=\"d-prio " + e.prioritaet + '">' + e.prioritaet + " " + komma(e.gesamt) + "</span>" + esc(e.name) + "</h2>" +
        "<p>" + esc(e.begruendung) + "</p>" + dl([["Format", e.format + " (" + e.kategorie + ")"], ["Veranstalter", e.veranstalter], ["Ort", e.ort + ", " + e.region], ["Turnus / Zeitraum", e.turnus + " / " + e.zeitraum],
          ["Anmeldeschluss", e.anmeldeschluss ? de(e.anmeldeschluss) + (e.frist_art ? " – " + e.frist_art : "") : ""], ["Anmeldung", e.anmeldung], ["Kosten", e.kosten], ["Zielgruppe", e.zielgruppe], ["Themenfokus", e.fokus],
          ["Empfohlene Rolle", e.rolle.join(", ")], ["Bewertung", "Relevanz " + e.scores.relevanz + ", Zugang " + e.scores.zugang + ", Aufwand " + e.scores.aufwand + " (5 = gering), Verlässlichkeit " + e.scores.verlaesslichkeit],
          ["Quelle", e.quelle], ["Zuletzt geprüft", de(e.geprueft)]]) + "</div></div>";
    };
    var suHtml = function (s) {
      return '<div class="d-ev"><div class="d-datum">' + esc(s.sitz) + "<br>" + esc(s.region) + '</div><div><h2><span class="d-prio ' + s.prioritaet + '">' + s.prioritaet + "</span>" + esc(s.name) + "</h2><p>" + esc(s.loesung) + "</p>" +
        dl([["Suchfeld", s.suchfeld], ["Möglicher Mehrwert", s.mehrwert], ["Gründungsjahr", s.gruendung], ["Reifegrad", s.reifegrad], ["Finanzierung", s.finanzierung], ["Investoren", (s.investoren_alle || []).join(", ")], ["Anbindung", s.anbindung], ["Kooperationsform", s.kooperation],
          ["Bewertung", "Relevanz " + s.relevanz + "/5, Aufwand " + s.aufwand + "/5 (1 = gering)" + (s.quickwin ? ", Quick Win" : "")], ["Website", s.website], ["Quelle", s.quelle], ["Zuletzt geprüft", de(s.geprueft)]]) + "</div></div>";
    };
    var h = "<h1>" + esc(d.titel) + '</h1><p class="d-meta">Start-up- &amp; Event-Radar, Stand ' + esc(de(S.meta.stand)) + ", gedruckt am " + esc(de(S.heute)) + ". " + esc(site()) + "</p>";
    var dealHtml = function (r) {
      return '<div class="d-ev"><div class="d-datum">' + esc(monatJahr(r.datum)) + "<br>" + esc(r.art) + '</div><div><h2>' + esc(r.unternehmen) + ": " + esc(r.betrag) + "</h2><p>" + esc(r.kurz) + "</p>" +
        dl([["Runde", r.runde], ["Sitz", r.sitz + (r.land ? " (" + (LAND[r.land] || r.land) + ")" : "")], ["Thema", r.thema], ["Lead / Käufer", (r.lead || []).join(", ")], ["Beteiligte", (r.investoren || []).join(", ")], ["Quelle", r.quelle], ["Zuletzt geprüft", de(r.geprueft)]]) + "</div></div>";
    };
    var invHtml = function (x) {
      return '<div class="d-ev"><div class="d-datum">' + esc(x.typ) + "<br>" + esc(x.sitz) + "</div><div><h2>" + esc(x.name) + "</h2><p>" + esc(x.kurz) + "</p>" +
        dl([["Phasen", x.phasen], ["Ticket", x.ticket], ["Volumen", x.volumen], ["Themen", (x.themen || []).join(", ")], ["Beteiligungen im Radar", (x.portfolio || []).map(function (p) { return p.unternehmen; }).join(", ")], ["Website", x.website], ["Quelle", x.quelle]]) + "</div></div>";
    };
    if (d.art === "runden") h += d.liste.map(dealHtml).join("");
    else if (d.art === "investoren") h += d.liste.map(invHtml).join("");
    else if (d.art === "startups") h += d.liste.map(suHtml).join("");
    else if (d.art === "beide") h += d.liste.map(evHtml).join("") + (d.su.length ? "<h1 style=\"margin-top:8mm\">Start-ups</h1>" + d.su.map(suHtml).join("") : "");
    else h += d.liste.map(evHtml).join("");
    if (!d.liste.length && !(d.su && d.su.length)) h += "<p>Die Auswahl ist leer.</p>";
    $("#druck").innerHTML = h;
  });
  window.addEventListener("afterprint", function () { $("#druck").innerHTML = ""; });
})();
