/* Start-up- & Event-Radar – Exporte (Kalender, CSV, Excel). Läuft komplett im Browser, ohne Server. */
(function (root) {
  "use strict";

  var enc = new TextEncoder();

  /* ---------- Hilfen ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoToDate(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function ymd(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function deDate(s) { if (!s) return ""; var p = s.split("-"); return p[2] + "." + p[1] + "." + p[0]; }
  function komma(x) { return String(x).replace(".", ","); }

  /* ---------- iCalendar ---------- */
  function icsText(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  }
  function fold(line) {
    if (enc.encode(line).length <= 75) return line;
    var parts = [], cur = "", curLen = 0, limit = 75;
    for (var ch of line) {
      var b = enc.encode(ch).length;
      if (curLen + b > limit) { parts.push(cur); cur = ch; curLen = b; limit = 74; }
      else { cur += ch; curLen += b; }
    }
    parts.push(cur);
    return parts.join("\r\n ");
  }
  function vevent(e, stamp, site) {
    var start = isoToDate(e.start), ende = addDays(isoToDate(e.ende), 1);
    var geschaetzt = e.status === "geschätzt";
    var titel = "[" + e.prioritaet + "] " + e.name + (geschaetzt ? " (Termin geschätzt)" : "");
    var beschr = [
      e.format + " · " + e.veranstalter,
      "Priorität " + e.prioritaet + " (Gesamtscore " + komma(e.gesamt) + ")",
      "Terminstatus: " + e.status + (geschaetzt ? " – bitte vor der Planung prüfen" : ""),
      "Warum relevant: " + e.begruendung,
      "Empfohlene Rolle: " + e.rolle.join(", "),
      "Anmeldung: " + (e.anmeldung || "k. A."),
      "Quelle: " + e.quelle,
      "Radar: " + site
    ].join("\n");
    var v = ["BEGIN:VEVENT", "UID:" + e.id + "@startup-radar", "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + ymd(start), "DTEND;VALUE=DATE:" + ymd(ende),
      "SUMMARY:" + icsText(titel), "LOCATION:" + icsText(e.ort + ", " + e.region),
      "DESCRIPTION:" + icsText(beschr), "URL:" + e.quelle, "CATEGORIES:" + icsText(e.kategorie),
      "STATUS:" + (geschaetzt ? "TENTATIVE" : "CONFIRMED"), "TRANSP:TRANSPARENT"];
    [30, 7].forEach(function (t) {
      v.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsText(e.name + " in " + t + " Tagen"),
        "TRIGGER:-P" + t + "D", "END:VALARM");
    });
    v.push("END:VEVENT");
    if (e.anmeldeschluss) {
      var f = isoToDate(e.anmeldeschluss), art = e.frist_art || "Anmeldeschluss";
      v.push("BEGIN:VEVENT", "UID:" + e.id + "-frist@startup-radar", "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + ymd(f), "DTEND;VALUE=DATE:" + ymd(addDays(f, 1)),
        "SUMMARY:" + icsText("Frist: " + e.name + " – " + art),
        "DESCRIPTION:" + icsText(art + " für " + e.name + ". Quelle: " + e.quelle),
        "URL:" + e.quelle, "TRANSP:TRANSPARENT",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsText("Frist in 7 Tagen: " + e.name),
        "TRIGGER:-P7D", "END:VALARM", "END:VEVENT");
    }
    return v;
  }
  function buildICS(events, site, calName) {
    var now = new Date();
    var stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + "T" +
      pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
    var z = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Start-up- und Event-Radar//DE", "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH", "X-WR-CALNAME:" + icsText(calName || "Start-up- & Event-Radar"), "X-WR-TIMEZONE:Europe/Berlin"];
    events.forEach(function (e) { z = z.concat(vevent(e, stamp, site)); });
    z.push("END:VCALENDAR");
    return z.map(fold).join("\r\n") + "\r\n";
  }

  /* ---------- Tabellen-Spalten ---------- */
  var RUBRIK = { region: "Region Regensburg", de: "Deutschland", eu: "EU", noneu: "Schweiz, UK, Norwegen" };
  var EVENT_COLS = [
    ["Priorität", function (e) { return e.prioritaet; }],
    ["Gesamtscore", function (e) { return { num: e.gesamt }; }],
    ["Name", function (e) { return e.name; }],
    ["Format", function (e) { return e.format; }],
    ["Kategorie", function (e) { return e.kategorie; }],
    ["Veranstalter", function (e) { return e.veranstalter; }],
    ["Ort", function (e) { return e.ort; }],
    ["Land/Bundesland", function (e) { return e.region; }],
    ["Rubrik", function (e) { return RUBRIK[e.rubrik] || e.rubrik; }],
    ["Start", function (e) { return { date: e.start }; }],
    ["Ende", function (e) { return { date: e.ende }; }],
    ["Turnus", function (e) { return e.turnus; }],
    ["Üblicher Zeitraum", function (e) { return e.zeitraum; }],
    ["Terminstatus", function (e) { return e.status; }],
    ["Anmeldeschluss", function (e) { return e.anmeldeschluss ? { date: e.anmeldeschluss } : ""; }],
    ["Art der Frist", function (e) { return e.frist_art || ""; }],
    ["Anmeldung", function (e) { return e.anmeldung || ""; }],
    ["Kosten", function (e) { return e.kosten; }],
    ["Zielgruppe", function (e) { return e.zielgruppe; }],
    ["Themenfokus", function (e) { return e.fokus; }],
    ["Relevanz (Begründung)", function (e) { return e.begruendung; }],
    ["Empfohlene Rolle", function (e) { return e.rolle.join(", "); }],
    ["Score Relevanz", function (e) { return { num: e.scores.relevanz }; }],
    ["Score Zugang", function (e) { return { num: e.scores.zugang }; }],
    ["Score Aufwand (5 = gering)", function (e) { return { num: e.scores.aufwand }; }],
    ["Score Verlässlichkeit", function (e) { return { num: e.scores.verlaesslichkeit }; }],
    ["Quelle", function (e) { return e.quelle; }],
    ["Zuletzt geprüft", function (e) { return { date: e.geprueft }; }]
  ];
  var STARTUP_COLS = [
    ["Priorität", function (s) { return s.prioritaet; }],
    ["Name", function (s) { return s.name; }],
    ["Sitz", function (s) { return s.sitz; }],
    ["Land", function (s) { return s.land || ""; }],
    ["Region", function (s) { return s.region; }],
    ["Gründungsjahr", function (s) { return s.gruendung; }],
    ["Lösung", function (s) { return s.loesung; }],
    ["Suchfeld", function (s) { return s.suchfeld; }],
    ["Möglicher Mehrwert", function (s) { return s.mehrwert; }],
    ["Reifegrad", function (s) { return s.reifegrad; }],
    ["Finanzierung (Zusammenfassung)", function (s) { return s.finanzierung; }],
    ["Letzte Runde: Datum", function (s) { return s.letzte_runde ? monatOderTag(s.letzte_runde.datum) : ""; }],
    ["Letzte Runde: Art", function (s) { return s.letzte_runde ? s.letzte_runde.runde : ""; }],
    ["Letzte Runde: Betrag", function (s) { return s.letzte_runde ? s.letzte_runde.betrag : ""; }],
    ["Investoren (öffentlich bekannt)", function (s) { return (s.investoren_alle || []).join(", "); }],
    ["Anbindung", function (s) { return s.anbindung; }],
    ["Mögliche Kooperationsform", function (s) { return s.kooperation; }],
    ["Relevanz (1–5)", function (s) { return { num: s.relevanz }; }],
    ["Umsetzungsaufwand (1–5)", function (s) { return { num: s.aufwand }; }],
    ["Website", function (s) { return s.website || ""; }],
    ["Quelle", function (s) { return s.quelle; }],
    ["Zuletzt geprüft", function (s) { return { date: s.geprueft }; }]
  ];
  function monatOderTag(d) { return d.length === 7 ? d.slice(5, 7) + "." + d.slice(0, 4) : deDate(d); }
  var RUNDEN_COLS = [
    ["Datum", function (r) { return monatOderTag(r.datum); }],
    ["Art", function (r) { return r.art; }],
    ["Runde", function (r) { return r.runde; }],
    ["Unternehmen", function (r) { return r.unternehmen; }],
    ["Im Radar gelistet", function (r) { return r.startup_id ? "ja" : ""; }],
    ["Sitz", function (r) { return r.sitz; }],
    ["Land", function (r) { return r.land; }],
    ["Thema", function (r) { return r.thema; }],
    ["Betrag", function (r) { return r.betrag; }],
    ["Betrag in Mio. € (ca.)", function (r) { return r.betrag_mio_eur != null ? { num: r.betrag_mio_eur } : ""; }],
    ["Lead / Käufer", function (r) { return (r.lead || []).join(", "); }],
    ["Beteiligte", function (r) { return (r.investoren || []).join(", "); }],
    ["Kurzbeschreibung", function (r) { return r.kurz; }],
    ["Quelle", function (r) { return r.quelle; }],
    ["Zuletzt geprüft", function (r) { return { date: r.geprueft }; }]
  ];
  var INVESTOR_COLS = [
    ["Name", function (i) { return i.name; }],
    ["Typ", function (i) { return i.typ; }],
    ["Sitz", function (i) { return i.sitz; }],
    ["Beschreibung", function (i) { return i.kurz; }],
    ["Phasen", function (i) { return i.phasen; }],
    ["Ticket", function (i) { return i.ticket; }],
    ["Fondsvolumen", function (i) { return i.volumen; }],
    ["Themen", function (i) { return (i.themen || []).join(", "); }],
    ["Beteiligungen im Radar", function (i) { return (i.portfolio || []).map(function (p) { return p.unternehmen; }).join(", "); }],
    ["Website", function (i) { return i.website || ""; }],
    ["Quelle", function (i) { return i.quelle; }],
    ["Zuletzt geprüft", function (i) { return { date: i.geprueft }; }]
  ];

  function plain(v) {
    if (v && typeof v === "object") { if ("date" in v) return deDate(v.date); if ("num" in v) return komma(v.num); }
    return v == null ? "" : String(v);
  }

  /* ---------- CSV (Excel-freundlich: Semikolon, UTF-8 mit BOM) ---------- */
  function buildCSV(rows, cols) {
    var lines = [cols.map(function (c) { return q(c[0]); }).join(";")];
    rows.forEach(function (r) { lines.push(cols.map(function (c) { return q(plain(c[1](r))); }).join(";")); });
    return "\uFEFF" + lines.join("\r\n") + "\r\n";
    function q(s) { s = String(s); return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  }

  /* ---------- XLSX (eigene, schlanke Umsetzung) ---------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(buf) { var c = 0xFFFFFFFF; for (var i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

  function zip(files) {
    var chunks = [], central = [], offset = 0;
    var now = new Date();
    var dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    var dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = enc.encode(f.data), crc = crc32(data);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, dosTime, true); h.setUint16(12, dosDate, true); h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      chunks.push(new Uint8Array(h.buffer), name, data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true); c.setUint16(12, dosTime, true); c.setUint16(14, dosDate, true); c.setUint32(16, crc, true);
      c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true);
      c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true);
      c.setUint32(38, 0, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    });
    var cdSize = central.reduce(function (s, a) { return s + a.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
    var all = chunks.concat(central, [new Uint8Array(end.buffer)]);
    var total = all.reduce(function (s, a) { return s + a.length; }, 0), out = new Uint8Array(total), p = 0;
    all.forEach(function (a) { out.set(a, p); p += a.length; });
    return out;
  }

  function xmlEsc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  }
  function colName(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function excelSerial(iso) { return Math.round((isoToDate(iso) - Date.UTC(1899, 11, 30)) / 86400000); }

  function buildXLSX(rows, cols, sheetName) {
    var widths = cols.map(function (c) { return Math.max(10, Math.min(60, c[0].length + 2)); });
    var xmlRows = [];
    var head = cols.map(function (c, i) {
      return '<c r="' + colName(i) + '1" t="inlineStr" s="1"><is><t xml:space="preserve">' + xmlEsc(c[0]) + "</t></is></c>";
    }).join("");
    xmlRows.push('<row r="1">' + head + "</row>");
    rows.forEach(function (r, ri) {
      var rn = ri + 2;
      var cells = cols.map(function (c, ci) {
        var v = c[1](r), ref = colName(ci) + rn;
        if (v && typeof v === "object" && "num" in v) { widths[ci] = Math.max(widths[ci], 8); return '<c r="' + ref + '"><v>' + v.num + "</v></c>"; }
        if (v && typeof v === "object" && "date" in v) { widths[ci] = Math.max(widths[ci], 12); return '<c r="' + ref + '" s="2"><v>' + excelSerial(v.date) + "</v></c>"; }
        var s = v == null ? "" : String(v);
        widths[ci] = Math.max(widths[ci], Math.min(60, s.length + 2));
        return '<c r="' + ref + '" t="inlineStr" s="3"><is><t xml:space="preserve">' + xmlEsc(s) + "</t></is></c>";
      }).join("");
      xmlRows.push('<row r="' + rn + '">' + cells + "</row>");
    });
    var last = colName(cols.length - 1) + (rows.length + 1);
    var colsXml = "<cols>" + widths.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join("") + "</cols>";
    var sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="15"/>' + colsXml + "<sheetData>" + xmlRows.join("") + "</sheetData>" +
      '<autoFilter ref="A1:' + last + '"/></worksheet>';
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd\\.mm\\.yyyy"/></numFmts>' +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFE7EEF5"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Standard" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    var safeName = xmlEsc(String(sheetName || "Liste").replace(/[\\\/\?\*\[\]:]/g, " ").slice(0, 31));
    var files = [
      { name: "[Content_Types].xml", data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        "</Types>" },
      { name: "_rels/.rels", data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>" },
      { name: "xl/workbook.xml", data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="' + safeName + '" sheetId="1" r:id="rId1"/></sheets>' +
        '<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'' + safeName + "'!$A$1:$" +
        colName(cols.length - 1) + "$" + (rows.length + 1) + "</definedName></definedNames></workbook>" },
      { name: "xl/_rels/workbook.xml.rels", data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        "</Relationships>" },
      { name: "xl/styles.xml", data: styles },
      { name: "xl/worksheets/sheet1.xml", data: sheet }
    ];
    return zip(files);
  }

  /* ---------- Herunterladen ---------- */
  function download(data, filename, mime) {
    var blob = new Blob([data], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  root.RadarExport = {
    buildICS: buildICS, buildCSV: buildCSV, buildXLSX: buildXLSX, download: download,
    EVENT_COLS: EVENT_COLS, STARTUP_COLS: STARTUP_COLS, RUNDEN_COLS: RUNDEN_COLS, INVESTOR_COLS: INVESTOR_COLS, deDate: deDate
  };
})(typeof window !== "undefined" ? window : globalThis);
