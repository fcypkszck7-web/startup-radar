/* Start-up- & Event-Radar – Seitenlogik. Statisch, ohne Server, ohne Cookies, ohne externe Anfragen. */
(function () {
  "use strict";
  var X = window.RadarExport, Radar = window.Radar;

  var RUBRIK = { region: "Region Regensburg", de: "Deutschland", eu: "EU", noneu: "Schweiz, UK, Norwegen" };
  var REITER = [["", "Alle"], ["region", "Region Regensburg"], ["de", "Deutschland"], ["eu", "Europa"]];
  var REITER_TEXT = {
    "": "Alle kommenden Veranstaltungen der nächsten 18 Monate – Fachmessen, Kongresse, Vorträge, Webinare und Start-up-Events, sortiert nach Datum.",
    region: "Oberpfalz, Niederbayern, Landkreis Kelheim und Umgebung bis etwa 100 km. München und Nürnberg stehen unter Deutschland.",
    de: "Übriges Deutschland einschließlich München und Nürnberg sowie Online-Termine.",
    eu: "Österreich und die Schweiz in voller Breite, im übrigen Europa die wichtigen Fachmessen, Kongresse und Start-up-Events. Termine außerhalb der EU sind gesondert aufgeführt."
  };
  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var MON_KURZ = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sep", "Okt", "Nov", "Dez"];
  var WTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var WTAG_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var FENSTER = [[3, "3 Monate"], [6, "6 Monate"], [12, "12 Monate"], [18, "18 Monate"]];
  var TITEL = { uebersicht: "Übersicht", termine: "Termine", startups: "Start-ups", kapital: "Kapital", archiv: "Archiv", merkliste: "Merkliste", intern: "Intern", quellen: "Quellen" };
  var SU_REGIONEN = [["", "Alle Regionen"], ["Ostbayern", "Ostbayern"], ["Bayern", "Bayern"], ["Deutschland", "Deutschland"], ["Europa", "Europa"]];
  var SU_TEXT = {
    "": "Start-ups aus Bau, Energie, Industrie, Handwerk und angrenzenden Branchen – von Ostbayern bis Europa, nach Branche und Region filterbar.",
    Ostbayern: "Regensburg, Oberpfalz und Niederbayern – kurze Wege, schnelle Piloten.",
    Bayern: "Übriges Bayern, vor allem München und Augsburg.",
    Deutschland: "Start-ups aus dem übrigen Deutschland – von Stuttgart und Berlin bis ins Rheinland.",
    Europa: "Europäische Start-ups – vor allem aus Österreich, der Schweiz, Skandinavien, dem Baltikum und den Niederlanden."
  };
  var BRANCHEN = ["Bau & Immobilien", "Dach & Gebäudehülle", "Energie & Solar", "Gebäudetechnik", "Industrie & Fertigung",
    "Metall & Oberflächen", "Material & Kreislauf", "Handwerk", "Software, KI & Daten", "Logistik & Handel", "Gründung & Innovation"];
  var BRANCHE_FARBE = {
    "Bau & Immobilien": "#8a6a3a", "Dach & Gebäudehülle": "#b4572e", "Energie & Solar": "#d4831c", "Gebäudetechnik": "#2a7fae",
    "Industrie & Fertigung": "#bf4f36", "Metall & Oberflächen": "#5d6d7e", "Material & Kreislauf": "#3f8f3c", "Handwerk": "#9a5a2a",
    "Software, KI & Daten": "#5868d0", "Logistik & Handel": "#8a55c2", "Gründung & Innovation": "#178a87"
  };
  /* Eigene Strich-Icons je Branche (24er Raster) */
  var BR_ICON = {
    "": '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
    "Bau & Immobilien": '<path d="M4.5 20.5V5.5l8-2.5v17.5M12.5 8.5l7 2.2v9.8M3 20.5h18M7.5 8v.01M7.5 11.5v.01M7.5 15v.01M10 8v.01M10 11.5v.01M10 15v.01M15.5 13v.01M15.5 16.5v.01"/>',
    "Dach & Gebäudehülle": '<path d="M2.5 12.5L12 4.5l9.5 8M5.5 10.2V20h13v-9.8M9.5 20v-5.5h5V20M8.2 9.6L12 6.4l3.8 3.2"/>',
    "Energie & Solar": '<circle cx="7" cy="7" r="2.6"/><path d="M7 2.2v1.2M2.2 7h1.2M3.6 3.6l.9.9M10.4 3.6l-.9.9M8.5 21l2.6-9H21l-2.6 9zM9.8 16.5h9.9M14.4 12l-2.6 9M17.7 12l-2.6 9"/>',
    "Gebäudetechnik": '<path d="M3 9.5h6.5v5H3M21 9.5h-6.5v5H21M9.5 12h5M12 12V6.5M9 6.5h6M3 8v8M21 8v8"/>',
    "Industrie & Fertigung": '<path d="M3 20.5V11l5 3v-3l5 3v-3l5 3V4.5h3v16zM2 20.5h20M7 17.5h2M12 17.5h2"/>',
    "Metall & Oberflächen": '<path d="M3 7.5c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0M3 12c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0M3 16.5c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0"/>',
    "Material & Kreislauf": '<path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3M4.5 12a7.5 7.5 0 0 1 12.8-5.3M17.5 3v3.8h-3.8M6.5 21v-3.8h3.8"/>',
    "Handwerk": '<path d="M14.6 6.4a4 4 0 0 0-5.3 5.3L3.5 17.5a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.1-.4-.4-2.1z"/>',
    "Software, KI & Daten": '<rect x="7" y="7" width="10" height="10" rx="1.6"/><rect x="10" y="10" width="4" height="4" rx=".6"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
    "Logistik & Handel": '<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    "Gründung & Innovation": '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2v.5h5V16c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'
  };
  var BR_KURZ = { "Bau & Immobilien": "Bau", "Dach & Gebäudehülle": "Dach & Hülle", "Energie & Solar": "Energie & Solar", "Gebäudetechnik": "Gebäudetechnik", "Industrie & Fertigung": "Industrie",
    "Metall & Oberflächen": "Metall", "Material & Kreislauf": "Kreislauf", "Handwerk": "Handwerk", "Software, KI & Daten": "Software & KI", "Logistik & Handel": "Logistik", "Gründung & Innovation": "Gründung" };
  function brIcon(w) { return '<svg class="br-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (BR_ICON[w] || BR_ICON[""]) + "</svg>"; }
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
    unten: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 9.5L12 16l6.5-6.5"/></svg>',
    export: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/></svg>',
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
    schloss: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/><circle cx="12" cy="15.5" r="1.2"/></svg>',
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
    s: { feld: "", region: "", q: "", merk: false, branche: "" },
    runden: [], investoren: [], logos: {}, k: { art: "", thema: "", nurRadar: false },
    liste: [], suListe: [], radare: [], druck: null, panel: null
  };
  function neuerFilter(ansicht) { return { rubrik: "", prio: { A: true, B: true, C: true }, kat: "", branche: "", monat: "", q: "", merk: false, best: false, ansicht: ansicht, kal: null }; }
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
  var NAV_REIHE = ["uebersicht", "termine", "startups", "kapital", "archiv", "quellen", "intern", "merkliste"];
  /* Kacheln und Start-up-Karten neigen sich zum Mauszeiger, ein Lichtreflex wandert mit */
  if (window.Bewegung) { window.Bewegung.neigen(".bento > .kachel"); window.Bewegung.neigen("ul.su-karten > .su-zeile"); }
  function routen() {
    if (!S.geladen) return;
    var z = leseHash();
    var wechsel = z.r !== S.route;
    var richtung = NAV_REIHE.indexOf(z.r) >= NAV_REIHE.indexOf(S.route) ? 1 : -1, mitKamera = wechsel && S.schonGezeichnet;
    if (z.r === "termine") { if (S.t.rubrik !== z.rub) S.t.monat = ""; S.t.rubrik = z.rub; }
    S.route = z.r;
    $$("[data-nav]").forEach(function (a) {
      var an = a.getAttribute("data-nav") === z.r;
      a.classList.toggle("aktiv", an);
      if (an) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    navZeiger();
    document.title = TITEL[z.r] + " – Start-up- & Event-Radar";
    var zeichne = function () {
      aufraeumen();
      ({ uebersicht: zeigeUebersicht, termine: zeigeTermine, startups: zeigeStartups, kapital: zeigeKapital, archiv: zeigeArchiv, merkliste: zeigeMerkliste, intern: zeigeIntern, quellen: zeigeQuellen })[z.r]();
      beobachteFilter();
      if (wechsel) window.scrollTo(0, 0);
      /* Kamerafahrt: Kopffoto fährt aus der Klickrichtung ins Bild, Überschrift steigt Buchstabe für Buchstabe auf */
      if (mitKamera && window.Bewegung) window.Bewegung.kamera({ bild: $("#kopfband .kb-bild"), titel: $("#kopfband h1"), text: $("#kopfband .kb-intro"), dir: richtung });
    };
    var leicht = document.getElementById("ansicht").getElementsByTagName("*").length < 1500;
    if (wechsel && leicht && document.startViewTransition && !reduziert.matches && S.schonGezeichnet) {
      try {
        var vt = document.startViewTransition(zeichne);
        [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (pr) { if (pr && pr.catch) pr.catch(function () { /* Übergang übersprungen */ }); });
      } catch (e) { zeichne(); }
    } else zeichne();
    S.schonGezeichnet = true;
  }
  function aufraeumen() {
    if (S.leit) S.leit.neu(null);
    S.radare.forEach(function (r) { r.entferne(); });
    S.radare = [];
    ansichtRadarWeg();
    tooltip(null);
  }
  function ansichtRadarWeg() { if (S.ansichtRadar) { S.ansichtRadar.entferne(); S.ansichtRadar = null; } }

  /* Höhe der klebenden Filterleiste als CSS-Variable – die Datumsmarken der Zeitleiste kleben darunter */
  var filterBeob = window.ResizeObserver ? new ResizeObserver(function (es) {
    es.forEach(function (e) { document.documentElement.style.setProperty("--filter-h", Math.round(e.target.getBoundingClientRect().height) + "px"); });
  }) : null;
  function beobachteFilter() {
    var fl = $(".filterleiste");
    if (filterBeob) { filterBeob.disconnect(); if (fl) filterBeob.observe(fl); }
    if (!fl) document.documentElement.style.setProperty("--filter-h", "0px");
    else if (!filterBeob) document.documentElement.style.setProperty("--filter-h", fl.offsetHeight + "px");
  }

  var letzteY = 0;
  window.addEventListener("scroll", function () {
    var fl = $(".filterleiste"); if (!fl) return;
    var y = window.scrollY, weg = !reduziert.matches && y > letzteY && y > 520 && !$(".pop:not([hidden])", fl);
    if (Math.abs(y - letzteY) < 6) return;
    fl.classList.toggle("weg", weg);
    document.documentElement.classList.toggle("filter-weg", weg);
    letzteY = y;
  }, { passive: true });

  /* Gleitende Markierung unter dem aktiven Bereich der Hauptnavigation */
  function navZeiger(sofort) {
    var nav = $(".hauptnav"); if (!nav) return;
    var z = $(".nav-zeiger", nav);
    if (!z) { z = document.createElement("span"); z.className = "nav-zeiger"; z.setAttribute("aria-hidden", "true"); nav.appendChild(z); }
    var akt = $("a.aktiv", nav);
    if (!akt || !akt.offsetWidth) { z.style.opacity = "0"; return; }
    var l = akt.offsetLeft + 12, r = nav.clientWidth - akt.offsetLeft - akt.offsetWidth + 12;
    var still = sofort || !z.classList.contains("bereit") || z.style.opacity === "0";
    if (window.Bewegung) {
      /* Gummiband: die vordere Kante eilt voraus, die hintere zieht nach */
      z.style.width = "auto"; z.style.transform = "none";
      window.Bewegung.gleite(z, l, r, still);
    } else {
      z.style.width = (akt.offsetWidth - 24) + "px";
      z.style.transform = "translateX(" + l + "px)";
    }
    z.style.opacity = "1";
    if (!z.classList.contains("bereit")) requestAnimationFrame(function () { requestAnimationFrame(function () { z.classList.add("bereit"); }); });
  }
  window.addEventListener("resize", function () { navZeiger(true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { navZeiger(true); });

  /* ---------- Dunkler Seitenkopf für Unterseiten ---------- */
  /* Kopfbilder: mit KI erzeugte Fotos (ElevenLabs), lokal gespeichert – keine Personen, keine Marken, keine externen Abrufe */
  var KOPFBILD = { termine: "termine", archiv: "termine", startups: "startups", kapital: "kapital" };
  function kopfbild(name, art) {
    var b = KOPFBILD[name];
    if (!b) return "";
    return '<div class="kb-bild' + (art ? " " + art : "") + '" data-bild="' + b + '" aria-hidden="true"><img src="assets/bilder/' + b + '.webp" alt="" decoding="async" onload="this.parentNode.classList.add(\'da\')"></div>';
  }
  function kopfband(o) {
    return '<section class="kopfband' + (o.bild ? " mit-bild" : "") + '" data-akzent="' + esc(o.akzent || "alle") + '" id="kopfband">' + (o.bild ? kopfbild(o.bild, o.bildArt) : "") + '<div class="kopfband-innen">' +
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
    var l = S.logos[s.id], farbe = SUCHFELD_FARBE[s.suchfeld] || BRANCHE_FARBE[(s.branchen || [])[0]] || "#5b6b7b";
    var cls = "logo" + (gross ? " gross" : "");
    if (l && l.datei) return '<span class="' + cls + ' bild" style="--f:' + farbe + '"><img src="assets/logos/' + esc(l.datei) + '" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'mono\');this.parentNode.classList.remove(\'bild\');this.parentNode.textContent=\'' + esc(kuerzel(s.name)) + '\'"></span>';
    return '<span class="' + cls + ' mono" style="--f:' + farbe + '" aria-hidden="true">' + esc(kuerzel(s.name)) + "</span>";
  }
  function suchfeldTag(feld) { return feld ? '<span class="sf-tag" style="--f:' + (SUCHFELD_FARBE[feld] || BRANCHE_FARBE[feld] || "#5b6b7b") + '">' + esc(feld) + "</span>" : ""; }
  function branchenTags(x, max) {
    var b = x.branchen || [], n = max || b.length;
    return b.slice(0, n).map(function (w) { return '<span class="br-tag" style="--f:' + (BRANCHE_FARBE[w] || "#5b6b7b") + '">' + esc(w) + "</span>"; }).join("") +
      (b.length > n ? '<span class="br-mehr">+' + (b.length - n) + "</span>" : "");
  }
  /* Kategorie-Leiste mit Icons, waagerecht scrollbar (wie bei Buchungsplattformen) */
  function kategorieLeiste(liste, aktiv, attr, einheit) {
    var zahl = {};
    liste.forEach(function (x) { (x.branchen || []).forEach(function (w) { zahl[w] = (zahl[w] || 0) + 1; }); });
    var knopf = function (w, label, n) {
      return '<button type="button" class="kat" ' + attr + '="' + esc(w) + '" aria-pressed="' + ((aktiv || "") === w) + '"' + (w ? ' style="--f:' + BRANCHE_FARBE[w] + '"' : "") +
        ' aria-label="' + esc((w || "Alle Branchen") + ", " + plural(n, einheit[0], einheit[1])) + '">' + brIcon(w) + '<span class="kat-name">' + esc(label) + '</span><span class="kat-zahl" aria-hidden="true">' + n + "</span></button>";
    };
    return '<div class="kat-leiste"><button type="button" class="kat-pfeil links" data-kat-scroll="-1" aria-hidden="true" tabindex="-1">' + I.links + '</button>' +
      '<div class="kat-spur" role="group" aria-label="Nach Branche filtern">' + knopf("", "Alle", liste.length) +
      BRANCHEN.filter(function (w) { return zahl[w] || aktiv === w; }).map(function (w) { return knopf(w, BR_KURZ[w] || w, zahl[w] || 0); }).join("") +
      '</div><button type="button" class="kat-pfeil rechts" data-kat-scroll="1" aria-hidden="true" tabindex="-1">' + I.rechts + "</button></div>";
  }
  function bindeKatLeiste(wurzel) {
    $$(".kat-leiste", wurzel).forEach(function (kl) {
      var spur = $(".kat-spur", kl);
      var pruefe = function () {
        kl.classList.toggle("kann-links", spur.scrollLeft > 4);
        kl.classList.toggle("kann-rechts", spur.scrollLeft + spur.clientWidth < spur.scrollWidth - 4);
      };
      spur.addEventListener("scroll", pruefe, { passive: true });
      window.addEventListener("resize", pruefe);
      $$("[data-kat-scroll]", kl).forEach(function (b) {
        b.addEventListener("click", function () { spur.scrollBy({ left: +b.getAttribute("data-kat-scroll") * spur.clientWidth * .6, behavior: reduziert.matches ? "auto" : "smooth" }); });
      });
      var akt = $('[aria-pressed="true"]', spur);
      if (akt && akt.offsetLeft > spur.clientWidth * .7) spur.scrollLeft = akt.offsetLeft - spur.clientWidth / 2;
      pruefe();
    });
  }
  function branchenChips(liste, aktiv, attr) {
    var zahl = {};
    liste.forEach(function (x) { (x.branchen || []).forEach(function (w) { zahl[w] = (zahl[w] || 0) + 1; }); });
    return '<div class="branchen-chips" role="group" aria-label="Nach Branche filtern">' +
      '<button type="button" ' + attr + '="" aria-pressed="' + !aktiv + '">Alle Branchen<span>' + liste.length + "</span></button>" +
      BRANCHEN.filter(function (w) { return zahl[w] || aktiv === w; }).map(function (w) {
        return '<button type="button" ' + attr + '="' + esc(w) + '" aria-pressed="' + (aktiv === w) + '" style="--f:' + BRANCHE_FARBE[w] + '"><i></i>' + esc(w) + "<span>" + (zahl[w] || 0) + "</span></button>";
      }).join("") + "</div>";
  }

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
  document.addEventListener("pointerover", function (ev) {
    if (ev.pointerType && ev.pointerType !== "mouse") return;
    var t = ev.target.closest && ev.target.closest("[data-tip-deal]");
    if (!t) return;
    var id = t.getAttribute("data-tip-deal"), r = S.runden.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    var b = t.getBoundingClientRect();
    tooltipDeal(r, { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.height / 2 + 4 });
  });
  document.addEventListener("pointerout", function (ev) {
    var d = ev.target.closest && ev.target.closest("[data-tip-deal]");
    if (d && !(ev.relatedTarget && d.contains(ev.relatedTarget))) tooltip(null);
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
      '<div class="held-visier"><div class="bw-gehaeuse visier-tafel"><div class="visier-kopf"><h2><span class="vt-led" aria-hidden="true"></span>Als Nächstes</h2><a href="#termine">Alle ' + aktiv.length + " Termine</a></div>" +
      (window.Bewegung ? '<div id="visier"></div>' : '<ol class="visier" id="visier"></ol>') + "</div></div>" +
      "</div></section>";

    if (!store.get("radar-hilfe-aus", false)) {
      h += '<div class="hilfe-hinweis" id="hilfe-hinweis"><div class="breite"><p><strong>Neu hier?</strong> Jeder Punkt im Radar ist eine Veranstaltung – Richtung und Abstand zeigen, wo sie von Regensburg aus liegt. Antippen öffnet alle Angaben.</p>' +
        '<button type="button" class="knopf leise klein" data-hilfe>So funktioniert die Seite</button><button type="button" class="knopf leise klein" id="hinweis-aus">Ausblenden</button></div></div>';
    }

    h += '<div class="breite">' + bentoHtml(aktiv) + "</div>";

    $("#ansicht").innerHTML = h;

    var radar = new Radar($("#radar-held"), {
      tisch: true,
      oeffnen: function (id) { oeffnePanel("event", id, heldListe().map(function (e) { return e.id; })); },
      hover: function (id) { $$("#visier button").forEach(function (b) { b.classList.toggle("fokus", b.getAttribute("data-oeffne") === id); }); },
      tooltip: tooltip
    });
    S.radare.push(radar);
    S.heldRadar = radar;
    /* Fallblatt-Anzeige wie auf einer Abfahrtstafel: jede Zeile öffnet den Termin */
    S.tafel = window.Bewegung ? new window.Bewegung.Tafel($("#visier"), {
      zeilen: 6, element: "button",
      spalten: [{ k: "d", n: 5 }, { k: "n", rest: true, min: 8 }, { k: "p", n: 1, klasse: function (ch) { return ch !== " " ? "bw-p-" + ch : ""; } }],
      titel: { d: "Datum", n: "Termin", p: "Prio" },
      hover: function (d, an) { if (S.heldRadar && d.attr) S.heldRadar.fokus(an ? d.attr["data-oeffne"] : null); }
    }) : null;
    heldAktualisieren(true);

    bindeBento();

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

  /* ---------- Übersicht als Kachel-Raster ---------- */
  function montag(s) { var d = dt(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); }
  function bentoHtml(aktiv) {
    var h = '<div class="bento">';
    // Diese Woche
    var tage = [];
    for (var i = 0; i < 7; i++) {
      var s = addTage(S.heute, i);
      tage.push({ s: s, l: aktiv.filter(function (e) { return e.start <= s && e.ende >= s; }) });
    }
    var woche = aktiv.filter(function (e) { return e.start <= addTage(S.heute, 6); });
    var maxT = Math.max.apply(null, tage.map(function (t) { return t.l.length; }).concat([1]));
    h += '<section class="kachel k4 k-woche" aria-labelledby="kw-titel"><div class="k-kopf"><h2 id="kw-titel">Nächste 7 Tage</h2><a href="#termine" class="k-link">Alle Termine' + I.rechts + "</a></div>" +
      '<p class="k-zahl">' + woche.length + "<small>" + (woche.length === 1 ? "Termin" : "Termine") + "</small></p>" +
      '<div class="k-tage">' + tage.map(function (t, i) {
        var d = dt(t.s), a = t.l.filter(function (e) { return e.prioritaet === "A"; }).length;
        return '<div class="k-tag' + (i === 0 ? " heute" : "") + '" title="' + esc(langDatum(t.s) + ": " + plural(t.l.length, "Termin", "Termine")) + '"><span class="k-saeule"><i style="height:' + (t.l.length / maxT * 100).toFixed(0) + '%"' + (a ? ' class="mit-a"' : "") + "></i></span><b>" + t.l.length + "</b><span>" + (i === 0 ? "heute" : WTAG[d.getDay()]) + "</span></div>";
      }).join("") + "</div></section>";
    // Fristen
    var fristen = S.events.filter(function (e) { return e.anmeldeschluss && e.anmeldeschluss >= S.heute; })
      .sort(function (x, y) { return x.anmeldeschluss < y.anmeldeschluss ? -1 : 1; }).slice(0, 3);
    h += '<section class="kachel k4 k-fristen" aria-labelledby="kf-titel"><div class="k-kopf"><h2 id="kf-titel">Fristen</h2></div>' + (fristen.length ? '<ul class="k-liste">' + fristen.map(function (e) {
      var n = tageBis(e.anmeldeschluss);
      return '<li><button type="button" data-oeffne="' + esc(e.id) + '"><span class="countdown' + (n <= 14 ? " dringend" : "") + '"><b>' + n + "</b><small>" + (n === 1 ? "Tag" : "Tage") + '</small></span><span><span class="kl-name">' + esc(kurzname(e)) + '</span><span class="kl-sub">' + esc(e.frist_art || "Anmeldeschluss") + " bis " + esc(deKurz(e.anmeldeschluss)) + "</span></span></button></li>";
    }).join("") + "</ul>" : '<p class="k-leer">Aktuell sind keine Fristen bekannt. Neue Anmeldeschlüsse erscheinen hier, sobald die Veranstalter sie veröffentlichen.</p>') + "</section>";
    // Quick Wins
    var quick = S.startups.filter(function (s) { return s.quickwin; }).sort(function (x, y) { return y.relevanz - x.relevanz || x.aufwand - y.aufwand; });
    h += '<section class="kachel k4 k-quick" aria-labelledby="kq-titel"><div class="k-kopf"><h2 id="kq-titel">Start-ups mit schnellem Nutzen</h2><a href="#startups" class="k-link">Alle ' + S.startups.length + I.rechts + "</a></div>" +
      '<div class="k-logos">' + quick.slice(0, 7).map(function (s) { return '<button type="button" data-oeffne-su="' + esc(s.id) + '" aria-label="' + esc(s.name) + '">' + logo(s) + "</button>"; }).join("") + (quick.length > 7 ? '<span class="k-mehr">+' + (quick.length - 7) + "</span>" : "") + "</div>" +
      '<ul class="k-liste kompakt">' + quick.slice(0, 3).map(function (s) {
        return '<li><button type="button" data-oeffne-su="' + esc(s.id) + '"><span><span class="kl-name">' + esc(s.name) + '</span><span class="kl-sub">' + esc(s.loesung) + "</span></span></button></li>";
      }).join("") + "</ul></section>";
    // Jahresband: Termine je Woche über 18 Monate
    var ab = montag(S.heute), wochen = [];
    for (var w = 0; w < 78; w++) wochen.push({ s: addTage(ab, w * 7), A: 0, B: 0, C: 0 });
    aktiv.forEach(function (e) {
      var k = Math.floor((dt(montag(e.start < S.heute ? S.heute : e.start)) - dt(ab)) / (7 * 86400000));
      if (k >= 0 && k < wochen.length) wochen[k][e.prioritaet]++;
    });
    var maxW = Math.max.apply(null, wochen.map(function (x) { return x.A + x.B + x.C; }).concat([1]));
    h += '<section class="kachel k12 k-jahr" aria-labelledby="kj-titel"><div class="k-kopf"><h2 id="kj-titel">Die nächsten 18 Monate</h2><p class="k-text">Jede Säule ist eine Woche. Antippen zeigt die Termine des Monats.</p></div>' +
      '<div class="jb" role="group" aria-label="Termine je Woche">' + wochen.map(function (x, i) {
        var n = x.A + x.B + x.C, d = dt(x.s), neuM = i === 0 || d.getDate() <= 7;
        var hh = function (v) { return (v / maxW * 100).toFixed(1) + "%"; };
        return '<button type="button" class="jb-w' + (neuM ? " neu-m" : "") + '" data-jb="' + x.s.slice(0, 7) + '" aria-label="' + esc("Woche ab " + langDatum(x.s, true) + ": " + plural(n, "Termin", "Termine") + (x.A ? ", davon " + x.A + " mit Priorität A" : "")) + '" style="--v:' + (i * 12) + 'ms">' +
          '<span class="jb-s"><i class="c" style="height:' + hh(x.C) + '"></i><i class="b" style="height:' + hh(x.B) + '"></i><i class="a" style="height:' + hh(x.A) + '"></i></span>' +
          (neuM ? '<span class="jb-m">' + MON_KURZ[d.getMonth()] + (d.getMonth() === 0 || i === 0 ? " " + String(d.getFullYear()).slice(2) : "") + "</span>" : "") + "</button>";
      }).join("") + '</div><div class="jb-leg"><span><i class="a"></i>A</span><span><i class="b"></i>B</span><span><i class="c"></i>C</span><button type="button" class="k-link" data-jb-zeit>Als Zeitstrahl ansehen' + I.rechts + "</button></div></section>";
    // Kapital
    var deals = S.runden.slice(0, 3);
    h += '<section class="kachel k6 k-kapital" aria-labelledby="kk-titel"><div class="k-kopf"><h2 id="kk-titel">Neu bei Finanzierungen</h2><a href="#kapital" class="k-link">Alle Deals' + I.rechts + "</a></div>" +
      '<ul class="k-liste">' + deals.map(function (r) {
        return '<li><button type="button" data-oeffne-deal="' + esc(r.id) + '"><span class="kk-betrag">' + esc(r.betrag.replace(/^über /, "> ")) + '</span><span><span class="kl-name">' + esc(r.unternehmen) + '</span><span class="kl-sub">' + esc(r.runde) + ", " + esc(monatJahr(r.datum)) + " · " + esc(r.thema) + "</span></span></button></li>";
      }).join("") + "</ul></section>";
    // Neu im Stand
    h += '<section class="kachel k6 k-neu" aria-labelledby="kn-titel"><div class="k-kopf"><h2 id="kn-titel">Neu im Stand vom ' + esc(deKurz(S.meta.stand)) + '</h2></div><ul class="aenderungen" tabindex="0" aria-label="Änderungen im aktuellen Stand">' +
      (S.meta.aenderungen || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>";
    h += "</div>";
    h += dranbleibenHtml();
    h += '<details class="prio-details">' + '<summary><span>So wird priorisiert</span><small>Vier Kriterien, gewichteter Gesamtscore, Schwellen für A, B und C</small></summary>' + priorisierungHtml(aktiv) + "</details>";
    return h;
  }
  function bindeBento() {
    $$("[data-jb]").forEach(function (b) {
      b.addEventListener("click", function () { S.t = neuerFilter("liste"); S.t.monat = b.getAttribute("data-jb"); location.hash = "#termine"; });
    });
    var z = $("[data-jb-zeit]");
    if (z) z.addEventListener("click", function () { S.t.ansicht = "zeitstrahl"; location.hash = "#termine"; });
    var jb = $(".jb");
    if (jb && !reduziert.matches && window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { jb.classList.add("an"); io.disconnect(); } }, { threshold: .3 });
      io.observe(jb);
    } else if (jb) jb.classList.add("an");
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
    if (S.tafel && $("#visier")) {
      var zeilen = visier.map(function (e) {
        var d0 = dt(e.start < S.heute ? S.heute : e.start);
        return { d: laeuft(e) ? "läuft" : pad(d0.getDate()) + "." + pad(d0.getMonth() + 1), n: kurzname(e), p: e.prioritaet,
          label: kurzname(e) + ", " + relativ(e) + ", " + (e.online ? "online" : e.ort) + ", Priorität " + e.prioritaet,
          attr: { "data-oeffne": e.id, "data-kontext": "held" } };
      });
      if (!zeilen.length) zeilen = [{ d: "", n: "Keine Termine", p: "", label: "Keine Termine in dieser Auswahl" }];
      S.tafel.zeige(zeilen);
    } else $("#visier").innerHTML = visier.length ? visier.map(function (e) {
      var d0 = dt(e.start < S.heute ? S.heute : e.start);
      return '<li><button type="button" data-oeffne="' + esc(e.id) + '" data-kontext="held"><span class="v-datum' + (laeuft(e) ? " live" : "") + '"><b>' + d0.getDate() + "</b>" + MON_KURZ[d0.getMonth()] + "</span>" +
        '<span><span class="v-name">' + esc(e.name) + '</span><span class="v-ort">' + esc(relativ(e)) + " · " + esc(e.online ? "Online" : e.ort) + (entfernung(e) && !e.online && entfernung(e) !== "in Regensburg" ? ", " + esc(entfernung(e)) : "") + "</span></span>" +
        schild(e.prioritaet, e.gesamt) + "</button></li>";
    }).join("") : '<li class="v-leer">Keine Termine in dieser Auswahl.</li>';
    if (!S.tafel) $$("#visier button").forEach(function (b) {
      var id = b.getAttribute("data-oeffne");
      b.addEventListener("mouseenter", function () { S.heldRadar.fokus(id); });
      b.addEventListener("mouseleave", function () { S.heldRadar.fokus(null); });
      b.addEventListener("focus", function () { S.heldRadar.fokus(id); });
      b.addEventListener("blur", function () { S.heldRadar.fokus(null); });
    });

    var online = liste.filter(function (e) { return e.online; });
    var ohneOrt = liste.filter(function (e) { return !e.online && !e.geo; });
    $("#held-legende").innerHTML = '<button type="button" class="ansicht-schalter" id="draufsicht" aria-pressed="' + (S.draufsicht ? "true" : "false") + '">Draufsicht</button>' + radarLegende(online, ohneOrt);
    $("#radar-held").classList.toggle("flach", !!S.draufsicht);
    $("#draufsicht").addEventListener("click", function () {
      S.draufsicht = !S.draufsicht;
      this.setAttribute("aria-pressed", S.draufsicht ? "true" : "false");
      $("#radar-held").classList.toggle("flach", S.draufsicht);
    });
    S.heldRadar.setze(liste, false);
  }
  function onlineListe(online) {
    if (!online.length) return "";
    var chips = online.map(function (e) { return '<button type="button" class="online-chip" data-oeffne="' + esc(e.id) + '">' + I.welt.replace("<svg", '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"') + esc(kurzname(e)) + "</button>"; }).join("");
    return '<details class="online-liste"><summary>' + I.welt.replace("<svg", '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"') +
      plural(online.length, "Online-Termin", "Online-Termine") + " – nicht auf der Karte</summary><div class=\"online-chips\">" + chips + "</div></details>";
  }
  function radarLegende(online, ohneOrt) {
    return '<span><i class="lg-punkt lg-A"></i>A</span><span><i class="lg-punkt lg-B"></i>B</span><span><i class="lg-punkt lg-C"></i>C</span>' +
      '<span><i class="lg-punkt lg-hohl"></i>Datum geschätzt</span><span><i class="lg-ring"></i>100 km um Regensburg</span>' +
      onlineListe(online) +
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
        return '<a class="vt-zeile" href="#' + r + '" style="color:inherit;text-decoration:none"><span class="vt-name">' + esc(r === "eu" ? "Europa" : RUBRIK[r]) + '</span><span class="vt-bar" title="A: ' + t.A + ", B: " + t.B + ", C: " + t.C + '"><i class="a" style="width:' + w(t.A) + '"></i><i class="b" style="width:' + w(t.B) + '"></i><i class="c" style="width:' + w(t.C) + '"></i></span><span class="vt-zahl">' + t.n + "</span></a>";
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
    var kappe = opt.kappe && hoehe > opt.kappe + 120 ? opt.kappe : 0;
    ziel.innerHTML = '<div class="zs' + (kappe ? " gekappt" : "") + '"' + (kappe ? ' style="--kappe:' + kappe + 'px"' : "") + '><div class="zs-scroll" id="zs-scroll-' + (ziel.id || "x") + '" tabindex="0" aria-label="Zeitstrahl, mit Pfeiltasten oder Wischen blättern"' + (kappe ? ' style="max-height:' + kappe + 'px"' : "") + '><div class="zs-flaeche" style="width:' + monate * mw + "px;height:" + hoehe + 'px">' + monatsHtml +
      (heuteX != null ? '<div class="zs-heute" style="left:' + heuteX.toFixed(1) + 'px"></div>' : "") + h + "</div></div>" +
      (kappe ? '<div class="zs-blende" aria-hidden="true"></div><button type="button" class="zs-mehr" aria-expanded="false" aria-controls="zs-scroll-' + (ziel.id || "x") + '">' + I.unten + "<span>Alle " + items.length + " Termine aufklappen</span></button>" : "") +
      '<div class="zs-steuer"><button type="button" class="icon-knopf" data-zs="-1" aria-label="Zurückblättern">' + I.links + '</button><button type="button" class="icon-knopf" data-zs="1" aria-label="Weiterblättern">' + I.rechts + "</button></div>" +
      '<div class="zs-legende"><span><i class="zl-bar" style="background:var(--signal)"></i>Priorität A</span><span><i class="zl-bar" style="background:var(--solar)"></i>B</span><span><i class="zl-bar" style="background:var(--c-grau)"></i>C</span><span><i class="zl-bar" style="border:2px dashed var(--c-grau)"></i>Datum geschätzt</span>' + (items.length ? "" : "<span>Keine Termine in dieser Auswahl.</span>") + "</div></div>";
    var zs = $(".zs", ziel), sc = $(".zs-scroll", ziel);
    if (kappe) $(".zs-mehr", ziel).addEventListener("click", function () {
      var auf = this.getAttribute("aria-expanded") !== "true";
      this.setAttribute("aria-expanded", auf ? "true" : "false");
      $("span", this).textContent = auf ? "Wieder einklappen" : "Alle " + items.length + " Termine aufklappen";
      sc.style.maxHeight = (auf ? hoehe : kappe) + "px";
      zs.classList.toggle("offen", auf);
      if (!auf) zs.scrollIntoView({ block: "nearest", behavior: reduziert.matches ? "auto" : "smooth" });
    });
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
      if (f.branche && (e.branchen || []).indexOf(f.branche) < 0) return false;
      if (f.monat && !(e.start.slice(0, 7) <= f.monat && e.ende.slice(0, 7) >= f.monat)) return false;
      if (f.merk && !merk.has(e.id)) return false;
      if (f.best && e.status !== "bestätigt") return false;
      if (woerter.length) {
        var t = [e.name, e.format, e.kategorie, e.veranstalter, e.ort, e.region, e.fokus, e.zielgruppe, e.begruendung, RUBRIK[e.rubrik], (e.branchen || []).join(" ")].join(" ").toLowerCase();
        if (woerter.some(function (w) { return t.indexOf(w) < 0; })) return false;
      }
      return true;
    });
  }
  function aktiveFilter(f) {
    return (f.prio.A && f.prio.B && f.prio.C ? 0 : 1) + (f.kat ? 1 : 0) + (f.branche ? 1 : 0) + (f.monat ? 1 : 0) + (f.merk ? 1 : 0) + (f.best ? 1 : 0);
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
    if (f.branche && !basis.some(function (e) { return (e.branchen || []).indexOf(f.branche) >= 0; })) f.branche = "";
    var ansichten = art === "archiv" ? [["liste", "Liste", I.liste], ["kalender", "Kalender", I.kal]]
      : [["liste", "Liste", I.liste], ["zeitstrahl", "Zeitstrahl", I.zeit], ["kalender", "Kalender", I.kal], ["radar", "Radar", I.radar]];
    if (!ansichten.some(function (a) { return a[0] === f.ansicht; })) f.ansicht = "liste";

    var h;
    if (art === "archiv") {
      h = kopfband({ akzent: "archiv", bild: "archiv", bildArt: "vergangen", titel: "Archiv", text: "Vergangene Veranstaltungen zum Nachschlagen und für die Planung im nächsten Jahr. Termine wandern nach ihrem letzten Tag automatisch hierher.",
        unten: '<p class="kb-link"><a href="#termine">Zu den kommenden Terminen</a></p>' });
    } else {
      h = kopfband({ akzent: f.rubrik || "alle", bild: "termine", titel: "Termine", textId: "reiter-text", text: REITER_TEXT[f.rubrik],
        reiter: '<div class="reiter" role="tablist" aria-label="Rubrik">' + REITER.map(function (r) {
          return '<button type="button" role="tab" data-rubrik="' + r[0] + '" aria-selected="' + (f.rubrik === r[0]) + '">' + esc(r[1]) + "<span>" + umfang("termine", r[0]).length + "</span></button>";
        }).join("") + "</div>",
        unten: '<p class="kb-link"><a href="#archiv">Archiv vergangener Termine</a> · <a href="#quellen">Quellen der Recherche</a></p>',
        rechts: '<div class="kb-radar"><div class="radar" id="radar-kopf"></div></div>' });
    }

    h += '<div class="filterleiste" role="search"><div class="breite fl-innen">' +
      '<div id="f-branchen">' + kategorieLeiste(basis, f.branche, "data-f-branche", ["Termin", "Termine"]) + "</div>" +
      '<div class="fl-werkzeug"><label class="suchfeld">' + I.suche + '<span class="vh">In der Liste suchen</span><input class="feld" type="search" id="f-q" placeholder="Suchen: Thema, Ort, Veranstalter" value="' + esc(f.q) + '"></label>' +
      prioWahl(f.prio, "liste") +
      '<div class="pop-anker"><button type="button" class="knopf leise filter-knopf" id="filter-knopf" data-pop="filter-pop" aria-expanded="false" aria-controls="filter-pop">' + I.filter + 'Filter<span class="zahl-badge" id="filter-zahl" hidden></span></button>' +
      '<div class="pop rechts pop-filter" id="filter-pop" hidden role="group" aria-label="Weitere Filter"><p class="pop-titel">Weitere Filter</p>' +
      '<label class="pop-feld"><span>Format</span><select class="feld" id="f-kat"><option value="">Alle Formate</option>' + kats.map(function (k) { return "<option" + (k === f.kat ? " selected" : "") + ">" + esc(k) + "</option>"; }).join("") + "</select></label>" +
      '<label class="pop-feld"><span>Monat</span><select class="feld" id="f-monat"><option value="">Alle Monate</option>' + monate.map(function (m) { return '<option value="' + m + '"' + (m === f.monat ? " selected" : "") + ">" + esc(monatLabel(m)) + "</option>"; }).join("") + "</select></label>" +
      '<label class="schalter"><input type="checkbox" id="f-merk"' + (f.merk ? " checked" : "") + "> Nur Merkliste</label>" +
      '<label class="schalter"><input type="checkbox" id="f-best"' + (f.best ? " checked" : "") + "> Nur bestätigte Termine</label>" +
      '<div class="pop-fuss"><button type="button" class="knopf leise klein" id="f-reset" hidden>Zurücksetzen</button><button type="button" class="knopf klein" data-pop-zu>Fertig</button></div></div></div>' +
      "</div></div></div>";

    h += '<div class="breite"><div class="aktiv-filter" id="aktiv-filter" aria-live="polite"></div><div class="ergebnis-kopf"><span class="anzahl" id="anzahl"></span>' +
      '<div class="segment" role="group" aria-label="Ansicht">' + ansichten.map(function (a) {
        return '<button type="button" data-ansicht="' + a[0] + '" aria-pressed="' + (f.ansicht === a[0]) + '">' + a[2] + a[1] + "</button>";
      }).join("") + "</div>" +
      downloadsHtml("liste", true) + "</div>" +
      '<div class="liste-layout"><div id="ergebnis"></div><aside class="seiten-spalte" id="seiten-spalte" aria-label="Monatskalender der Auswahl"></aside></div></div>';
    $("#ansicht").innerHTML = h;
    if (art === "termine") kopfRadar(umfang("termine"));

    var q = $("#f-q"), tq;
    q.addEventListener("input", function () { clearTimeout(tq); tq = setTimeout(function () { f.q = q.value; aktualisiereListe(art, true); }, 120); });
    bindePrioWahl(f.prio, "liste", function () { aktualisiereListe(art, true); });
    $("#f-kat").addEventListener("change", function () { f.kat = this.value; aktualisiereListe(art, true); });
    bindeBranchenChips("data-f-branche", function (w) { f.branche = w; aktualisiereListe(art, true); });
    $("#f-monat").addEventListener("change", function () { f.monat = this.value; if (this.value) f.kal = this.value; aktualisiereListe(art, true); });
    $("#f-merk").addEventListener("change", function () { f.merk = this.checked; aktualisiereListe(art, true); });
    $("#f-best").addEventListener("change", function () { f.best = this.checked; aktualisiereListe(art, true); });
    $("#f-reset").addEventListener("click", function () {
      var r = f.rubrik, a = f.ansicht;
      var neu = neuerFilter(a); neu.rubrik = r;
      if (art === "archiv") S.a = neu; else S.t = neu;
      listenSeite(art);
    });
    bindeKatLeiste($(".filterleiste"));
    $("#aktiv-filter").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-weg]"); if (!b) return;
      var w = b.getAttribute("data-weg");
      if (w === "alle") { $("#f-reset").click(); return; }
      if (w === "q") { f.q = ""; $("#f-q").value = ""; }
      if (w === "prio") { f.prio.A = f.prio.B = f.prio.C = true; $$("[data-prio-liste]").forEach(function (x) { x.setAttribute("aria-pressed", "true"); }); }
      if (w === "branche") { f.branche = ""; $$("[data-f-branche]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-f-branche") === ""); }); }
      if (w === "kat") { f.kat = ""; $("#f-kat").value = ""; }
      if (w === "monat") { f.monat = ""; $("#f-monat").value = ""; }
      if (w === "merk") { f.merk = false; $("#f-merk").checked = false; }
      if (w === "best") { f.best = false; $("#f-best").checked = false; }
      aktualisiereListe(art, true);
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
    var id = "dl-pop-" + quelle;
    return '<div class="pop-anker downloads"><button type="button" class="knopf leise" data-pop="' + id + '" aria-expanded="false" aria-controls="' + id + '">' + I.export + "Exportieren</button>" +
      '<div class="pop pop-menue rechts" id="' + id + '" hidden><p class="pop-titel">Aktuelle Auswahl herunterladen</p>' +
      '<button type="button" class="pop-eintrag" data-dl="xlsx" data-quelle="' + quelle + '">' + I.excel + "<span><b>Excel</b><small>Tabelle mit allen Angaben</small></span></button>" +
      (mitIcs ? '<button type="button" class="pop-eintrag" data-dl="ics" data-quelle="' + quelle + '">' + I.kal + "<span><b>Kalenderdatei</b><small>Für Outlook und andere Kalender</small></span></button>" : "") +
      '<button type="button" class="pop-eintrag" data-dl="csv" data-quelle="' + quelle + '">' + I.datei + "<span><b>CSV</b><small>Zum Weiterverarbeiten</small></span></button>" +
      '<button type="button" class="pop-eintrag" data-dl="druck" data-quelle="' + quelle + '">' + I.druck + "<span><b>Drucken</b><small>Übersicht als Liste</small></span></button></div></div>";
  }

  /* Trefferzahl: rollt beim Filtern wie ein Zählwerk */
  function anzahlSetzen(el, n, ein, mehr, gesamt) {
    if (!el) return;
    var z = $(".anz-n", el);
    if (!z) { el.innerHTML = '<span class="anz-n"></span> <span class="anz-w"></span><small class="anz-von"></small>'; z = $(".anz-n", el); }
    if (window.Bewegung) window.Bewegung.zahl(z, n); else z.textContent = n;
    $(".anz-w", el).textContent = n === 1 ? ein : mehr;
    var v = $(".anz-von", el); v.textContent = gesamt != null && n !== gesamt ? "von " + gesamt : ""; v.hidden = gesamt == null || n === gesamt;
  }
  function aktualisiereListe(art, animiert) {
    var f = filterVon(art);
    var liste = filtere(umfang(art), f);
    S.liste = liste;
    var titel = art === "archiv" ? "Archiv" : "Termine – " + (f.rubrik ? (f.rubrik === "eu" ? "Europa" : RUBRIK[f.rubrik]) : "alle Rubriken");
    S.druck = { art: "events", liste: liste, titel: titel };
    anzahlSetzen($("#anzahl"), liste.length, "Termin", "Termine", umfang(art).length);
    var nf = aktiveFilter(f), npop = (f.kat ? 1 : 0) + (f.monat ? 1 : 0) + (f.merk ? 1 : 0) + (f.best ? 1 : 0);
    $("#filter-zahl").textContent = npop || "";
    $("#filter-zahl").hidden = !npop;
    $("#f-reset").hidden = !(nf || f.q.trim());
    $("#aktiv-filter").innerHTML = aktivFilterHtml(f);
    var ziel = $("#ergebnis");
    ansichtRadarWeg(); tooltip(null);
    var mitSeite = f.ansicht === "liste" && liste.length > 0;
    $(".liste-layout").classList.toggle("mit-seite", mitSeite);
    if (mitSeite) seitenKalender($("#seiten-spalte"), liste, art); else $("#seiten-spalte").innerHTML = "";
    if (S.leit) S.leit.neu(null);
    if (f.ansicht === "zeitstrahl") return zeitstrahl(ziel, liste, { monate: 18 });
    if (f.ansicht === "kalender") return kalender(ziel, liste, art);
    if (f.ansicht === "radar") return radarAnsicht(ziel, liste);
    var neuZeichnen = function () { ziel.innerHTML = listeHtml(liste, art, f); };
    if (animiert) flip(ziel, neuZeichnen); else neuZeichnen();
    if (window.Bewegung) {
      if (!S.leit) S.leit = new window.Bewegung.Leitlinie({ gruppe: ".tag-gruppe", zahl: ".td-tag", kopf: .42 });
      S.leit.neu(ziel);
    }
  }

  /* Seitenspalte: kleiner Monatskalender – Punkte zeigen Tage mit Terminen, Antippen springt zum Tag in der Liste */
  function seitenKalender(ziel, liste, art, ym) {
    var monate = uniq(liste.map(function (e) { return (art !== "archiv" && e.start < S.heute ? S.heute : e.start).slice(0, 7); })).sort();
    if (art === "archiv") monate.reverse();
    ym = ym || (S.skMonat && monate.indexOf(S.skMonat) >= 0 ? S.skMonat : monate[0]);
    S.skMonat = ym;
    var idx = monate.indexOf(ym), p = ym.split("-"), y = +p[0], m = +p[1];
    var tage = new Date(y, m, 0).getDate(), versatz = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    var proTag = {};
    liste.forEach(function (e) {
      var k = art !== "archiv" && e.start < S.heute ? S.heute : e.start;
      if (k.slice(0, 7) !== ym) return;
      var r = { A: 3, B: 2, C: 1 }[e.prioritaet];
      proTag[k] = Math.max(proTag[k] || 0, r);
    });
    var anz = { A: 0, B: 0, C: 0 };
    liste.forEach(function (e) { anz[e.prioritaet]++; });
    var h = '<div class="sk-karte"><div class="sk-kopf"><button type="button" class="icon-knopf" data-sk="' + (monate[idx - 1] || "") + '"' + (idx <= 0 ? " disabled" : "") + ' aria-label="Vorheriger Monat">' + I.links + "</button>" +
      "<b>" + esc(monatLabel(ym)) + '</b><button type="button" class="icon-knopf" data-sk="' + (monate[idx + 1] || "") + '"' + (idx >= monate.length - 1 ? " disabled" : "") + ' aria-label="Nächster Monat">' + I.rechts + "</button></div>" +
      '<div class="sk-raster">' + ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return '<span class="sk-wt" aria-hidden="true">' + w + "</span>"; }).join("");
    for (var i = 0; i < versatz; i++) h += "<span></span>";
    for (var t = 1; t <= tage; t++) {
      var s = y + "-" + pad(m) + "-" + pad(t), r = proTag[s];
      h += r ? '<button type="button" class="sk-tag hat p' + r + (s === S.heute ? " heute" : "") + '" data-sk-tag="' + s + '" aria-label="' + esc(langDatum(s)) + ', zu den Terminen springen">' + t + "</button>"
        : '<span class="sk-tag' + (s === S.heute ? " heute" : "") + '">' + t + "</span>";
    }
    h += "</div></div>";
    var n = liste.length || 1;
    h += '<div class="sk-karte sk-mix"><p class="sk-titel">In dieser Auswahl</p><p class="sk-zahl">' + plural(liste.length, "Termin", "Termine") + "</p>" +
      '<div class="sk-balken" aria-hidden="true"><i class="a" style="width:' + (anz.A / n * 100) + '%"></i><i class="b" style="width:' + (anz.B / n * 100) + '%"></i><i class="c" style="width:' + (anz.C / n * 100) + '%"></i></div>' +
      '<ul class="sk-leg"><li><i class="a"></i>Priorität A<b>' + anz.A + "</b></li><li><i class=\"b\"></i>B<b>" + anz.B + '</b></li><li><i class="c"></i>C<b>' + anz.C + "</b></li></ul></div>";
    ziel.innerHTML = h;
    $$("[data-sk]", ziel).forEach(function (b) { b.addEventListener("click", function () { var z = b.getAttribute("data-sk"); if (z) seitenKalender(ziel, liste, art, z); }); });
    $$("[data-sk-tag]", ziel).forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-sk-tag");
        var g = $('[data-id="tag-' + s + '"]') || (s === S.heute ? $('[data-id="tag-laeuft"]') : null);
        if (!g) return;
        g.scrollIntoView({ block: "start", behavior: reduziert.matches ? "auto" : "smooth" });
        g.classList.remove("blitz"); void g.offsetWidth; g.classList.add("blitz");
      });
    });
  }
  function aktivFilterHtml(f) {
    var c = [];
    var chip = function (weg, text) { return '<button type="button" class="af-chip" data-weg="' + weg + '" aria-label="' + esc(text) + ' entfernen"><span>' + esc(text) + "</span>" + I.x + "</button>"; };
    if (f.q.trim()) c.push(chip("q", "Suche: „" + f.q.trim() + "“"));
    if (!(f.prio.A && f.prio.B && f.prio.C)) c.push(chip("prio", "Priorität " + ["A", "B", "C"].filter(function (p) { return f.prio[p]; }).join(", ")));
    if (f.branche) c.push(chip("branche", f.branche));
    if (f.kat) c.push(chip("kat", f.kat));
    if (f.monat) c.push(chip("monat", monatLabel(f.monat)));
    if (f.merk) c.push(chip("merk", "Nur Merkliste"));
    if (f.best) c.push(chip("best", "Nur bestätigte"));
    if (c.length > 1) c.push('<button type="button" class="af-alle" data-weg="alle">Alle zurücksetzen</button>');
    return c.join("");
  }
  function listeHtml(liste, art, f) {
    if (!liste.length) {
      return '<div class="leer"><h2>' + (art === "archiv" && !umfang("archiv").length ? "Noch nichts im Archiv" : "Kein Termin passt zu den Filtern") + "</h2><p>" +
        (art === "archiv" && !umfang("archiv").length ? "Vergangene Veranstaltungen landen hier automatisch nach ihrem letzten Tag." : "Suchbegriff kürzen oder Filter zurücksetzen.") + "</p>" +
        (art === "archiv" && !umfang("archiv").length ? '<a class="knopf leise" href="#termine">Kommende Termine ansehen</a>' : "") + "</div>";
    }
    /* Zeitleiste: Monat, darin Tage mit großer Datumsmarke links und Karten rechts */
    var gruppen = function (l) {
      var h = "", aktM = null, monat = [];
      var tagHtml = function (tag, evs) {
        var lauf = tag === "laeuft", d = lauf ? null : dt(tag), n = lauf ? 0 : tageBis(tag);
        var rel = lauf ? "" : art === "archiv" ? "" : n === 0 ? "heute" : n === 1 ? "morgen" : n < 7 ? "in " + n + " Tagen" : "";
        return '<div class="tag-gruppe' + (lauf ? " laeuft" : "") + '" data-id="tag-' + esc(tag) + '">' +
          '<div class="tag-datum" aria-hidden="true">' + (lauf ? '<span class="td-live"></span><span class="td-wt">läuft</span>'
            : '<span class="td-wt">' + WTAG[d.getDay()] + '</span><span class="td-tag">' + d.getDate() + "</span>" + (rel ? '<span class="td-rel">' + rel + "</span>" : "")) + "</div>" +
          '<h3 class="vh">' + (lauf ? "Läuft gerade" : esc(langDatum(tag))) + '</h3><ul class="ev-liste">' + evs.map(zeileHtml).join("") + "</ul></div>";
      };
      var flush = function () {
        if (!monat.length) return;
        var tage = [], proTag = {};
        monat.forEach(function (e) {
          var k = art !== "archiv" && e.start < S.heute ? "laeuft" : e.start;
          if (!proTag[k]) { proTag[k] = []; tage.push(k); }
          proTag[k].push(e);
        });
        h += '<h2 class="monat-kopf" data-id="monat-' + esc(aktM) + '">' + esc(monatLabel(aktM)) + "<span>" + plural(monat.length, "Termin", "Termine") + "</span></h2>" +
          '<div class="zeitleiste">' + tage.map(function (t) { return tagHtml(t, proTag[t]); }).join("") + "</div>";
        monat = [];
      };
      l.forEach(function (e) {
        var m = (art !== "archiv" && e.start < S.heute ? S.heute : e.start).slice(0, 7);
        if (m !== aktM) { flush(); aktM = m; }
        monat.push(e);
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

  /* Termin als Karte: Text links, Materialbild rechts, Merken und Kalender direkt auf dem Bild */
  function motivStile() {
    if (!window.Motiv || document.getElementById("motiv-baender")) return;
    var st = document.createElement("style"); st.id = "motiv-baender"; st.textContent = window.Motiv.bandStile(); document.head.appendChild(st);
  }
  function evBildKlasse(e) {
    if (!window.Motiv) return "";
    motivStile();
    if (!S.evHaeufig) { S.evHaeufig = {}; S.events.forEach(function (x) { (x.branchen || []).forEach(function (b) { S.evHaeufig[b] = (S.evHaeufig[b] || 0) + 1; }); }); }
    return window.Motiv.bandKlasse(e.branchen, S.evHaeufig);
  }
  function dauerText(e) {
    if (e.start === e.ende) return "";
    var n = Math.round((dt(e.ende) - dt(e.start)) / 86400000) + 1;
    return n <= 31 ? n + " Tage" : "bis " + deKurz(e.ende);
  }
  function zeileHtml(e) {
    var ent = entfernung(e), dauer = dauerText(e), lauf = laeuft(e), frist = e.anmeldeschluss && e.anmeldeschluss >= S.heute ? tageBis(e.anmeldeschluss) : null;
    var ober = [esc(e.kategorie || e.format)];
    if (dauer) ober.push(esc(dauer));
    if (lauf) ober.unshift('<span class="ev-live">läuft</span>');
    var br = (e.branchen || []).slice(0, 3);
    return '<li class="ev prio-' + e.prioritaet + " rb-" + e.rubrik + (e.status === "geschätzt" ? " geschaetzt" : "") + '" data-id="' + esc(e.id) + '">' +
      '<button type="button" class="ev-knopf" data-oeffne="' + esc(e.id) + '" data-kontext="liste">' +
      '<span class="ev-text"><span class="ev-ober">' + ober.join('<i aria-hidden="true">·</i>') + "</span>" +
      '<span class="ev-titel">' + esc(e.name) + "</span>" +
      '<span class="ev-ort">' + (e.online ? I.welt : I.ort) + "<span>" + esc(e.online ? "Online" : e.ort) + (ent && !e.online && ent !== "in Regensburg" ? '<span class="ev-km">' + esc(ent) + "</span>" : "") + "</span></span>" +
      '<span class="ev-fuss">' + br.map(function (w) { return '<span class="ev-br" style="--f:' + BRANCHE_FARBE[w] + '">' + brIcon(w) + esc(BR_KURZ[w] || w) + "</span>"; }).join("") +
      ((e.branchen || []).length > 3 ? '<span class="ev-br mehr">+' + ((e.branchen || []).length - 3) + "</span>" : "") +
      (e.rubrik === "noneu" ? '<span class="ev-marke">außerhalb der EU</span>' : "") +
      (e.status === "geschätzt" ? '<span class="ev-marke schaetz" title="Aus dem Vorjahr abgeleitet – vor der Planung prüfen">Datum geschätzt</span>' : "") +
      (frist != null && frist <= 45 ? '<span class="ev-marke frist">Anmeldung noch ' + plural(frist, "Tag", "Tage") + "</span>" : "") + "</span></span>" +
      '<span class="ev-bild ' + evBildKlasse(e) + '" aria-hidden="true"></span>' +
      '<span class="ev-schild">' + schild(e.prioritaet, e.gesamt) + "</span>" +
      "</button>" +
      '<div class="ev-aktionen">' + sternKnopf(e.id, e.name) + (vorbei(e) ? "" : icsKnopf(e)) + "</div></li>";
  }

  /* Sanftes Umsortieren beim Filtern (FLIP) */
  function flip(container, aendern) {
    if (window.Bewegung) return window.Bewegung.flip(container, "data-id", aendern);
    if (reduziert.matches || !Element.prototype.animate) { aendern(); return; }
    var vorher = {};
    $$("[data-id]", container).forEach(function (el) { vorher[el.getAttribute("data-id")] = el.getBoundingClientRect(); });
    aendern();
    /* Nur was im Bild ist (oder hineingleitet), wird animiert – so bleibt es auch bei 300+ Einträgen flüssig */
    var hoehe = window.innerHeight, neuSichtbar = 0;
    var imBild = function (r) { return r && r.bottom > -80 && r.top < hoehe + 80; };
    $$("[data-id]", container).forEach(function (el) {
      var a = vorher[el.getAttribute("data-id")], b = el.getBoundingClientRect();
      if (!imBild(b) && !imBild(a)) return;
      if (a) {
        var dx = a.left - b.left, dy = Math.max(-hoehe, Math.min(hoehe, a.top - b.top));
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.2,.75,.2,1)" });
      } else if (imBild(b)) {
        el.animate([{ opacity: 0, transform: "translateY(10px) scale(.985)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: Math.min(neuSichtbar++ * 28, 280), easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" });
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
      "<h2>" + esc(monatLabel(ym)) + " <span>" + plural(imMonat.length, "Termin", "Termine") + "</span></h2>" +
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
    ziel.innerHTML = '<div class="radar-ansicht"><div class="radar" id="radar-liste"></div><div class="radar-text"><h2>' + plural(liste.length, "Termin", "Termine") + " auf dem Radar</h2>" +
      "<p>Richtung und Abstand zeigen, wo die Termine von Regensburg aus liegen. Der gestrichelte Ring markiert 100 km, außen geht es bis etwa 2.000 km. Die Entfernung ist gestaucht, damit die Region nicht untergeht.</p>" +
      '<p>Über einen Punkt fahren zeigt den Termin, Antippen öffnet alle Angaben.</p><div class="radar-legende">' + radarLegende(online, ohneOrt) + "</div></div></div>";
    var r = new Radar($("#radar-liste"), { oeffnen: function (id) { oeffnePanel("event", id, liste.map(function (e) { return e.id; })); }, tooltip: tooltip, sofort: true });
    S.ansichtRadar = r;
    r.setze(liste, false);
  }

  /* ============================================================
     Start-ups
     ============================================================ */
  function suUmfang(region, branche) {
    var r = region == null ? S.s.region : region, b = branche == null ? S.s.branche : branche;
    return S.startups.filter(function (s) { return (!r || s.region === r) && (!b || (s.branchen || []).indexOf(b) >= 0); });
  }
  function regionTabs() {
    return SU_REGIONEN.map(function (r) {
      return '<button type="button" role="tab" data-su-region="' + esc(r[0]) + '" aria-selected="' + (S.s.region === r[0]) + '">' + esc(r[1]) + "<span>" + suUmfang(r[0]).length + "</span></button>";
    }).join("");
  }
  function zeigeStartups() {
    var sf = S.s;
    var h = kopfband({ akzent: SU_AKZENT[sf.region], bild: "startups", titel: "Start-ups", textId: "su-text", text: SU_TEXT[sf.region],
      reiter: '<div class="reiter" role="tablist" aria-label="Region" id="su-reiter">' + regionTabs() + "</div>",
      unten: '<p class="kb-link"><a href="#kapital">Finanzierungen und Investoren ansehen</a> · <a href="#quellen">Quellen der Recherche</a></p>',
      rechts: '<div class="kb-radar"><div class="radar" id="radar-kopf"></div></div>' });
    h += '<div class="filterleiste" role="search"><div class="breite fl-innen">' +
      '<div id="s-branchen">' + kategorieLeiste(suUmfang(null, ""), sf.branche, "data-s-branche", ["Start-up", "Start-ups"]) + "</div>" +
      '<div class="fl-werkzeug"><label class="suchfeld">' + I.suche + '<span class="vh">Start-ups durchsuchen</span><input class="feld" type="search" id="s-q" placeholder="Suchen: Lösung, Ort, Investor" value="' + esc(sf.q) + '"></label>' +
      '<label class="schalter"><input type="checkbox" id="s-merk"' + (sf.merk ? " checked" : "") + "> Nur Merkliste</label></div></div></div>";
    h += '<div class="breite"><div class="su-raster"><div class="matrix-block"><h2>Relevanz und Aufwand</h2><p>Grobe Einordnung, nach der die Liste sortiert ist – kein Auswahlkriterium. Oben links: hohe Relevanz bei geringem Aufwand.</p>' +
      '<div class="matrix-wrap"><div class="achse-y">Relevanz, oben hoch</div><div class="matrix" id="matrix"></div><div class="achse-x">Umsetzungsaufwand, links gering</div></div>' +
      '<div class="matrix-legende"><span><span class="m-chip prio-A" style="padding:1px 6px">A</span>Priorität A</span><span><span class="m-chip prio-B" style="padding:1px 6px">B</span>B</span><span><span class="m-chip" style="padding:1px 6px">C</span>C</span><span><i class="ost-punkt"></i>Sitz in Ostbayern</span></div></div>';
    h += '<div><div class="ergebnis-kopf"><span class="anzahl" id="s-anzahl"></span>' + downloadsHtml("su", false) + "</div>" +
      '<ul class="zeilen su-karten" id="s-liste"></ul></div></div></div>';
    $("#ansicht").innerHTML = h;
    kopfRadar(suUmfang().filter(function (s) { return s.geo; }), true);
    var tq;
    $("#s-q").addEventListener("input", function () { var v = this.value; clearTimeout(tq); tq = setTimeout(function () { S.s.q = v; aktualisiereStartups(true); }, 120); });
    $("#s-merk").addEventListener("change", function () { S.s.merk = this.checked; aktualisiereStartups(true); });
    bindeSuBranchen();
    bindeRegionTabs();
    bindeKatLeiste($(".filterleiste"));
    aktualisiereStartups(false, true);
  }
  function bindeSuBranchen() {
    bindeBranchenChips("data-s-branche", function (w) {
      S.s.branche = w;
      $("#su-reiter").innerHTML = regionTabs();
      bindeRegionTabs();
      kopfRadar(suUmfang().filter(function (s) { return s.geo; }), true);
      aktualisiereStartups(true);
    });
  }
  function bindeBranchenChips(attr, nachher) {
    $$("[" + attr + "]").forEach(function (b) {
      b.addEventListener("click", function () {
        var w = b.getAttribute(attr);
        var akt = $$("[" + attr + "]").filter(function (x) { return x.getAttribute("aria-pressed") === "true"; })[0];
        if (akt === b && w) w = "";
        $$("[" + attr + "]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute(attr) === w); });
        nachher(w);
      });
    });
  }
  function bindeRegionTabs() {
    $$("[data-su-region]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = b.getAttribute("data-su-region");
        if (r === S.s.region) return;
        S.s.region = r;
        $$("[data-su-region]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        $("#su-text").textContent = SU_TEXT[r];
        if (S.s.branche && !suUmfang(r, S.s.branche).length) S.s.branche = "";
        $("#s-branchen").innerHTML = branchenChips(suUmfang(null, ""), S.s.branche, "data-s-branche");
        bindeSuBranchen();
        $("#kopfband").setAttribute("data-akzent", SU_AKZENT[r]);
        kopfRadar(suUmfang().filter(function (s) { return s.geo; }), true);
        aktualisiereStartups(true);
      });
    });
  }
  function filtereStartups() {
    var sf = S.s, q = sf.q.trim().toLowerCase(), w = q ? q.split(/\s+/) : [];
    return suUmfang().filter(function (s) {
      if (sf.merk && !merk.has(s.id)) return false;
      if (w.length) {
        var t = [s.name, s.sitz, s.region, LAND[s.land] || "", s.loesung, s.suchfeld, s.mehrwert, s.reifegrad, s.anbindung, s.kooperation, (s.branchen || []).join(" "), (s.investoren_alle || []).join(" ")].join(" ").toLowerCase();
        if (w.some(function (x) { return t.indexOf(x) < 0; })) return false;
      }
      return true;
    });
  }
  function aktualisiereStartups(animiert, erst) {
    var l = filtereStartups();
    S.suListe = l;
    S.druck = { art: "startups", liste: l, titel: "Start-ups" + (S.s.branche ? " – " + S.s.branche : "") + (S.s.region ? " – " + S.s.region : "") };
    var basis = suUmfang();
    anzahlSetzen($("#s-anzahl"), l.length, "Start-up", "Start-ups", basis.length);
    var ids = {}; l.forEach(function (s) { ids[s.id] = true; });
    var m = "";
    for (var r = 5; r >= 1; r--) {
      for (var a = 1; a <= 5; a++) {
        var hier = basis.filter(function (s) { return s.relevanz === r && s.aufwand === a; }).sort(function (x, y) { return (ids[y.id] ? 1 : 0) - (ids[x.id] ? 1 : 0); });
        var viel = hier.length > 11;
        m += '<div class="m-zelle' + (r >= 4 && a <= 2 ? " quick" : "") + '" role="group" aria-label="Relevanz ' + r + ", Aufwand " + a + '">' +
          (r === 5 && a === 1 ? '<span class="quick-label">Quick Wins</span>' : "") +
          (r === 5 && a === 1 && hier.length ? '<span style="height:16px"></span>' : "") +
          hier.map(function (s, i) {
            return '<button type="button" class="m-chip prio-' + s.prioritaet + (s.region === "Ostbayern" ? " ost" : "") + (ids[s.id] ? "" : " aus") + (viel && i >= 10 ? " m-weg" : "") + '" data-oeffne-su="' + esc(s.id) + '" data-su-chip="' + esc(s.id) + '" style="animation-delay:' + ((5 - r) * 50 + a * 40 + i * 22) + 'ms" aria-label="' + esc(s.name + ", " + s.sitz + ", Relevanz " + r + ", Aufwand " + a) + '">' + logo(s) + "</button>";
          }).join("") + (viel ? '<button type="button" class="m-mehr" aria-expanded="false" data-m-mehr>+' + (hier.length - 10) + "</button>" : "") +
          '<span class="m-koord" aria-hidden="true">' + r + "/" + a + "</span></div>";
      }
    }
    var mx = $("#matrix");
    mx.innerHTML = m;
    $$("[data-m-mehr]", mx).forEach(function (b) {
      b.addEventListener("click", function () {
        var z = b.closest(".m-zelle"), auf = !z.classList.contains("offen");
        z.classList.toggle("offen", auf);
        b.setAttribute("aria-expanded", auf ? "true" : "false");
        b.textContent = auf ? "–" : "+" + $$(".m-weg", z).length;
      });
    });
    $$(".m-chip", mx).forEach(function (c) {
      var s = findeStartup(c.getAttribute("data-su-chip"));
      var zeige = function () { var b = c.getBoundingClientRect(); tooltipStartup(s, { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.height / 2 + 4 }); };
      c.addEventListener("mouseenter", zeige); c.addEventListener("focus", zeige);
      c.addEventListener("mouseleave", function () { tooltip(null); }); c.addEventListener("blur", function () { tooltip(null); });
    });
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
  /* Materialband oben auf den Start-up-Karten: ein SVG-Bild je Branche, einmal als Stil angelegt */
  function bandHtml(s) {
    if (!window.Motiv) return "";
    motivStile();
    if (!S.suHaeufig) {
      S.suHaeufig = {};
      S.startups.forEach(function (x) { (x.branchen || []).forEach(function (b) { S.suHaeufig[b] = (S.suHaeufig[b] || 0) + 1; }); });
    }
    return '<span class="su-band ' + window.Motiv.bandKlasse(s.branchen, S.suHaeufig) + '" aria-hidden="true"></span>';
  }
  function suZeileHtml(s) {
    var lr = s.letzte_runde;
    return '<li class="zeile su-zeile prio-' + s.prioritaet + '" data-id="' + esc(s.id) + '">' +
      '<button type="button" class="zeile-knopf" data-oeffne-su="' + esc(s.id) + '">' + bandHtml(s) + logo(s) +
      '<span class="z-haupt"><span class="z-titel">' + esc(s.name) + "</span>" +
      '<span class="z-meta"><span>' + I.ort + esc(s.sitz) + (s.land && s.land !== "DE" ? ", " + esc(LAND[s.land] || s.land) : "") + "</span>" + branchenTags(s, 3) +
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
    var h = kopfband({ akzent: "kapital", bild: "kapital", titel: "Kapital", text: "Öffentlich bekannte Finanzierungsrunden, Übernahmen und Investoren rund um Dach, Solar, Bau und Fertigung – jeweils mit Quelle. Eigene Bewertungen und Finanzanalysen gehören nicht auf diese Seite.", rechts: rechts });
    h += '<div class="breite">';
    h += '<section class="abschnitt" aria-labelledby="ks-titel"><div class="abschnitt-kopf"><h2 id="ks-titel">Runden im Zeitverlauf</h2><p>Jeder Kreis ist ein Deal, seine Fläche entspricht dem genannten Betrag in Euro. Hohle Kreise: Betrag nicht veröffentlicht oder in einer anderen Währung. Antippen öffnet die Details.</p></div><div class="ks" id="ks"></div></section>';
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
    kapitalstrom($("#ks"), S.runden);
    aktualisiereDeals(false);
    netzwerk($("#netz"));
  }
  function aktualisiereDeals(animiert) {
    var l = dealsGefiltert();
    S.dealListe = l;
    S.druck = { art: "runden", liste: l, titel: "Kapital – Deals" };
    anzahlSetzen($("#d-anzahl"), l.length, "Deal", "Deals", S.runden.length);
    var zeichne = function () { $("#d-liste").innerHTML = l.length ? l.map(dealZeile).join("") : '<li class="leer" style="border:0">Kein Deal passt zu den Filtern.</li>'; };
    if (animiert) flip($("#d-liste"), zeichne); else zeichne();
    var drin = {}; l.forEach(function (r) { drin[r.id] = true; });
    $$(".ks-blase").forEach(function (b) { b.classList.toggle("aus", !drin[b.getAttribute("data-oeffne-deal")]); });
  }

  /* Kapitalstrom: Deals als Kreise auf einer Zeitachse, eine Bahn je Thema. Ein Strahl läuft einmal von links nach rechts und lässt die Kreise erscheinen – wie der Radarstrahl. */
  function kapitalstrom(ziel, runden) {
    if (!ziel) return;
    var ab = "2022-01-01", bis = addMonate(S.heute, 2);
    var t0 = dt(ab).getTime(), t1 = dt(bis).getTime();
    var zaehl = {}; runden.forEach(function (r) { zaehl[r.thema] = (zaehl[r.thema] || 0) + 1; });
    var bahnen = Object.keys(zaehl).sort(function (x, y) { return zaehl[y] - zaehl[x] || x.localeCompare(y); });
    function xPos(d) {
      var s = d.length === 7 ? d + "-15" : d;
      if (s < ab) return 1.2;
      return 4 + (dt(s).getTime() - t0) / (t1 - t0) * 94;
    }
    var jahre = [];
    for (var j = 2022; j <= +bis.slice(0, 4); j++) jahre.push(j);
    var h = '<div class="ks-feld">';
    h += '<div class="ks-achse" aria-hidden="true">' + jahre.map(function (j) { var x = xPos(j + "-01-01"); return x > 95 ? "" : '<span style="left:' + x.toFixed(2) + '%">' + j + "</span>"; }).join("") + '<span class="ks-frueher" style="left:1.2%">früher</span><span class="ks-heute" style="left:' + xPos(S.heute).toFixed(2) + '%">heute</span></div>';
    h += bahnen.map(function (b, bi) {
      var inBahn = runden.filter(function (r) { return r.thema === b; }).slice().sort(function (x, y) { return (y.betrag_mio_eur || 0) - (x.betrag_mio_eur || 0); });
      return '<div class="ks-bahn"><span class="ks-name">' + esc(b) + '</span><div class="ks-spur" role="group" aria-label="' + esc(b) + '">' + inBahn.map(function (r, i) {
        var x = xPos(r.datum), mio = r.betrag_mio_eur || 0;
        var rad = mio ? 5 + Math.sqrt(mio) * 2.3 : 6;
        var art = r.art === "Übernahme" ? "uebernahme" : r.art === "Fonds" ? "fonds" : "runde";
        var dy = ((i % 3) - 1) * 9;
        return '<button type="button" class="ks-blase ' + art + (mio ? "" : " hohl") + '" data-oeffne-deal="' + esc(r.id) + '" data-tip-deal="' + esc(r.id) + '" style="left:' + x.toFixed(2) + "%;--r:" + rad.toFixed(1) + "px;--dy:" + dy + "px;--v:" + (x / 100 * 1.6).toFixed(2) + 's" aria-label="' + esc(r.unternehmen + ", " + r.runde + ", " + r.betrag + ", " + monatJahr(r.datum)) + '"></button>';
      }).join("") + "</div></div>";
    }).join("");
    h += '<div class="ks-strahl" aria-hidden="true"></div></div>';
    h += '<div class="ks-legende"><span><i class="ks-l runde"></i>Finanzierungsrunde</span><span><i class="ks-l uebernahme"></i>Übernahme</span><span><i class="ks-l fonds"></i>Fonds</span><span><i class="ks-l hohl"></i>Betrag nicht in Euro genannt</span></div>';
    ziel.innerHTML = h;
    if (reduziert.matches || !window.IntersectionObserver) { ziel.classList.add("an"); return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ziel.classList.add("an", "laeuft"); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(ziel);
  }
  function tooltipDeal(r, p) {
    tipEl.innerHTML = '<span class="tt-kopf"><span class="tt-zeile">' + esc(r.art) + ", " + esc(monatJahr(r.datum)) + "</span></span><strong>" + esc(r.unternehmen) + '</strong><span class="tt-zeile">' + esc(r.runde) + ": " + esc(r.betrag) + "<br>" + esc(r.thema) + "</span>";
    tipEl.hidden = false;
    var oben = p.y - p.r > 150;
    tipEl.classList.toggle("unten", !oben);
    tipEl.style.left = Math.max(160, Math.min(window.innerWidth - 160, p.x)) + "px";
    tipEl.style.top = (oben ? p.y - p.r : p.y + p.r) + "px";
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
      var svg = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="group" aria-label="Netzwerk aus Investoren und Unternehmen" font-size="' + fs + '">';
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
     Intern: geschützter Bereich (verschlüsselt, Entschlüsselung nur im Browser)
     ============================================================ */
  var IKEY = "radar-intern";
  var TON = ["warn", "signal", "ok", "info", "leise"];
  function iPassLesen() {
    try { var s = window.sessionStorage.getItem(IKEY); if (s) return s; } catch (e) { /* ohne Speicher */ }
    try { return window.localStorage.getItem(IKEY) || ""; } catch (e) { return ""; }
  }
  function iPassMerken(pass, dauerhaft) {
    try { window.sessionStorage.setItem(IKEY, pass); } catch (e) { /* ohne Speicher */ }
    try { if (dauerhaft) window.localStorage.setItem(IKEY, pass); else window.localStorage.removeItem(IKEY); } catch (e) { /* ohne Speicher */ }
  }
  function iPassVergessen() {
    try { window.sessionStorage.removeItem(IKEY); } catch (e) { /* ohne Speicher */ }
    try { window.localStorage.removeItem(IKEY); } catch (e) { /* ohne Speicher */ }
  }
  function b64u8(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function iEntschluesseln(datei, pass) {
    var c = window.crypto && window.crypto.subtle;
    if (!c || !window.TextEncoder) return Promise.reject(new Error("browser"));
    return c.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"])
      .then(function (roh) { return c.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: b64u8(datei.salt), iterations: datei.iter }, roh, { name: "AES-GCM", length: 256 }, false, ["decrypt"]); })
      .then(function (key) { return c.decrypt({ name: "AES-GCM", iv: b64u8(datei.iv) }, key, b64u8(datei.ct)); })
      .then(function (buf) {
        if (datei.z !== "gzip") return new TextDecoder().decode(buf);
        if (!window.DecompressionStream) throw new Error("browser");
        return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
      }, function () { throw new Error("passwort"); })
      .then(function (t) { return JSON.parse(t); });
  }
  function iOeffnen(pass, dauerhaft) {
    return (S.iDatei ? Promise.resolve(S.iDatei) : lade("data/intern.json").then(function (d) { S.iDatei = d; return d; }))
      .then(function (d) { return iEntschluesseln(d, pass); })
      .then(function (inhalt) {
        S.iDaten = inhalt;
        var gemerkt = store.get("radar-intern-sammlung", "");
        S.i = { sammlung: inhalt.sammlungen.some(function (x) { return x.id === gemerkt; }) ? gemerkt : inhalt.sammlungen[0].id, q: "", f: {} };
        iPassMerken(pass, dauerhaft);
      });
  }
  function iSammlung() { var d = S.iDaten; return d.sammlungen.filter(function (x) { return x.id === S.i.sammlung; })[0] || d.sammlungen[0]; }
  function iFeld(s, x) { var v = x[s]; return v == null ? "" : v; }
  function iZahl(d, k) {
    var s = d.sammlungen.filter(function (x) { return x.id === k.sammlung; })[0];
    if (!s) return 0;
    return s.liste.filter(function (x) {
      if (k.min != null) return +x[k.feld] >= k.min;
      if (k.in) return k.in.indexOf(x[k.feld]) >= 0;
      return true;
    }).length;
  }
  function iMarke(m, x) {
    var v = x[m.feld]; if (v == null || v === "") return "";
    var ton = (m.toene && m.toene[v]) || "leise";
    return '<span class="i-marke ton-' + (TON.indexOf(ton) >= 0 ? ton : "leise") + '">' + esc((m.praefix || "") + ((m.labels && m.labels[v]) || v)) + "</span>";
  }
  function iWert(w, x) {
    var v = +x[w.feld] || 0, max = w.max || 5;
    var h = '<span class="mini" title="' + esc(w.label + " " + v + " von " + max) + '">' + esc(w.label) + "<i>";
    for (var i = 1; i <= max; i++) h += "<em" + (i <= v ? ' class="v"' : "") + "></em>";
    return h + "</i></span>";
  }
  function iSortiere(s, l) {
    var regeln = s.sort || [];
    return l.slice().sort(function (a, b) {
      for (var i = 0; i < regeln.length; i++) {
        var r = regeln[i], va = a[r.feld], vb = b[r.feld], d = 0;
        if (r.reihenfolge) { var ia = r.reihenfolge.indexOf(va), ib = r.reihenfolge.indexOf(vb); d = (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); }
        else if (typeof va === "number" || typeof vb === "number") d = (+va || 0) - (+vb || 0);
        else d = String(va || "").localeCompare(String(vb || ""), "de");
        if (r.ab && !r.reihenfolge) d = -d;
        if (d) return d;
      }
      return String(a[s.titelFeld] || "").localeCompare(String(b[s.titelFeld] || ""), "de");
    });
  }
  function iText(x) {
    return Object.keys(x).map(function (k) {
      var v = x[k];
      if (Array.isArray(v)) return v.map(function (q) { return q && q.label ? q.label : ""; }).join(" ");
      return typeof v === "string" && !/^https?:/.test(v) ? v : typeof v === "number" ? String(v) : "";
    }).join(" ").toLowerCase();
  }
  function iGefiltert() {
    var s = iSammlung(), q = S.i.q.trim().toLowerCase(), w = q ? q.split(/\s+/) : [];
    return iSortiere(s, s.liste.filter(function (x) {
      var ok = (s.filter || []).every(function (f) {
        var v = S.i.f[f.feld];
        if (v == null || v === "") return true;
        return f.min ? (+x[f.feld] || 0) >= +v : String(x[f.feld]) === v;
      });
      if (!ok) return false;
      if (w.length) { var t = iText(x); if (w.some(function (y) { return t.indexOf(y) < 0; })) return false; }
      return true;
    }));
  }

  function zeigeIntern() {
    if (S.iDaten) return iAnsicht();
    var gespeichert = iPassLesen();
    iSchloss(gespeichert ? "pruefe" : "");
    if (gespeichert) {
      iOeffnen(gespeichert, (function () { try { return !!window.localStorage.getItem(IKEY); } catch (e) { return false; } })())
        .then(function () { if (S.route === "intern") iAnsicht(); })
        .catch(function () { iPassVergessen(); if (S.route === "intern") iSchloss(""); });
    }
  }
  function iSchloss(zustand) {
    var h = kopfband({ akzent: "intern", titel: "Intern", text: "Geschützter Bereich. Die Inhalte liegen verschlüsselt vor und werden erst in deinem Browser mit dem Passwort entschlüsselt – ohne Server, ohne Konto." });
    h += '<div class="breite"><form class="i-schloss" id="i-form" autocomplete="on">' +
      '<span class="i-schloss-icon" aria-hidden="true">' + I.schloss + "</span>" +
      '<h2>Passwort eingeben</h2><p>Das Passwort bekommst du von der Person, die dir diesen Bereich freigegeben hat.</p>' +
      '<input type="text" name="username" value="Intern" autocomplete="username" hidden>' +
      '<label class="i-feld"><span class="vh">Passwort</span><input class="feld" type="password" id="i-pass" name="password" autocomplete="current-password" placeholder="Passwort" required' + (zustand === "pruefe" ? " disabled" : "") + "></label>" +
      '<label class="schalter"><input type="checkbox" id="i-merken"> Auf diesem Gerät merken</label>' +
      '<button type="submit" class="knopf signal" id="i-los"' + (zustand === "pruefe" ? " disabled" : "") + ">" + I.schloss + (zustand === "pruefe" ? "Wird entschlüsselt …" : "Entsperren") + "</button>" +
      '<p class="i-fehler" id="i-fehler" role="alert"></p></form></div>';
    $("#ansicht").innerHTML = h;
    S.druck = { art: "intern-leer", liste: [], titel: "Intern" };
    var form = $("#i-form"), feld = $("#i-pass"), fehler = $("#i-fehler"), los = $("#i-los");
    if (zustand !== "pruefe") setTimeout(function () { feld.focus(); }, 30);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var pass = feld.value;
      if (!pass) return;
      fehler.textContent = "";
      los.disabled = true; feld.disabled = true;
      los.innerHTML = I.schloss + "Wird entschlüsselt …";
      iOeffnen(pass, $("#i-merken").checked).then(function () { if (S.route === "intern") iAnsicht(); }).catch(function (err) {
        los.disabled = false; feld.disabled = false;
        los.innerHTML = I.schloss + "Entsperren";
        fehler.textContent = err && err.message === "passwort" ? "Das Passwort stimmt nicht." : err && err.message === "browser" ? "Dieser Browser kann den Bereich nicht entschlüsseln. Bitte einen aktuellen Browser verwenden." : "Der Bereich konnte nicht geladen werden. Bitte später noch einmal versuchen.";
        feld.select(); feld.focus();
      });
    });
  }
  function iReiter(d) {
    return d.sammlungen.map(function (x) {
      return '<button type="button" role="tab" data-i-sammlung="' + esc(x.id) + '" aria-selected="' + (S.i.sammlung === x.id) + '">' + esc(x.titel) + "<span>" + x.liste.length + "</span></button>";
    }).join("");
  }
  function iAnsicht() {
    var d = S.iDaten, s = iSammlung();
    var rechts = (d.kennzahlen || []).length ? '<dl class="kb-stats">' + d.kennzahlen.map(function (k) { return "<div><dt>" + esc(k.label) + "</dt><dd>" + iZahl(d, k) + "</dd></div>"; }).join("") + "</dl>" : "";
    var h = kopfband({ akzent: "intern", titel: d.titel || "Intern", text: d.text || "",
      reiter: '<div class="reiter" role="tablist" aria-label="Liste" id="i-reiter">' + iReiter(d) + '</div><p class="umfang-text i-text" id="i-text">' + esc(s.text || "") + "</p>",
      unten: '<p class="kb-link i-stand">' + (d.stand ? "Stand " + esc(de(d.stand)) : "") + (d.hinweis ? " · " + esc(d.hinweis) : "") +
        ' <button type="button" class="linkknopf i-sperren" id="i-sperren">' + I.schloss + "Sperren</button></p>",
      rechts: rechts });
    h += '<div class="filterleiste" role="search"><div class="breite" id="i-filter"></div></div>';
    h += '<div class="breite"><div class="ergebnis-kopf"><span class="anzahl" id="i-anzahl"></span>' + downloadsHtml("intern", false) + "</div>" +
      '<ul class="zeilen" id="i-liste"></ul>';
    if ((d.abschnitte || []).length || d.arbeitsseite) {
      h += '<section class="abschnitt i-info"><div class="i-info-raster">' + (d.abschnitte || []).map(function (a) {
        return "<div><h3>" + esc(a.titel) + "</h3>" + (a.absaetze || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
          ((a.links || []).length ? '<p class="i-links">' + a.links.map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + "</a>"; }).join("") + "</p>" : "") + "</div>";
      }).join("") + "</div>" +
        (d.arbeitsseite ? '<p class="klein i-arbeit">' + esc(d.arbeitsseite_text || "") + ' <a href="' + esc(d.arbeitsseite) + '" target="_blank" rel="noopener noreferrer">Arbeitsseite öffnen</a></p>' : "") + "</section>";
    }
    h += "</div>";
    $("#ansicht").innerHTML = h;
    iFilterleiste();
    $$("[data-i-sammlung]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-i-sammlung");
        if (id === S.i.sammlung) return;
        S.i = { sammlung: id, q: "", f: {} };
        store.set("radar-intern-sammlung", id);
        $$("[data-i-sammlung]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        $("#i-text").textContent = iSammlung().text || "";
        iFilterleiste();
        iAktualisiere(true);
      });
    });
    $("#i-sperren").addEventListener("click", function () {
      iPassVergessen(); S.iDaten = null; S.i = null;
      toast("Bereich gesperrt");
      iSchloss("");
    });
    iAktualisiere(false);
  }
  function iFilterleiste() {
    var s = iSammlung();
    var h = '<label class="suchfeld">' + I.suche + '<span class="vh">Durchsuchen</span><input class="feld" type="search" id="i-q" placeholder="' + esc(s.suche || "Suchen") + '" value="' + esc(S.i.q) + '"></label>';
    (s.filter || []).forEach(function (f) {
      var werte = f.werte || uniq(s.liste.map(function (x) { return x[f.feld]; }).filter(function (v) { return v != null && v !== ""; })).sort().map(function (v) { return [v, v]; });
      var akt = S.i.f[f.feld] == null ? "" : String(S.i.f[f.feld]);
      h += '<label><span class="vh">' + esc(f.alle) + '</span><select class="feld" data-i-filter="' + esc(f.feld) + '"><option value="">' + esc(f.alle) + "</option>" +
        werte.map(function (w) { return '<option value="' + esc(w[0]) + '"' + (String(w[0]) === akt ? " selected" : "") + ">" + esc(w[1]) + "</option>"; }).join("") + "</select></label>";
    });
    $("#i-filter").innerHTML = h;
    var tq;
    $("#i-q").addEventListener("input", function () { var v = this.value; clearTimeout(tq); tq = setTimeout(function () { S.i.q = v; iAktualisiere(true); }, 120); });
    $$("[data-i-filter]").forEach(function (sel) {
      sel.addEventListener("change", function () { S.i.f[sel.getAttribute("data-i-filter")] = sel.value; iAktualisiere(true); });
    });
  }
  function iAktualisiere(animiert) {
    var s = iSammlung(), l = iGefiltert();
    S.iListe = l;
    S.druck = { art: "intern", liste: l, titel: s.titel };
    anzahlSetzen($("#i-anzahl"), l.length, s.einzahl || "Eintrag", s.mehrzahl || "Einträge", s.liste.length);
    var zeichne = function () { $("#i-liste").innerHTML = l.length ? l.map(function (x) { return iZeile(s, x); }).join("") : '<li class="leer" style="border:0">Kein Eintrag passt zu den Filtern.</li>'; };
    if (animiert) flip($("#i-liste"), zeichne); else zeichne();
  }
  function iZeile(s, x) {
    var m0 = (s.marken || [])[0], ton = m0 && m0.toene ? m0.toene[x[m0.feld]] || "leise" : "leise";
    return '<li class="zeile i-zeile ton-' + esc(ton) + '" data-id="' + esc(x._id) + '"><button type="button" class="zeile-knopf" data-oeffne-intern="' + esc(x._id) + '">' +
      '<span class="z-haupt"><span class="z-titel">' + esc(iFeld(s.titelFeld, x)) + "</span>" +
      '<span class="z-meta">' + (s.meta || []).map(function (m) { var v = x[m.feld]; return v ? "<span>" + (m.icon && I[m.icon] ? I[m.icon] : "") + esc(v) + "</span>" : ""; }).join("") + "</span>" +
      (s.textFeld && x[s.textFeld] ? '<span class="z-grund">' + esc(x[s.textFeld]) + "</span>" : "") + "</span>" +
      '<span class="z-rechts">' + (s.marken || []).map(function (m) { return iMarke(m, x); }).join("") + (s.wert ? '<span class="werte">' + iWert(s.wert, x) + "</span>" : "") + "</span>" +
      "</button></li>";
  }
  function findeIntern(id) { if (!S.iDaten) return null; return iSammlung().liste.filter(function (x) { return x._id === id; })[0] || null; }
  function iWertText(typ, v, x) {
    if (typ === "datum") return v ? de(v) : "";
    if (typ === "quellen") return (v || []).map(function (q) { return q.label + " (" + q.url + ")"; }).join(", ");
    return v == null ? "" : String(v);
  }
  function panelIntern(x) {
    var s = iSammlung();
    if (!x) return panelKopf(s.einzahl || "Eintrag") + '<div class="p-inhalt"><p>Eintrag nicht gefunden.</p></div>';
    var h = panelKopf(s.titel) + '<div class="p-inhalt">';
    h += '<div class="i-marken">' + (s.marken || []).map(function (m) { return iMarke(m, x); }).join("") + (s.wert ? iWert(s.wert, x) : "") + "</div>";
    h += '<h2 id="panel-titel">' + esc(iFeld(s.titelFeld, x)) + "</h2>";
    var fk = (s.fakten || []).filter(function (f) { return x[f.feld]; });
    if (fk.length) h += '<div class="p-fakten">' + fk.map(function (f) { return fakt(I[f.icon] || I.info, esc((f.praefix || "") + x[f.feld])); }).join("") + "</div>";
    if (s.textFeld && x[s.textFeld]) h += '<p class="deal-kurz">' + esc(x[s.textFeld]) + "</p>";
    var link = s.link && x[s.link.feld];
    if (link) h += '<div class="p-aktionen"><a class="knopf" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + I.link + esc(s.link.label || "Öffnen") + "</a></div>";
    var qu = s.quellenFeld ? (x[s.quellenFeld] || []) : [];
    if (qu.length) h += '<section class="p-abschnitt"><h3>Quellen</h3><ul class="i-quellen">' + qu.map(function (q) { return '<li><a href="' + esc(q.url) + '" target="_blank" rel="noopener noreferrer">' + I.link + esc(q.label || kurzUrl(q.url)) + "</a></li>"; }).join("") + "</ul></section>";
    h += '<section class="p-abschnitt"><h3>Angaben</h3><dl class="angaben">' + (s.details || []).filter(function (d) { return d[2] !== "quellen"; }).map(function (d) {
      var v = x[d[1]];
      if (d[2] === "url") return v ? "<dt>" + esc(d[0]) + '</dt><dd><a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(v)) + "</a></dd>" : "";
      return zeile(d[0], iWertText(d[2], v, x));
    }).join("") + "</dl></section></div>";
    return h;
  }
  function iSpalten(s) {
    return (s.details || []).map(function (d) {
      return [d[0], function (x) { var v = x[d[1]]; return d[2] === "datum" && v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? { date: v } : iWertText(d[2], v, x); }];
    });
  }

  /* ============================================================
     Quellen: Register der automatisch abgerufenen Kalender und Listen
     ============================================================ */
  var Q_REGIONEN = ["Ostbayern", "Bayern", "Deutschland", "Österreich", "Schweiz", "Europa"];
  function zeigeQuellen() {
    $("#ansicht").innerHTML = '<div class="lade" role="status"><span class="lade-radar" aria-hidden="true"></span>Quellen werden geladen …</div>';
    Promise.all([lade("tools/quellen.json"), lade("data/abruf_status.json").catch(leer({}))]).then(function (r) {
      if (S.route !== "quellen") return;
      var qs = (r[0].quellen || []).filter(function (q) { return q.aktiv !== false; }), st = r[1] || {}, idx = {};
      (st.quellen || []).forEach(function (x) { idx[x.id] = x; });
      S.q = S.q || { art: "", region: "" };
      var ok = qs.filter(function (q) { return idx[q.id] && idx[q.id].ok; }).length;
      var rechts = '<dl class="kb-stats"><div><dt>Quellen im Register</dt><dd>' + qs.length + "</dd></div>" +
        "<div><dt>Beim letzten Abruf erreichbar</dt><dd>" + (st.abgerufen ? ok : "–") + "</dd></div>" +
        "<div><dt>Gefundene Termine</dt><dd>" + (st.kandidaten != null ? st.kandidaten : "–") + "</dd></div>" +
        "<div><dt>Davon noch zu prüfen</dt><dd>" + (st.neu != null ? st.neu : "–") + "</dd></div></dl>";
      var h = kopfband({ akzent: "archiv", titel: "Quellen", text: "Diese Kalender, Kammern, Verbände, Cluster, Hochschulen, Messen und Start-up-Listen liest der Radar jeden Tag automatisch aus. Neue Termine und Start-ups werden geprüft und eingeordnet; dazu kommt die Websuche in der wöchentlichen und monatlichen Recherche. Fehlt eine Quelle? Einfach melden.",
        unten: '<p class="kb-link">' + (st.abgerufen ? "Letzter Abruf: " + esc(st.abgerufen) : "Der erste automatische Abruf läuft gerade.") + "</p>", rechts: rechts });
      h += '<div class="filterleiste" role="search"><div class="breite"><div class="segment" role="radiogroup" aria-label="Art">' +
        [["", "Alle"], ["events", "Termine"], ["liste", "Start-up-Listen"]].map(function (a) { return '<button type="button" role="radio" data-q-art="' + a[0] + '" aria-checked="' + (S.q.art === a[0]) + '">' + a[1] + "</button>"; }).join("") +
        '</div><label><span class="vh">Region</span><select class="feld" id="q-region"><option value="">Alle Regionen</option>' + Q_REGIONEN.map(function (x) { return "<option" + (x === S.q.region ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></label></div></div>";
      h += '<div class="breite" id="q-liste"></div>';
      $("#ansicht").innerHTML = h;
      var zeichne = function () {
        var l = qs.filter(function (q) { return (!S.q.art || (q.art || "events") === S.q.art) && (!S.q.region || q.region === S.q.region); });
        var html = '<div class="ergebnis-kopf"><span class="anzahl">' + plural(l.length, "Quelle", "Quellen") + "</span></div>";
        Q_REGIONEN.forEach(function (reg) {
          var g = l.filter(function (q) { return q.region === reg; });
          if (!g.length) return;
          html += '<h2 class="monat-kopf">' + esc(reg) + "<span>" + plural(g.length, "Quelle", "Quellen") + '</span></h2><ul class="zeilen q-zeilen">' + g.map(function (q) {
            var x = idx[q.id], zustand = !x ? ["offen", "noch nicht abgerufen"] : x.ok ? ["ok", (q.art === "liste" ? x.anzahl + " Einträge" : x.anzahl + " Termine") + (x.methoden && x.methoden.length ? " · " + x.methoden.join(", ").replace(/detailseiten:\d+/, "Detailseiten") : "")] : ["fehler", "nicht erreichbar" + (x.fehler ? " (" + x.fehler + ")" : "")];
            return '<li class="zeile q-zeile"><a class="zeile-knopf" href="' + esc(q.url) + '" target="_blank" rel="noopener noreferrer"><span class="z-haupt"><span class="z-titel">' + esc(q.name) + '</span><span class="z-meta"><span>' + esc(q.typ || "") + "</span><span>" + (q.art === "liste" ? "Start-up-Liste" : "Termine") + "</span><span>" + esc(kurzUrl(q.url)) + '</span></span></span><span class="z-rechts"><span class="q-status ' + zustand[0] + '">' + esc(zustand[1]) + "</span>" + (x && x.zuletzt_ok ? '<span class="z-wann">zuletzt erreichbar ' + esc(de(x.zuletzt_ok)) + "</span>" : "") + "</span></a></li>";
          }).join("") + "</ul>";
        });
        $("#q-liste").innerHTML = html;
      };
      $$("[data-q-art]").forEach(function (b) { b.addEventListener("click", function () { S.q.art = b.getAttribute("data-q-art"); $$("[data-q-art]").forEach(function (x) { x.setAttribute("aria-checked", x === b); }); zeichne(); }); });
      $("#q-region").addEventListener("change", function () { S.q.region = this.value; zeichne(); });
      zeichne();
    }).catch(function (err) {
      $("#ansicht").innerHTML = '<div class="fehler"><h1>Die Quellen konnten nicht geladen werden.</h1><p class="klein">' + esc(err.message) + "</p></div>";
    });
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
      h += '<div class="leer"><h2>Noch nichts gemerkt</h2><p>Tippe bei einem Termin oder Start-up auf den Stern. Hier sammelt sich dann alles, was du im Blick behalten willst – zum Herunterladen als Excel oder Kalenderdatei.</p><a class="knopf" href="#termine">Termine ansehen</a></div></div>';
      $("#ansicht").innerHTML = h; return;
    }
    if (ev.length) {
      h += '<div class="ergebnis-kopf"><span class="anzahl">' + plural(ev.length, "Termin", "Termine") + "</span>" + downloadsHtml("merk-ev", true) + "</div>" +
        '<ul class="ev-liste">' + ev.map(zeileHtml).join("") + "</ul>";
    }
    if (su.length) {
      h += '<div class="ergebnis-kopf" style="margin-top:28px"><span class="anzahl">' + plural(su.length, "Start-up", "Start-ups") + "</span>" + downloadsHtml("merk-su", false) + "</div>" +
        '<ul class="zeilen su-karten">' + su.map(suZeileHtml).join("") + "</ul>";
    }
    h += "</div>";
    $("#ansicht").innerHTML = h;
  }
  function zeigeMerkZahl(pop) {
    var n = merk.size, el = $("#merk-zahl");
    el.hidden = !n;
    if (window.Bewegung) window.Bewegung.zahl(el, n, !pop); else el.textContent = n;
    $(".merk-link").classList.toggle("hat", n > 0);
    if (pop && n) {
      if (window.Bewegung) window.Bewegung.stoss(el);
      else { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
    }
  }
  /* Von wo der Termin in die Merkliste fliegt und wohin */
  function merkQuelle(knopf) {
    var k = knopf && (knopf.closest("[data-id]") || knopf.closest(".panel"));
    return (k && $(".ev-bild, .su-band, .p-titelbild .p-motiv, .p-motiv", k)) || knopf;
  }
  function merkZiel() {
    return $$(".merk-link, .unternav [data-nav=merkliste]").filter(function (x) { return x.offsetWidth > 0; })[0] || null;
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
    if (knopf && an && !reduziert.matches && window.Bewegung) {
      window.Bewegung.funken(knopf);
      window.Bewegung.flug(merkQuelle(knopf), merkZiel(), function () { zeigeMerkZahl(true); });
    } else {
      if (knopf && an && !reduziert.matches) { knopf.classList.remove("wackel"); void knopf.offsetWidth; knopf.classList.add("wackel"); }
      zeigeMerkZahl(an);
    }
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
      : typ === "deal" ? panelDeal(findeDeal(id)) : typ === "inv" ? panelInvestor(findeInvestor(id)) : typ === "intern" ? panelIntern(findeIntern(id)) : panelHilfe();
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
  /* Karte wächst zur Detailansicht: Materialbild, Logo und Name wandern mit (View Transitions, sonst normales Einblenden) */
  function morphTeile(wurzel, imPanel) {
    if (!wurzel) return {};
    if (imPanel) return { "bw-bild": $(".p-titelbild .p-motiv", wurzel) || $(".p-motiv", wurzel), "bw-titel": $("#panel-titel", wurzel), "bw-logo": $(".p-logo-zeile .logo", wurzel) };
    return { "bw-bild": $(".ev-bild, .su-band", wurzel), "bw-titel": $(".ev-titel, .z-titel", wurzel), "bw-logo": $(".zeile-knopf > .logo", wurzel) };
  }
  function oeffneMitMorph(karte, typ, id, kontext) {
    if (!window.Bewegung || panel.open || reduziert.matches || !document.startViewTransition) return oeffnePanel(typ, id, kontext);
    panel.classList.add("bw-ohne");
    S.panelMorph = window.Bewegung.morph(morphTeile(karte, false), function () {
      oeffnePanel(typ, id, kontext);
      $$(".p-inhalt > *:not(.p-titelbild):not(.p-motiv)", panelInhalt).slice(0, 8).forEach(function (x, n) {
        window.Bewegung.anim(x, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 480, delay: 140 + n * 45, easing: "cubic-bezier(.2, .7, .2, 1)", fill: "backwards" });
      });
    }, function () { return morphTeile(panelInhalt, true); });
    if (!S.panelMorph) panel.classList.remove("bw-ohne");
  }
  function morphZurueck() {
    if (!S.panelMorph || !S.panel || !window.Bewegung || !document.startViewTransition || reduziert.matches) return false;
    var karte = $$("#ansicht [data-id]").filter(function (x) { return x.getAttribute("data-id") === S.panel.id; })[0];
    var ziel = morphTeile(karte, false), quelle = morphTeile(panelInhalt, true);
    var sicht = function (x) { if (!x) return false; var r = x.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight; };
    if (!sicht(ziel["bw-bild"]) || !sicht(quelle["bw-bild"])) return false;
    S.panelMorph = false;
    return window.Bewegung.morph(quelle, function () { if (panel.open) panel.close(); }, function () { return ziel; });
  }
  function schliessePanel() {
    if (!panel.open || panel.classList.contains("schliesst")) return;
    if (morphZurueck()) return;
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
    panel.classList.remove("bw-ohne"); S.panelMorph = false;
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
  /* Materialbild der Branche als Titelbild (erzeugt, keine Fotos) */
  function motivBild(x) {
    if (!window.Motiv) return "";
    var su = S.startups.indexOf(x) >= 0;
    if (su) bandHtml(x);
    return '<div class="p-motiv">' + window.Motiv.svg(window.Motiv.wahl(x.branchen, su ? S.suHaeufig : null), x.id) + "</div>";
  }
  function fakt(icon, html) { return '<div class="p-fakt">' + icon + "<div>" + html + "</div></div>"; }
  function zeile(k, v) { return "<dt>" + esc(k) + "</dt><dd>" + esc(v == null || v === "" ? "k. A." : v) + "</dd>"; }

  function pKachel(icon, titel, haupt, unter) {
    return '<div class="p-kachel">' + icon + '<span class="pk-titel">' + esc(titel) + '</span><strong>' + haupt + "</strong>" + (unter ? "<span>" + unter + "</span>" : "") + "</div>";
  }
  function panelEvent(e) {
    var sc = e.scores, ent = entfernung(e);
    var h = panelKopf(e.rubrik === "noneu" ? "Veranstaltung außerhalb der EU" : "Veranstaltung, " + (e.rubrik === "eu" ? "EU" : RUBRIK[e.rubrik]), e.id, e.name) + '<div class="p-inhalt">';
    h += '<div class="p-titelbild">' + motivBild(e) + '<div class="p-titel-auf"><div class="p-badges">' + schild(e.prioritaet, e.gesamt) +
      (e.status === "geschätzt" ? '<span class="p-pille schaetz">Datum geschätzt</span>' : '<span class="p-pille ok">bestätigt</span>') +
      (laeuft(e) ? '<span class="p-pille live">läuft gerade</span>' : "") + '</div><h2 id="panel-titel">' + esc(e.name) + "</h2></div></div>";
    h += '<div class="p-kacheln">' +
      pKachel(I.kal, "Wann", esc(zeitraumLang(e)), esc(relativ(e)) + (e.status === "geschätzt" ? ", aus dem Vorjahr abgeleitet" : "")) +
      pKachel(e.online ? I.welt : I.ort, "Wo", esc(e.online ? "Online" : e.ort), esc(e.region) + (ent && !e.online ? ", " + esc(ent === "in Regensburg" ? "in Regensburg" : ent + " von Regensburg") : "")) +
      pKachel(I.leute, "Format", esc(e.format), esc(e.veranstalter)) +
      pKachel(I.euro, e.kosten ? "Kosten" : "Anmeldung", esc(e.kosten || e.anmeldung || "k. A."), e.kosten && e.anmeldung ? esc(e.anmeldung) : "") + "</div>";
    h += '<div class="p-branchen">' + (e.branchen || []).map(function (w) { return '<span class="ev-br" style="--f:' + BRANCHE_FARBE[w] + '">' + brIcon(w) + esc(w) + "</span>"; }).join("") + "</div>";
    if (e.anmeldeschluss && e.anmeldeschluss >= S.heute) {
      var n = tageBis(e.anmeldeschluss);
      h += '<div class="frist-box"><span class="countdown' + (n <= 14 ? " dringend" : "") + '"><b>' + n + "</b><small>" + (n === 1 ? "Tag" : "Tage") + "</small></span><div><strong>" + esc(e.frist_art || "Anmeldeschluss") + "</strong><br>bis " + esc(langDatum(e.anmeldeschluss)) + "</div></div>";
    }
    if (e.begruendung || e.fokus || (e.rolle || []).length) h += '<section class="p-abschnitt p-warum"><h3>' + I.info + (e.begruendung ? "Warum relevant" : "Worum es geht") + "</h3><p>" + esc(e.begruendung || e.fokus) + '</p><div class="rollen">' + (e.rolle || []).map(function (r) { return '<span class="rolle">' + esc(r) + "</span>"; }).join("") + "</div></section>";
    var bar = function (name, gew, wert, hinweis) {
      return '<div class="sc"><span>' + name + "<small>" + gew + (hinweis ? ", " + hinweis : "") + '</small></span><span class="sc-bar"><i style="width:' + wert * 20 + '%"></i></span><b>' + wert + "</b></div>";
    };
    h += '<section class="p-abschnitt"><h3>Bewertung</h3><div class="scores">' +
      bar("Relevanz", "40 %", sc.relevanz) + bar("Zugang", "30 %", sc.zugang) + bar("Aufwand", "20 %", sc.aufwand, "5 = gering") + bar("Verlässlichkeit", "10 %", sc.verlaesslichkeit) +
      '</div><div class="sc-gesamt">Gesamtscore ' + schild(e.prioritaet, e.gesamt) + "</div></section>";
    h += '<details class="p-mehr"><summary>Alle Angaben</summary><dl class="angaben">' +
      zeile("Veranstalter", e.veranstalter) + zeile("Format", e.format + " (" + e.kategorie + ")") + zeile("Branchen", (e.branchen || []).join(", ")) + zeile("Ort", e.ort) + zeile("Land / Bundesland", e.region) +
      zeile("Rubrik", RUBRIK[e.rubrik]) + zeile("Start und Ende", de(e.start) + (e.ende !== e.start ? " – " + de(e.ende) : "")) + zeile("Turnus", e.turnus) +
      zeile("Üblicher Zeitraum", e.zeitraum) + zeile("Terminstatus", e.status) +
      zeile("Anmeldeschluss", e.anmeldeschluss ? de(e.anmeldeschluss) + (e.frist_art ? " – " + e.frist_art : "") : "") + zeile("Anmeldung", e.anmeldung) +
      zeile("Kosten", e.kosten) + zeile("Zielgruppe", e.zielgruppe) + zeile("Themenfokus", e.fokus) + zeile("Empfohlene Rolle", (e.rolle || []).join(", ")) +
      '<dt>Quelle</dt><dd><a href="' + esc(e.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(e.quelle)) + "</a></dd>" + zeile("Zuletzt geprüft", de(e.geprueft)) +
      "</dl></details></div>";
    h += '<div class="p-leiste"><a class="knopf signal" href="' + esc(e.quelle) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Zur Veranstaltung</a>" +
      (vorbei(e) ? "" : '<button type="button" class="knopf leise" data-ics="' + esc(e.id) + '">' + I.kalPlus + "In Kalender</button>") + "</div>";
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
    var h = panelKopf("Start-up, " + s.region, s.id, s.name) + '<div class="p-inhalt">' + motivBild(s);
    h += '<div class="p-logo-zeile">' + logo(s, true) + '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' + schild(s.prioritaet, null, true) + (s.quickwin ? '<span class="quick-badge">Quick Win</span>' : "") + suchfeldTag(s.suchfeld) + "</div></div>";
    h += '<div class="p-branchen">' + (s.branchen || []).map(function (w) { return '<span class="ev-br" style="--f:' + BRANCHE_FARBE[w] + '">' + brIcon(w) + esc(w) + "</span>"; }).join("") + "</div>";
    h += '<h2 id="panel-titel">' + esc(s.name) + "</h2>";
    h += '<div class="p-fakten">' + fakt(I.ort, "<strong>" + esc(s.sitz) + "</strong>" + (s.land && s.land !== "DE" ? ", " + esc(LAND[s.land] || s.land) : "") + (s.gruendung && s.gruendung !== "k. A." ? ", gegründet " + esc(s.gruendung) : "")) +
      (s.reifegrad ? fakt(I.rakete, esc(s.reifegrad)) : "") + "</div>";
    h += '<section class="p-abschnitt p-warum"><h3>' + I.info + "Lösung</h3><p>" + esc(s.loesung) + "</p></section>";
    if (s.mehrwert || s.kooperation) h += '<section class="p-abschnitt"><h3>Möglicher Mehrwert</h3>' + (s.mehrwert ? "<p>" + esc(s.mehrwert) + "</p>" : "") + (s.kooperation ? "<p><strong>Mögliche Kooperation:</strong> " + esc(s.kooperation) + "</p>" : "") + "</section>";
    h += '<section class="p-abschnitt"><h3>Finanzierung und Investoren</h3><p>' + esc(s.finanzierung || "Keine öffentlichen Angaben erfasst.") + "</p>" +
      (runden.length ? '<ol class="rundenzeit">' + runden.map(rundeZeit).join("") + "</ol>" : "") +
      ((s.investoren_alle || []).length ? '<p class="klein" style="margin:12px 0 6px">Öffentlich bekannte Investoren</p><div class="inv-chips">' + s.investoren_alle.map(investorChip).join("") + "</div>" : "") +
      geteilteInvestoren(s) + "</section>";
    var bar = function (name, hinweis, wert) { return '<div class="sc"><span>' + name + "<small>" + hinweis + '</small></span><span class="sc-bar"><i style="width:' + wert * 20 + '%"></i></span><b>' + wert + "</b></div>"; };
    h += '<section class="p-abschnitt"><h3>Einordnung</h3><div class="scores">' + bar("Relevanz", "5 = sehr relevant", s.relevanz) + bar("Aufwand", "1 = gering", s.aufwand) + "</div></section>";
    h += '<details class="p-mehr"><summary>Alle Angaben</summary><dl class="angaben">' +
      zeile("Sitz", s.sitz) + zeile("Land", LAND[s.land] || s.land) + zeile("Region", s.region) + zeile("Branchen", (s.branchen || []).join(", ")) + zeile("Gründungsjahr", s.gruendung) + zeile("Suchfeld", s.suchfeld) + zeile("Reifegrad", s.reifegrad) +
      zeile("Finanzierung", s.finanzierung) + zeile("Anbindung", s.anbindung) + zeile("Mögliche Kooperationsform", s.kooperation) +
      zeile("Bewertung", "Relevanz " + s.relevanz + "/5, Umsetzungsaufwand " + s.aufwand + "/5 (1 = gering), Priorität " + s.prioritaet) +
      "<dt>Website</dt><dd>" + (s.website ? '<a href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(s.website)) + "</a>" : "k. A.") + "</dd>" +
      '<dt>Quelle</dt><dd><a href="' + esc(s.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(s.quelle)) + "</a></dd>" + zeile("Zuletzt geprüft", de(s.geprueft)) +
      "</dl></details></div>";
    h += '<div class="p-leiste">' + (s.website ? '<a class="knopf signal" href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer">' + I.link + "Website</a>" : "") +
      '<a class="knopf leise" href="' + esc(s.quelle) + '" target="_blank" rel="noopener noreferrer">' + I.datei + "Quelle</a></div>";
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
        var t = [s.name, s.sitz, s.region, s.loesung, s.suchfeld, s.mehrwert, s.reifegrad, (s.branchen || []).join(" ")].join(" ").toLowerCase();
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
      var reihe = { event: 0, su: 1, deal: 2, inv: 3 };
      treffer.sort(function (a, b) { return reihe[a.typ] - reihe[b.typ]; });
    }
    sucheListe = treffer;
    if (sucheAuswahl >= treffer.length) sucheAuswahl = 0;
    var mark = function (text) {
      var h = esc(text);
      w.forEach(function (x) { if (x.length < 2) return; var re = new RegExp("(" + esc(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"); h = h.replace(re, "<mark>$1</mark>"); });
      return h;
    };
    var GRUPPE = { event: "Termine", su: "Start-ups", inv: "Investoren", deal: "Deals" };
    var letzte = null;
    sucheTreffer.innerHTML = treffer.length ? treffer.map(function (t, i) {
      var x = t.x;
      var sub = t.typ === "event" ? x.ort + (vorbei(x) ? " · vorbei" : " · " + relativ(x))
        : t.typ === "su" ? x.sitz + " · " + (x.loesung || "")
        : t.typ === "inv" ? x.typ + " · " + x.sitz
        : x.runde + " · " + x.betrag + " · " + monatJahr(x.datum);
      var name = t.typ === "deal" ? x.unternehmen : x.name;
      var bild = t.typ === "event" ? '<span class="st-datum"><b>' + dt(x.start).getDate() + "</b>" + MON_KURZ[dt(x.start).getMonth()] + "</span>"
        : t.typ === "su" ? logo(x) : '<span class="st-icon">' + (t.typ === "inv" ? I.leute : I.euro) + "</span>";
      var rechts = t.typ === "event" || t.typ === "su" ? schild(x.prioritaet) : "";
      var kopf = "";
      if (t.typ !== letzte) { kopf = '<li class="st-gruppe" role="presentation">' + (w.length ? GRUPPE[t.typ] : t.typ === "event" ? "Als Nächstes" : "Quick Wins") + "</li>"; letzte = t.typ; }
      return kopf + '<li role="option" id="st-' + i + '" data-i="' + i + '" aria-selected="' + (i === sucheAuswahl) + '">' + bild +
        '<span class="st-text"><span class="st-name">' + mark(name) + '</span><span class="st-sub">' + esc(sub) + "</span></span>" + rechts + "</li>";
    }).join("") : '<li class="suche-leer" role="presentation">Nichts gefunden. Anderen Begriff versuchen, zum Beispiel einen Ort oder ein Thema.</li>';
    sucheFeld.setAttribute("aria-activedescendant", treffer.length ? "st-" + sucheAuswahl : "");
  }
  function sucheWaehle(i) {
    var t = sucheListe[i]; if (!t) return;
    suche.close();
    var ids = sucheListe.filter(function (x) { return x.typ === t.typ; }).map(function (x) { return x.x.id; });
    oeffnePanel(t.typ, t.x.id, ids);
  }
  sucheFeld.addEventListener("input", function () { sucheAuswahl = 0; sucheRendern(); });
  var sucheTasten = function (ev) {
    if (ev.key === "ArrowDown") { sucheAuswahl = Math.min(sucheListe.length - 1, sucheAuswahl + 1); markiereSuche(); ev.preventDefault(); }
    if (ev.key === "ArrowUp") { sucheAuswahl = Math.max(0, sucheAuswahl - 1); markiereSuche(); ev.preventDefault(); }
    if (ev.key === "Enter") { sucheWaehle(sucheAuswahl); ev.preventDefault(); }
  };
  sucheFeld.addEventListener("keydown", sucheTasten);
  sucheTreffer.addEventListener("keydown", sucheTasten);
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

  /* ---------- Aufklappmenüs (Filter, Export): data-pop öffnet das Menü mit dieser ID ---------- */
  function schliessePops(ausser) {
    $$(".pop:not([hidden])").forEach(function (p) {
      if (p === ausser) return;
      p.hidden = true;
      var k = $('[data-pop="' + p.id + '"]'); if (k) k.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("click", function (ev) {
    var k = ev.target.closest("[data-pop]");
    if (k) {
      var p = document.getElementById(k.getAttribute("data-pop"));
      if (!p) return;
      var auf = p.hidden;
      schliessePops(p);
      p.hidden = !auf; k.setAttribute("aria-expanded", auf ? "true" : "false");
      if (auf) { var erstes = $("select, input, .pop-eintrag", p); if (erstes) erstes.focus({ preventScroll: true }); }
      return;
    }
    if (ev.target.closest("[data-pop-zu]")) {
      var pz = ev.target.closest(".pop"); schliessePops();
      var kk = pz && $('[data-pop="' + pz.id + '"]'); if (kk) kk.focus();
      return;
    }
    if (ev.target.closest(".pop-eintrag")) { setTimeout(schliessePops, 0); return; }
    if (!ev.target.closest(".pop")) schliessePops();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    var offen = $(".pop:not([hidden])"); if (!offen) return;
    schliessePops(); var k = $('[data-pop="' + offen.id + '"]'); if (k) k.focus();
  });

  /* ============================================================
     Allgemeine Klicks (Delegation)
     ============================================================ */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-stern],[data-ics],[data-oeffne],[data-oeffne-su],[data-oeffne-deal],[data-oeffne-inv],[data-oeffne-intern],[data-dl],[data-hilfe],[data-panel-zu],[data-blaettern]");
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
      var karte = t.closest(".ev");
      var kontext = k === "held" ? heldListe().map(function (x) { return x.id; })
        : k === "liste" ? S.liste.map(function (x) { return x.id; })
        : k === "zs" ? $$("[data-kontext=zs]", t.closest(".zs")).map(function (x) { return x.getAttribute("data-oeffne"); }).sort(function (a, b) { return nachStart(findeEvent(a), findeEvent(b)); })
        : S.route === "merkliste" ? (S.merkEv || []).map(function (x) { return x.id; }) : null;
      return karte ? oeffneMitMorph(karte, "event", id, kontext) : oeffnePanel("event", id, kontext);
    }
    if (t.hasAttribute("data-oeffne-su")) {
      var kont = S.route === "startups" ? S.suListe.map(function (x) { return x.id; }) : S.route === "merkliste" ? (S.merkSu || []).map(function (x) { return x.id; }) : S.startups.filter(function (s) { return s.quickwin; }).map(function (x) { return x.id; });
      var suKarte = t.closest(".su-zeile");
      return suKarte ? oeffneMitMorph(suKarte, "su", t.getAttribute("data-oeffne-su"), kont) : oeffnePanel("su", t.getAttribute("data-oeffne-su"), kont);
    }
    if (t.hasAttribute("data-oeffne-deal")) {
      var dk = S.route === "kapital" && S.dealListe ? S.dealListe : S.runden;
      return oeffnePanel("deal", t.getAttribute("data-oeffne-deal"), dk.map(function (x) { return x.id; }));
    }
    if (t.hasAttribute("data-oeffne-intern")) return oeffnePanel("intern", t.getAttribute("data-oeffne-intern"), (S.iListe || []).map(function (x) { return x._id; }));
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
    store.set("radar-theme-2", neu);
    toast(neu === "dark" ? "Dunkles Farbschema" : "Helles Farbschema");
  });
  // Standard ist das Schiefer-Farbschema der Seitenköpfe; Hell lässt sich oben umschalten und bleibt in diesem Browser gespeichert.

  /* ============================================================
     Herunterladen & Drucken
     ============================================================ */
  function herunterladen(art, quelle) {
    if (quelle === "intern") {
      if (!S.iDaten) return;
      var is = iSammlung(), il = S.iListe || [];
      if (art === "druck") { S.druck = { art: "intern", liste: il, titel: is.titel }; return setTimeout(function () { window.print(); }, 30); }
      if (!il.length) return toast("Die Auswahl ist leer – erst Filter anpassen.");
      var nmI = "intern-" + is.titel.replace(/&/g, "und");
      if (art === "csv") X.download(X.buildCSV(il, iSpalten(is)), dateiname(nmI, "csv"), "text/csv;charset=utf-8");
      if (art === "xlsx") X.download(X.buildXLSX(il, iSpalten(is), is.titel.replace(/[^A-Za-zÄÖÜäöüß0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 31) || "Intern"), dateiname(nmI, "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return toast((art === "xlsx" ? "Excel-Datei" : "CSV-Datei") + " mit " + plural(il.length, is.einzahl || "Eintrag", is.mehrzahl || "Einträgen") + " geladen");
    }
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
    var internHtml = function (x) {
      var s = iSammlung();
      return '<div class="d-ev"><div class="d-datum">' + esc(x[(s.meta || [{}])[0].feld] || "") + "</div><div><h2>" + esc(x[s.titelFeld] || "") + "</h2>" + (s.textFeld && x[s.textFeld] ? "<p>" + esc(x[s.textFeld]) + "</p>" : "") +
        dl((s.details || []).map(function (dd) { return [dd[0], iWertText(dd[2], x[dd[1]], x)]; })) + "</div></div>";
    };
    if (d.art === "intern-leer") h = "<h1>Intern</h1><p>Geschützter Bereich – Inhalte nur nach Entsperren.</p>";
    else if (d.art === "intern") h = "<h1>" + esc(d.titel) + '</h1><p class="d-meta">Interner Bereich, Stand ' + esc(de(S.iDaten && S.iDaten.stand)) + ", gedruckt am " + esc(de(S.heute)) + ".</p>" + (S.iDaten ? d.liste.map(internHtml).join("") : "");
    else if (d.art === "runden") h += d.liste.map(dealHtml).join("");
    else if (d.art === "investoren") h += d.liste.map(invHtml).join("");
    else if (d.art === "startups") h += d.liste.map(suHtml).join("");
    else if (d.art === "beide") h += d.liste.map(evHtml).join("") + (d.su.length ? "<h1 style=\"margin-top:8mm\">Start-ups</h1>" + d.su.map(suHtml).join("") : "");
    else h += d.liste.map(evHtml).join("");
    if (d.art !== "intern-leer" && !d.liste.length && !(d.su && d.su.length)) h += "<p>Die Auswahl ist leer.</p>";
    $("#druck").innerHTML = h;
  });
  window.addEventListener("afterprint", function () { $("#druck").innerHTML = ""; });
})();
