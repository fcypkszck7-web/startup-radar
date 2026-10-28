/* Start-up- & Event-Radar – Seitenlogik. Statisch, ohne Server, ohne Cookies. */
(function () {
  "use strict";
  var X = window.RadarExport;

  var RUBRIK = { region: "Region Regensburg", de: "Deutschland", eu: "EU", noneu: "Schweiz, UK, Norwegen" };
  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var WTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var TABS = {
    uebersicht: "Übersicht",
    alle: "Alle Termine",
    region: "Region Regensburg",
    de: "Deutschland",
    eu: "EU & Europa",
    startups: "Start-ups",
    archiv: "Archiv"
  };
  var TAB_TEXT = {
    alle: "Alle kommenden Veranstaltungen aus allen Rubriken.",
    region: "Oberpfalz, Niederbayern, Landkreis Kelheim und Umgebung bis etwa 100 km um Neutraubling. München und Nürnberg stehen unter Deutschland.",
    de: "Übriges Deutschland einschließlich München und Nürnberg.",
    eu: "EU-Staaten ohne Deutschland, Schwerpunkt Österreich und große europäische Start-up-Events. Darunter gesondert: wichtige Termine in der Schweiz, im Vereinigten Königreich und in Norwegen.",
    archiv: "Vergangene Veranstaltungen – zum Nachschlagen und für die Planung im nächsten Jahr."
  };

  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* Speicher nicht verfügbar */ } }
  };

  var S = {
    events: [], startups: [], meta: {}, hinweise: [], heute: heuteISO(), tab: "uebersicht", ansicht: "liste",
    f: { prio: { A: true, B: true, C: true }, kat: "", monat: "", rubrik: "", q: "", merk: false, best: false },
    sf: { feld: "", region: "", q: "", merk: false },
    kal: null, liste: [], suListe: []
  };
  var merk = new Set(store.get("radar-merkliste", []));

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function heuteISO() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addTage(iso, n) { var p = iso.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function de(iso) { if (!iso) return ""; var p = iso.split("-"); return p[2] + "." + p[1] + "." + p[0]; }
  function wtag(iso) { var p = iso.split("-"); return WTAG[new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; }
  function komma(x) { return String(x).replace(".", ","); }
  function zeitraum(e) {
    if (e.start === e.ende) return wtag(e.start) + ", " + de(e.start);
    var a = e.start.split("-"), b = e.ende.split("-");
    if (a[0] === b[0] && a[1] === b[1]) return a[2] + ".–" + b[2] + "." + b[1] + "." + b[0];
    if (a[0] === b[0]) return a[2] + "." + a[1] + ".–" + b[2] + "." + b[1] + "." + b[0];
    return de(e.start) + " – " + de(e.ende);
  }
  function monatLabel(ym) { var p = ym.split("-"); return MONATE[+p[1] - 1] + " " + p[0]; }
  function vorbei(e) { return e.ende < S.heute; }
  function dateiname(teil, ext) { return "startup-radar-" + teil.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "") + "-" + S.heute + "." + ext; }
  function site() { return S.meta.site_url || (location.origin + location.pathname.replace(/index\.html$/, "")); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function prioBadge(p, g) {
    var t = g != null ? "Priorität " + p + ", Gesamtscore " + komma(g) : "Priorität " + p;
    return '<span class="prio prio-' + p + '" title="' + esc(t) + '">' + p + (g != null ? " · " + komma(g) : "") + "</span>";
  }
  function statusBadge(e) {
    return e.status === "bestätigt"
      ? '<span class="status ok" title="Termin vom Veranstalter veröffentlicht">bestätigt</span>'
      : '<span class="status schaetz" title="Aus dem Vorjahr abgeleitet – vor der Planung prüfen">geschätzt</span>';
  }
  function stern(id, name) {
    var an = merk.has(id);
    return '<button type="button" class="stern' + (an ? " an" : "") + '" data-stern="' + esc(id) + '" aria-pressed="' + an +
      '" title="' + (an ? "Von der Merkliste nehmen" : "Auf die Merkliste") + '" aria-label="' + esc((an ? "Von der Merkliste nehmen: " : "Merken: ") + name) + '">' + (an ? "★" : "☆") + "</button>";
  }

  /* ---------- Laden ---------- */
  function lade(pfad) {
    return fetch(pfad + "?v=" + Date.now(), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(pfad + ": " + r.status);
      return r.json();
    });
  }

  Promise.all([lade("data/events.json"), lade("data/startups.json"), lade("data/meta.json"), lade("data/hinweise.json").catch(function () { return []; })])
    .then(function (r) {
      S.events = r[0]; S.startups = r[1]; S.meta = r[2]; S.hinweise = r[3] || [];
      $("#stand").textContent = "Stand: " + de(S.meta.stand);
      if (!store.get("radar-hilfe-aus", false)) $("#hilfe").hidden = false;
      routen();
    })
    .catch(function (err) {
      $("#ansicht").innerHTML = '<div class="hinweis-fehler"><h2>Daten konnten nicht geladen werden</h2><p>Bitte die Seite neu laden. (' + esc(err.message) + ")</p></div>";
    });

  window.addEventListener("hashchange", routen);
  $("#hilfe-zeigen").addEventListener("click", function () { $("#hilfe").hidden = false; store.set("radar-hilfe-aus", false); $("#hilfe").scrollIntoView({ behavior: "smooth" }); });
  $("#hilfe-schliessen").addEventListener("click", function () { $("#hilfe").hidden = true; store.set("radar-hilfe-aus", true); });
  $("#dialog-zu").addEventListener("click", function () { $("#dialog").close(); });
  $("#dialog").addEventListener("click", function (ev) { if (ev.target === this) this.close(); });

  function routen() {
    var t = (location.hash || "#uebersicht").slice(1);
    if (!TABS[t]) t = "uebersicht";
    if (t !== S.tab) { S.f.rubrik = ""; S.f.monat = ""; S.kal = null; }
    S.tab = t;
    $$(".reiter a").forEach(function (a) { var an = a.getAttribute("data-tab") === t; a.classList.toggle("aktiv", an); if (an) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.title = TABS[t] + " – Start-up- & Event-Radar";
    if (t === "uebersicht") zeigeUebersicht();
    else if (t === "startups") zeigeStartups();
    else zeigeEvents();
  }

  /* ---------- Umfang je Reiter ---------- */
  function umfang() {
    var aktiv = S.events.filter(function (e) { return !vorbei(e); });
    switch (S.tab) {
      case "region": return aktiv.filter(function (e) { return e.rubrik === "region"; });
      case "de": return aktiv.filter(function (e) { return e.rubrik === "de"; });
      case "eu": return aktiv.filter(function (e) { return e.rubrik === "eu" || e.rubrik === "noneu"; });
      case "archiv": return S.events.filter(vorbei).sort(function (a, b) { return a.start < b.start ? 1 : -1; });
      default: return aktiv;
    }
  }
  function filtere(liste) {
    var f = S.f, q = f.q.trim().toLowerCase();
    return liste.filter(function (e) {
      if (!f.prio[e.prioritaet]) return false;
      if (f.kat && e.kategorie !== f.kat) return false;
      if (f.rubrik && e.rubrik !== f.rubrik) return false;
      if (f.monat && !(e.start.slice(0, 7) <= f.monat && e.ende.slice(0, 7) >= f.monat)) return false;
      if (f.merk && !merk.has(e.id)) return false;
      if (f.best && e.status !== "bestätigt") return false;
      if (q) {
        var t = [e.name, e.format, e.kategorie, e.veranstalter, e.ort, e.region, e.fokus, e.zielgruppe, e.begruendung].join(" ").toLowerCase();
        if (q.split(/\s+/).some(function (w) { return t.indexOf(w) < 0; })) return false;
      }
      return true;
    });
  }

  /* ---------- Übersicht ---------- */
  function zeigeUebersicht() {
    var aktiv = S.events.filter(function (e) { return !vorbei(e); }).sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
    var zahl = { A: 0, B: 0, C: 0 }, tab = {};
    aktiv.forEach(function (e) { zahl[e.prioritaet]++; tab[e.rubrik] = tab[e.rubrik] || { A: 0, B: 0, C: 0 }; tab[e.rubrik][e.prioritaet]++; });
    var naechste = aktiv.slice(0, 10);
    var bis = addTage(S.heute, 30);
    var fristen = S.events.filter(function (e) { return e.anmeldeschluss && e.anmeldeschluss >= S.heute && e.anmeldeschluss <= bis; })
      .sort(function (a, b) { return a.anmeldeschluss < b.anmeldeschluss ? -1 : 1; });
    var quick = S.startups.filter(function (s) { return s.quickwin; });
    var hinweis = S.hinweise.slice().sort(function (a, b) { return a.datum < b.datum ? 1 : -1; })[0];
    var feedUrl = site() + "feed.xml", icsUrl = site() + "events.ics";
    var webcal = icsUrl.replace(/^https?:/, "webcal:");

    var h = "";
    h += '<div class="kennzahlen">' +
      kennzahl(aktiv.length, "kommende Veranstaltungen") +
      kennzahl(zahl.A, "Priorität A", "A") + kennzahl(zahl.B, "Priorität B", "B") + kennzahl(zahl.C, "Priorität C", "C") +
      kennzahl(S.startups.length, "Start-ups, davon " + quick.length + " Quick Wins") + "</div>";

    h += '<div class="raster-2">';
    h += '<section class="kasten"><h2>Die nächsten 10 Termine</h2><ol class="kurzliste">' +
      naechste.map(function (e) {
        return '<li><span class="kl-datum">' + esc(zeitraum(e)) + "</span>" + prioBadge(e.prioritaet) +
          ' <button type="button" class="linkknopf" data-details="' + esc(e.id) + '">' + esc(e.name) + "</button>" +
          '<span class="kl-ort">' + esc(e.ort) + (e.status === "geschätzt" ? " · geschätzt" : "") + "</span></li>";
      }).join("") + '</ol><p><a href="#alle">Alle Termine ansehen →</a></p></section>';

    h += '<div class="stapel">';
    h += '<section class="kasten"><h2>Stand ' + esc(de(S.meta.stand)) + "</h2><p class=\"klein\">Was sich bei der letzten Aktualisierung geändert hat:</p><ul>" +
      (S.meta.aenderungen || []).map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul></section>";
    h += '<section class="kasten"><h2>Fristen in den nächsten 30 Tagen</h2>' +
      (fristen.length ? '<ul class="kurzliste">' + fristen.map(function (e) {
        return '<li><span class="kl-datum">' + esc(de(e.anmeldeschluss)) + '</span> <button type="button" class="linkknopf" data-details="' +
          esc(e.id) + '">' + esc(e.name) + '</button><span class="kl-ort">' + esc(e.frist_art || "Anmeldeschluss") + "</span></li>";
      }).join("") + "</ul>" : "<p>Keine bekannten Fristen in den nächsten 30 Tagen.</p>") + "</section>";
    h += '<section class="kasten"><h2>Verteilung nach Priorität</h2><table class="tabelle"><thead><tr><th>Rubrik</th><th>A</th><th>B</th><th>C</th></tr></thead><tbody>' +
      ["region", "de", "eu", "noneu"].map(function (r) {
        var t = tab[r] || { A: 0, B: 0, C: 0 };
        return "<tr><th scope=\"row\">" + esc(RUBRIK[r]) + "</th><td>" + t.A + "</td><td>" + t.B + "</td><td>" + t.C + "</td></tr>";
      }).join("") + "</tbody></table></section>";
    h += "</div></div>";

    h += '<div class="raster-3">';
    h += '<section class="kasten"><h2>Wochenhinweis zum Weiterleiten</h2>' +
      (hinweis ? '<p class="klein">Vom ' + esc(de(hinweis.datum)) + '</p><pre class="hinweistext" id="hinweistext">' + esc(hinweis.text) + "</pre>" +
        '<div class="knopfreihe"><button type="button" class="knopf" id="hinweis-kopieren">Text kopieren</button>' +
        '<a class="knopf leise" href="mailto:?subject=' + encodeURIComponent(hinweis.titel) + "&body=" + encodeURIComponent(hinweis.text) + '">Als E-Mail öffnen</a></div>'
        : "<p>Aktuell steht nichts an.</p>") + "</section>";

    h += '<section class="kasten"><h2>E-Mail-Hinweise abonnieren</h2>' +
      "<p>Wenn in den nächsten 30 Tagen etwas ansteht, erscheint ein kurzer Wochenhinweis. Du kannst ihn kostenlos per E-Mail bekommen – an eine Adresse deiner Wahl.</p>" +
      '<ol class="schritte"><li>Auf „Per E-Mail abonnieren“ klicken. Es öffnet sich der Dienst Feedrabbit.</li><li>Dort deine E-Mail-Adresse eintragen und bestätigen.</li><li>Abmelden geht jederzeit über den Link in jeder Mail.</li></ol>' +
      '<a class="knopf" target="_blank" rel="noopener noreferrer" href="https://feedrabbit.com/subscriptions/new?url=' + encodeURIComponent(feedUrl) + '">Per E-Mail abonnieren</a>' +
      '<p class="klein">Feedrabbit ist ein externer, werbefreier Dienst; deine Adresse wird dort gespeichert, nicht auf dieser Seite. Der Versand erfolgt wenige Stunden nach der Aktualisierung.</p></section>';

    h += '<section class="kasten"><h2>Kalender abonnieren (Outlook)</h2>' +
      "<p>Alle kommenden Termine als Internetkalender, der sich selbst aktualisiert:</p>" +
      '<div class="kopierfeld"><input type="text" readonly value="' + esc(icsUrl) + '" id="abo-url" aria-label="Kalender-Abo-Link"><button type="button" class="knopf leise" id="abo-kopieren">Kopieren</button></div>' +
      '<ol class="schritte"><li><strong>Outlook im Web / neues Outlook:</strong> Kalender → „Kalender hinzufügen“ → „Aus dem Internet abonnieren“ → Link einfügen → „Importieren“.</li>' +
      "<li><strong>Klassisches Outlook (Windows):</strong> Kalender → „Kalender hinzufügen“ → „Aus dem Internet …“ → Link einfügen → OK.</li></ol>" +
      '<p><a class="knopf leise" href="' + esc(webcal) + '">Direkt in Kalender-App öffnen</a></p>' +
      '<p class="klein">Abonnierte Kalender aktualisiert Outlook selbst, je nach Version alle paar Stunden bis einmal täglich. Erinnerungen aus Abos übernimmt Outlook meist nicht – dafür bei einzelnen Terminen „In Kalender speichern“ nutzen.</p></section>';
    h += "</div>";

    h += '<section class="kasten"><h2>So wird priorisiert</h2>' +
      "<p>Jede Veranstaltung wird in vier Kriterien mit 1–5 Punkten bewertet: <strong>Relevanz</strong> für Dach, Solar, Bau, Handwerk, Metall und Nachhaltigkeit (40 %), <strong>Zugang</strong> zu Start-ups, Entscheidern und Investoren (30 %), <strong>Aufwand</strong> durch Entfernung, Kosten und Zeit (20 %, 5 = geringer Aufwand) und <strong>Verlässlichkeit</strong> und Regelmäßigkeit (10 %).</p>" +
      "<p>Daraus ergibt sich der Gesamtscore: <strong>A</strong> ab 4,0 · <strong>B</strong> von 3,0 bis 3,9 · <strong>C</strong> unter 3,0. Start-ups werden nach Relevanz und Umsetzungsaufwand eingeordnet; Quick Wins sind hohe Relevanz bei geringem Aufwand.</p></section>";

    $("#ansicht").innerHTML = h;
    var k = $("#hinweis-kopieren");
    if (k) k.addEventListener("click", function () { kopiere(hinweis.text, k); });
    $("#abo-kopieren").addEventListener("click", function () { kopiere(icsUrl, $("#abo-kopieren")); });
    bindeAllgemein($("#ansicht"));
  }
  function kennzahl(n, label, p) {
    return '<div class="kennzahl' + (p ? " k-" + p : "") + '"><span class="kz-zahl">' + n + '</span><span class="kz-label">' + esc(label) + "</span></div>";
  }
  function kopiere(text, knopf) {
    var fertig = function () { var alt = knopf.textContent; knopf.textContent = "Kopiert ✓"; setTimeout(function () { knopf.textContent = alt; }, 1800); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(fertig, alt); } else alt();
    function alt() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); fertig(); } catch (e) { /* ignorieren */ } ta.remove();
    }
  }

  /* ---------- Veranstaltungen ---------- */
  function zeigeEvents() {
    var basis = umfang();
    var kats = uniq(basis.map(function (e) { return e.kategorie; })).sort();
    var monate = [];
    basis.forEach(function (e) { var m = e.start.slice(0, 7); while (m <= e.ende.slice(0, 7)) { if (monate.indexOf(m) < 0) monate.push(m); m = naechsterMonat(m); } });
    monate.sort(); if (S.tab === "archiv") monate.reverse();
    var f = S.f;
    var h = '<div class="bereich-kopf"><h2>' + esc(TABS[S.tab]) + "</h2><p>" + esc(TAB_TEXT[S.tab] || "") + "</p></div>";
    h += '<div class="werkzeug" role="search">' +
      '<div class="filter-zeile">' +
      '<label class="suche"><span class="vh">Suchen</span><input type="search" id="f-q" placeholder="Suchen, z. B. Solar, München, Pitch" value="' + esc(f.q) + '"></label>' +
      '<div class="prio-wahl" role="group" aria-label="Priorität">' + ["A", "B", "C"].map(function (p) {
        return '<button type="button" class="prio-chip prio-' + p + (f.prio[p] ? " an" : "") + '" data-prio="' + p + '" aria-pressed="' + f.prio[p] + '">' + p + "</button>";
      }).join("") + "</div>" +
      '<label><span class="vh">Format</span><select id="f-kat"><option value="">Alle Formate</option>' + kats.map(function (k) { return "<option" + (k === f.kat ? " selected" : "") + ">" + esc(k) + "</option>"; }).join("") + "</select></label>" +
      '<label><span class="vh">Monat</span><select id="f-monat"><option value="">Alle Monate</option>' + monate.map(function (m) { return '<option value="' + m + '"' + (m === f.monat ? " selected" : "") + ">" + esc(monatLabel(m)) + "</option>"; }).join("") + "</select></label>" +
      (S.tab === "alle" ? '<label><span class="vh">Rubrik</span><select id="f-rubrik"><option value="">Alle Rubriken</option>' + ["region", "de", "eu", "noneu"].map(function (r) { return '<option value="' + r + '"' + (r === f.rubrik ? " selected" : "") + ">" + esc(RUBRIK[r]) + "</option>"; }).join("") + "</select></label>" : "") +
      '<label class="haken"><input type="checkbox" id="f-merk"' + (f.merk ? " checked" : "") + "> Nur Merkliste</label>" +
      '<label class="haken"><input type="checkbox" id="f-best"' + (f.best ? " checked" : "") + "> Nur bestätigte Termine</label>" +
      '<button type="button" class="knopf leise klein" id="f-reset">Filter zurücksetzen</button>' +
      "</div>" +
      '<div class="aktion-zeile">' +
      '<div class="umschalter" role="group" aria-label="Ansicht"><button type="button" data-ansicht="liste" aria-pressed="' + (S.ansicht === "liste") + '">Liste</button><button type="button" data-ansicht="kalender" aria-pressed="' + (S.ansicht === "kalender") + '">Kalender</button></div>' +
      '<span class="anzahl" id="anzahl"></span>' +
      '<div class="downloads"><span class="dl-label">Auswahl herunterladen:</span>' +
      '<button type="button" class="knopf leise klein" data-dl="ics">Kalender (.ics)</button>' +
      '<button type="button" class="knopf leise klein" data-dl="xlsx">Excel</button>' +
      '<button type="button" class="knopf leise klein" data-dl="csv">CSV</button>' +
      '<button type="button" class="knopf leise klein" data-dl="druck">Drucken / PDF</button></div>' +
      "</div></div>" +
      '<div id="ergebnis"></div>';
    $("#ansicht").innerHTML = h;

    var q = $("#f-q");
    q.addEventListener("input", function () { S.f.q = q.value; aktualisiere(); });
    $$(".prio-chip").forEach(function (b) {
      b.addEventListener("click", function () { var p = b.getAttribute("data-prio"); S.f.prio[p] = !S.f.prio[p]; b.classList.toggle("an", S.f.prio[p]); b.setAttribute("aria-pressed", S.f.prio[p]); aktualisiere(); });
    });
    $("#f-kat").addEventListener("change", function () { S.f.kat = this.value; aktualisiere(); });
    $("#f-monat").addEventListener("change", function () { S.f.monat = this.value; if (this.value) S.kal = this.value; aktualisiere(); });
    if ($("#f-rubrik")) $("#f-rubrik").addEventListener("change", function () { S.f.rubrik = this.value; aktualisiere(); });
    $("#f-merk").addEventListener("change", function () { S.f.merk = this.checked; aktualisiere(); });
    $("#f-best").addEventListener("change", function () { S.f.best = this.checked; aktualisiere(); });
    $("#f-reset").addEventListener("click", function () {
      S.f = { prio: { A: true, B: true, C: true }, kat: "", monat: "", rubrik: "", q: "", merk: false, best: false }; S.kal = null; zeigeEvents();
    });
    $$("[data-ansicht]").forEach(function (b) {
      b.addEventListener("click", function () { S.ansicht = b.getAttribute("data-ansicht"); $$("[data-ansicht]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); aktualisiere(); });
    });
    $$("[data-dl]").forEach(function (b) { b.addEventListener("click", function () { herunterladen(b.getAttribute("data-dl")); }); });
    aktualisiere();
  }

  function aktualisiere() {
    var liste = filtere(umfang());
    S.liste = liste;
    var n = liste.length;
    $("#anzahl").textContent = n + (n === 1 ? " Veranstaltung" : " Veranstaltungen");
    var ziel = $("#ergebnis");
    if (S.ansicht === "kalender") ziel.innerHTML = kalender(liste);
    else if (!n) ziel.innerHTML = '<p class="leer">Keine Veranstaltung passt zu den Filtern.</p>';
    else if (S.tab === "eu") {
      var eu = liste.filter(function (e) { return e.rubrik === "eu"; }), ne = liste.filter(function (e) { return e.rubrik === "noneu"; });
      ziel.innerHTML = '<div class="karten">' + eu.map(function (e) { return karteEvent(e); }).join("") + "</div>" +
        (ne.length ? '<h3 class="abschnitt-nicht-eu">Außerhalb der EU: Schweiz, Vereinigtes Königreich, Norwegen</h3><div class="karten nicht-eu">' + ne.map(function (e) { return karteEvent(e); }).join("") + "</div>" : "");
    } else ziel.innerHTML = '<div class="karten">' + liste.map(function (e) { return karteEvent(e); }).join("") + "</div>";
    bindeAllgemein(ziel);
    $$("[data-kal]", ziel).forEach(function (b) { b.addEventListener("click", function () { S.kal = b.getAttribute("data-kal"); aktualisiere(); }); });
  }

  function karteEvent(e, offen) {
    var frist = e.anmeldeschluss ? de(e.anmeldeschluss) + (e.frist_art ? " – " + e.frist_art : "") : "k. A.";
    var sc = e.scores;
    return '<article class="karte' + (vorbei(e) ? " vergangen" : "") + '" id="ev-' + esc(e.id) + '">' +
      '<div class="karte-kopf">' + prioBadge(e.prioritaet, e.gesamt) + '<span class="datum">' + esc(zeitraum(e)) + "</span>" + statusBadge(e) + stern(e.id, e.name) + "</div>" +
      "<h3>" + esc(e.name) + "</h3>" +
      '<p class="meta">' + esc(e.format) + " · " + esc(e.ort) + " · " + esc(e.region) + "</p>" +
      '<p class="begruendung">' + esc(e.begruendung) + "</p>" +
      '<div class="rollen">' + e.rolle.map(function (r) { return '<span class="rolle">' + esc(r) + "</span>"; }).join("") + "</div>" +
      '<div class="karte-aktionen"><button type="button" class="knopf klein" data-ics="' + esc(e.id) + '">In Kalender speichern</button>' +
      '<a class="knopf leise klein" href="' + esc(e.quelle) + '" target="_blank" rel="noopener noreferrer">Quelle öffnen</a></div>' +
      "<details" + (offen ? " open" : "") + "><summary>Alle Angaben</summary><dl class=\"angaben\">" +
      zeile("Veranstalter", e.veranstalter) + zeile("Format", e.format + " (" + e.kategorie + ")") + zeile("Ort", e.ort) +
      zeile("Land / Bundesland", e.region) + zeile("Rubrik", RUBRIK[e.rubrik]) +
      zeile("Start und Ende", de(e.start) + (e.ende !== e.start ? " – " + de(e.ende) : "")) +
      zeile("Turnus", e.turnus) + zeile("Üblicher Zeitraum", e.zeitraum) + zeile("Terminstatus", e.status) +
      zeile("Anmeldeschluss", frist) + zeile("Anmeldung", e.anmeldung || "k. A.") + zeile("Kosten", e.kosten) +
      zeile("Zielgruppe", e.zielgruppe) + zeile("Themenfokus", e.fokus) + zeile("Empfohlene Rolle", e.rolle.join(", ")) +
      zeile("Bewertung", "Relevanz " + sc.relevanz + "/5 · Zugang " + sc.zugang + "/5 · Aufwand " + sc.aufwand + "/5 (5 = gering) · Verlässlichkeit " + sc.verlaesslichkeit + "/5 → Gesamtscore " + komma(e.gesamt) + ", Priorität " + e.prioritaet) +
      '<dt>Quelle</dt><dd><a href="' + esc(e.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(e.quelle)) + "</a></dd>" +
      zeile("Zuletzt geprüft", de(e.geprueft)) +
      "</dl></details></article>";
  }
  function zeile(k, v) { return "<dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd>"; }
  function kurzUrl(u) { try { var x = new URL(u); return x.hostname.replace(/^www\./, "") + (x.pathname.length > 1 ? x.pathname.slice(0, 40) + (x.pathname.length > 40 ? "…" : "") : ""); } catch (e) { return u; } }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function naechsterMonat(ym) { var p = ym.split("-"); var y = +p[0], m = +p[1] + 1; if (m > 12) { m = 1; y++; } return y + "-" + pad(m); }
  function vorherMonat(ym) { var p = ym.split("-"); var y = +p[0], m = +p[1] - 1; if (m < 1) { m = 12; y--; } return y + "-" + pad(m); }

  /* ---------- Monatskalender ---------- */
  function kalender(liste) {
    if (!S.kal) {
      var erste = liste.slice().sort(function (a, b) { return a.start < b.start ? -1 : 1; })[0];
      S.kal = S.f.monat || (erste ? (erste.start < S.heute && !vorbei(erste) ? S.heute : erste.start).slice(0, 7) : S.heute.slice(0, 7));
    }
    var ym = S.kal, p = ym.split("-"), y = +p[0], m = +p[1];
    var erster = new Date(y, m - 1, 1), tage = new Date(y, m, 0).getDate();
    var versatz = (erster.getDay() + 6) % 7;
    var imMonat = liste.filter(function (e) { return e.start.slice(0, 7) <= ym && e.ende.slice(0, 7) >= ym; });
    var h = '<div class="kal-nav"><button type="button" class="knopf leise klein" data-kal="' + vorherMonat(ym) + '">← ' + esc(MONATE[(m + 10) % 12]) + "</button>" +
      "<h3>" + esc(monatLabel(ym)) + ' <span class="klein">(' + imMonat.length + ")</span></h3>" +
      '<button type="button" class="knopf leise klein" data-kal="' + naechsterMonat(ym) + '">' + esc(MONATE[m % 12]) + " →</button></div>";
    h += '<div class="kal" role="grid" aria-label="' + esc(monatLabel(ym)) + '">';
    ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach(function (w) { h += '<div class="kal-wt" role="columnheader">' + w + "</div>"; });
    for (var i = 0; i < versatz; i++) h += '<div class="kal-tag leer aussen" aria-hidden="true"></div>';
    for (var t = 1; t <= tage; t++) {
      var iso = y + "-" + pad(m) + "-" + pad(t);
      var hier = imMonat.filter(function (e) { return e.start <= iso && e.ende >= iso; });
      h += '<div class="kal-tag' + (hier.length ? "" : " leer") + (iso === S.heute ? " heute" : "") + '" role="gridcell">' +
        '<span class="kal-nr">' + wtag(iso) + " " + t + "." + "</span>" +
        hier.map(function (e) {
          return '<button type="button" class="kal-ev prio-' + e.prioritaet + (e.status === "geschätzt" ? " geschaetzt" : "") + '" data-details="' + esc(e.id) +
            '" title="' + esc(e.name + " · " + e.ort) + '">' + esc(e.name) + "</button>";
        }).join("") + "</div>";
    }
    h += "</div>";
    if (!imMonat.length) h += '<p class="leer">In diesem Monat gibt es mit den aktuellen Filtern keine Termine.</p>';
    h += '<p class="klein legende"><span class="kal-ev prio-A">A</span> <span class="kal-ev prio-B">B</span> <span class="kal-ev prio-C">C</span> Gestrichelt = Termin geschätzt. Auf einen Termin tippen für alle Angaben.</p>';
    return h;
  }

  /* ---------- Gemeinsame Bedienelemente ---------- */
  function bindeAllgemein(ctx) {
    $$("[data-stern]", ctx).forEach(function (b) { b.addEventListener("click", function () { umschalteMerk(b.getAttribute("data-stern")); }); });
    $$("[data-ics]", ctx).forEach(function (b) {
      b.addEventListener("click", function () {
        var e = findeEvent(b.getAttribute("data-ics"));
        X.download(X.buildICS([e], site(), e.name), dateiname(e.name, "ics"), "text/calendar;charset=utf-8");
      });
    });
    $$("[data-details]", ctx).forEach(function (b) { b.addEventListener("click", function () { zeigeDialog(findeEvent(b.getAttribute("data-details"))); }); });
    $$("[data-su]", ctx).forEach(function (b) {
      b.addEventListener("click", function () {
        var el = document.getElementById("su-" + b.getAttribute("data-su"));
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.add("blink"); setTimeout(function () { el.classList.remove("blink"); }, 1600); }
      });
    });
  }
  function findeEvent(id) { return S.events.filter(function (e) { return e.id === id; })[0]; }
  function zeigeDialog(e) {
    var d = $("#dialog");
    $("#dialog-inhalt").innerHTML = karteEvent(e, true);
    bindeAllgemein($("#dialog-inhalt"));
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
  }
  function umschalteMerk(id) {
    if (merk.has(id)) merk.delete(id); else merk.add(id);
    store.set("radar-merkliste", Array.from(merk));
    $$('[data-stern="' + id.replace(/"/g, "") + '"]').forEach(function (b) {
      var an = merk.has(id);
      b.classList.toggle("an", an); b.setAttribute("aria-pressed", an); b.textContent = an ? "★" : "☆";
      b.title = an ? "Von der Merkliste nehmen" : "Auf die Merkliste";
    });
    if ((S.f.merk && S.tab !== "startups" && S.tab !== "uebersicht")) aktualisiere();
    if (S.sf.merk && S.tab === "startups") aktualisiereStartups();
  }

  function herunterladen(art) {
    var liste = S.liste, teil = TABS[S.tab];
    if (art === "druck") return drucken();
    if (!liste.length) { alert("Die aktuelle Auswahl ist leer."); return; }
    if (art === "ics") X.download(X.buildICS(liste, site(), "Start-up- & Event-Radar – " + teil), dateiname(teil, "ics"), "text/calendar;charset=utf-8");
    if (art === "csv") X.download(X.buildCSV(liste, X.EVENT_COLS), dateiname(teil, "csv"), "text/csv;charset=utf-8");
    if (art === "xlsx") X.download(X.buildXLSX(liste, X.EVENT_COLS, "Veranstaltungen"), dateiname(teil, "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }
  var druckZu = [], druckVorher = null;
  window.addEventListener("beforeprint", function () {
    druckZu = $$("#ansicht details:not([open])");
    druckZu.forEach(function (d) { d.setAttribute("open", ""); });
  });
  window.addEventListener("afterprint", function () {
    druckZu.forEach(function (d) { d.removeAttribute("open"); });
    druckZu = [];
    if (druckVorher) { S.ansicht = druckVorher; druckVorher = null; aktualisiere(); }
  });
  function drucken() {
    if (S.ansicht === "kalender" && S.tab !== "startups") { druckVorher = "kalender"; S.ansicht = "liste"; aktualisiere(); }
    setTimeout(function () { window.print(); }, 50);
  }

  /* ---------- Start-ups ---------- */
  function zeigeStartups() {
    var felder = uniq(S.startups.map(function (s) { return s.suchfeld; })).sort();
    var regionen = uniq(S.startups.map(function (s) { return s.region; }));
    var sf = S.sf;
    var h = '<div class="bereich-kopf"><h2>Start-ups</h2><p>Start-ups aus Regensburg und Ostbayern. Wo regional zu wenige passen, ergänzt um bayerische Start-ups – diese sind als „Bayern (erweitert)“ markiert.</p></div>';
    h += '<div class="werkzeug" role="search"><div class="filter-zeile">' +
      '<label class="suche"><span class="vh">Suchen</span><input type="search" id="s-q" placeholder="Suchen, z. B. EPD, Sensor, Software" value="' + esc(sf.q) + '"></label>' +
      '<label><span class="vh">Suchfeld</span><select id="s-feld"><option value="">Alle Suchfelder</option>' + felder.map(function (x) { return "<option" + (x === sf.feld ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("") + "</select></label>" +
      '<label><span class="vh">Region</span><select id="s-region"><option value="">Alle Regionen</option>' + regionen.map(function (x) { return "<option" + (x === sf.region ? " selected" : "") + ">" + esc(x) + "</option>"; }).join("") + "</select></label>" +
      '<label class="haken"><input type="checkbox" id="s-merk"' + (sf.merk ? " checked" : "") + "> Nur Merkliste</label>" +
      '</div><div class="aktion-zeile"><span class="anzahl" id="s-anzahl"></span><div class="downloads"><span class="dl-label">Auswahl herunterladen:</span>' +
      '<button type="button" class="knopf leise klein" data-sdl="xlsx">Excel</button><button type="button" class="knopf leise klein" data-sdl="csv">CSV</button>' +
      '<button type="button" class="knopf leise klein" data-sdl="druck">Drucken / PDF</button></div></div></div>' +
      '<div id="s-ergebnis"></div>';
    $("#ansicht").innerHTML = h;
    $("#s-q").addEventListener("input", function () { S.sf.q = this.value; aktualisiereStartups(); });
    $("#s-feld").addEventListener("change", function () { S.sf.feld = this.value; aktualisiereStartups(); });
    $("#s-region").addEventListener("change", function () { S.sf.region = this.value; aktualisiereStartups(); });
    $("#s-merk").addEventListener("change", function () { S.sf.merk = this.checked; aktualisiereStartups(); });
    $$("[data-sdl]").forEach(function (b) {
      b.addEventListener("click", function () {
        var art = b.getAttribute("data-sdl"), l = S.suListe;
        if (art === "druck") return drucken();
        if (!l.length) { alert("Die aktuelle Auswahl ist leer."); return; }
        if (art === "csv") X.download(X.buildCSV(l, X.STARTUP_COLS), dateiname("start-ups", "csv"), "text/csv;charset=utf-8");
        if (art === "xlsx") X.download(X.buildXLSX(l, X.STARTUP_COLS, "Start-ups"), dateiname("start-ups", "xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      });
    });
    aktualisiereStartups();
  }
  function aktualisiereStartups() {
    var sf = S.sf, q = sf.q.trim().toLowerCase();
    var l = S.startups.filter(function (s) {
      if (sf.feld && s.suchfeld !== sf.feld) return false;
      if (sf.region && s.region !== sf.region) return false;
      if (sf.merk && !merk.has(s.id)) return false;
      if (q) { var t = [s.name, s.sitz, s.loesung, s.suchfeld, s.mehrwert, s.reifegrad, s.anbindung, s.kooperation].join(" ").toLowerCase(); if (q.split(/\s+/).some(function (w) { return t.indexOf(w) < 0; })) return false; }
      return true;
    });
    S.suListe = l;
    $("#s-anzahl").textContent = l.length + (l.length === 1 ? " Start-up" : " Start-ups");
    var h = matrix(l);
    h += l.length ? '<div class="karten">' + l.map(karteStartup).join("") + "</div>" : '<p class="leer">Kein Start-up passt zu den Filtern.</p>';
    $("#s-ergebnis").innerHTML = h;
    bindeAllgemein($("#s-ergebnis"));
  }
  function matrix(l) {
    var h = '<section class="kasten matrix-kasten"><h3>Relevanz gegen Umsetzungsaufwand</h3><p class="klein">Oben links: Quick Wins – hohe Relevanz bei geringem Aufwand.</p>' +
      '<div class="matrix-wrap"><div class="achse-y">Relevanz ↑</div><div class="matrix" role="grid">';
    for (var r = 5; r >= 1; r--) {
      h += '<div class="m-label-y" aria-hidden="true">' + r + "</div>";
      for (var a = 1; a <= 5; a++) {
        var hier = l.filter(function (s) { return s.relevanz === r && s.aufwand === a; });
        var qw = r >= 4 && a <= 2;
        h += '<div class="m-zelle' + (qw ? " quickwin" : "") + '" role="gridcell" aria-label="Relevanz ' + r + ", Aufwand " + a + '">' +
          hier.map(function (s) { return '<button type="button" class="m-chip prio-' + s.prioritaet + '" data-su="' + esc(s.id) + '">' + esc(s.name) + "</button>"; }).join("") + "</div>";
      }
    }
    h += '<div></div>' + [1, 2, 3, 4, 5].map(function (a) { return '<div class="m-label-x" aria-hidden="true">' + a + "</div>"; }).join("");
    h += '</div><div class="achse-x">Umsetzungsaufwand → (1 = gering)</div></div></section>';
    return h;
  }
  function karteStartup(s) {
    var web = s.website ? '<a href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(s.website)) + "</a>" : "k. A.";
    return '<article class="karte startup" id="su-' + esc(s.id) + '">' +
      '<div class="karte-kopf">' + prioBadge(s.prioritaet) + '<span class="region-badge' + (s.region === "Ostbayern" ? " ost" : "") + '">' + esc(s.region) + "</span>" +
      (s.quickwin ? '<span class="quickwin-badge">Quick Win</span>' : "") + stern(s.id, s.name) + "</div>" +
      "<h3>" + esc(s.name) + "</h3>" +
      '<p class="meta">' + esc(s.sitz) + " · gegründet " + esc(s.gruendung) + " · " + esc(s.suchfeld) + "</p>" +
      '<p class="begruendung">' + esc(s.loesung) + "</p>" +
      '<p class="mehrwert"><strong>Möglicher Mehrwert:</strong> ' + esc(s.mehrwert) + "</p>" +
      '<div class="karte-aktionen"><a class="knopf leise klein" href="' + esc(s.quelle) + '" target="_blank" rel="noopener noreferrer">Quelle öffnen</a></div>' +
      '<details><summary>Alle Angaben</summary><dl class="angaben">' +
      zeile("Sitz", s.sitz) + zeile("Gründungsjahr", s.gruendung) + zeile("Suchfeld", s.suchfeld) + zeile("Reifegrad", s.reifegrad) +
      zeile("Finanzierung und Investoren", s.finanzierung) + zeile("Anbindung", s.anbindung) + zeile("Mögliche Kooperationsform", s.kooperation) +
      zeile("Bewertung", "Relevanz " + s.relevanz + "/5 · Umsetzungsaufwand " + s.aufwand + "/5 (1 = gering) → Priorität " + s.prioritaet) +
      "<dt>Website</dt><dd>" + web + "</dd>" +
      '<dt>Quelle</dt><dd><a href="' + esc(s.quelle) + '" target="_blank" rel="noopener noreferrer">' + esc(kurzUrl(s.quelle)) + "</a></dd>" +
      zeile("Zuletzt geprüft", de(s.geprueft)) + "</dl></details></article>";
  }
})();
