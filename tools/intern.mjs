#!/usr/bin/env node
/*
  Interner Bereich: verschlüsselt den Inhalt von data/intern.json.
  Die Seite entschlüsselt ihn erst im Browser mit dem Passwort (PBKDF2-SHA256 + AES-256-GCM).

  Den Schlüssel übergibt die Umgebungsvariable INTERN_SCHLUESSEL. Er steht nie im Repository.
  Klartextdateien müssen außerhalb des Repositorys liegen – das Skript bricht sonst ab.

    INTERN_SCHLUESSEL=… node tools/intern.mjs neu --klartext /pfad/ausserhalb/inhalt.json
    INTERN_SCHLUESSEL=… node tools/intern.mjs aktualisieren --db /pfad/ausserhalb/export
        (Ordner mit <sammlung>/<id>.json je Sammlung, optional meta/stand.json mit stand und hinweis;
         ersetzt die Listen der Sammlungen, Beschriftungen und Aufbau bleiben erhalten)
    INTERN_SCHLUESSEL=… node tools/intern.mjs pruefen
        (entschlüsselt testweise und zeigt nur die Anzahl der Einträge)
*/
import { webcrypto as wc } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, realpathSync } from "node:fs";
import { dirname, resolve, join, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ZIEL = join(WURZEL, "data", "intern.json");
const ITER = 600000;

function stop(text) { console.error("FEHLER: " + text); process.exit(1); }
function schluessel() {
  const s = process.env.INTERN_SCHLUESSEL || "";
  if (s.length < 12) stop("INTERN_SCHLUESSEL fehlt oder ist zu kurz.");
  return s;
}
function ausserhalb(pfad) {
  const echt = existsSync(pfad) ? realpathSync(pfad) : resolve(pfad);
  const rel = relative(realpathSync(WURZEL), echt);
  if (!rel.startsWith("..") && !isAbsolute(rel)) stop("Klartext liegt im Repository (" + pfad + "). Bitte außerhalb ablegen.");
  return echt;
}
const b64 = (u8) => Buffer.from(u8).toString("base64");
const ub64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

async function ableiten(pass, salt) {
  const roh = await wc.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  return wc.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, roh, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function verschluesseln(obj, pass) {
  const salt = wc.getRandomValues(new Uint8Array(16)), iv = wc.getRandomValues(new Uint8Array(12));
  const key = await ableiten(pass, salt);
  const klar = gzipSync(Buffer.from(JSON.stringify(obj), "utf8"), { level: 9 });
  const ct = new Uint8Array(await wc.subtle.encrypt({ name: "AES-GCM", iv }, key, klar));
  return { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, z: "gzip", salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
async function entschluesseln(datei, pass) {
  const d = JSON.parse(readFileSync(datei, "utf8"));
  const key = await ableiten(pass, ub64(d.salt));
  let roh;
  try { roh = await wc.subtle.decrypt({ name: "AES-GCM", iv: ub64(d.iv) }, key, ub64(d.ct)); }
  catch (e) { stop("Entschlüsseln fehlgeschlagen – falscher Schlüssel oder beschädigte Datei."); }
  const buf = Buffer.from(roh);
  return JSON.parse((d.z === "gzip" ? gunzipSync(buf) : buf).toString("utf8"));
}
function pruefeAufbau(p) {
  if (!p || typeof p !== "object" || !Array.isArray(p.sammlungen) || !p.sammlungen.length) stop("Inhalt braucht eine Liste 'sammlungen'.");
  p.sammlungen.forEach((s) => {
    if (!s.id || !s.titelFeld || !Array.isArray(s.liste)) stop("Sammlung ohne id, titelFeld oder liste.");
    s.liste.forEach((x) => { if (!x._id) stop("Eintrag ohne _id in Sammlung " + s.id + "."); });
  });
}
function zusammenfassung(p) {
  return p.sammlungen.map((s) => s.id + ": " + s.liste.length).join(", ") + (p.stand ? " (Stand " + p.stand + ")" : "");
}
function arg(name) { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; }

const befehl = process.argv[2];
const pass = schluessel();

if (befehl === "neu") {
  const k = arg("--klartext"); if (!k) stop("--klartext fehlt.");
  const p = JSON.parse(readFileSync(ausserhalb(k), "utf8"));
  pruefeAufbau(p);
  writeFileSync(ZIEL, JSON.stringify(await verschluesseln(p, pass)) + "\n");
  console.log("OK: data/intern.json neu verschlüsselt – " + zusammenfassung(p));
} else if (befehl === "aktualisieren") {
  const db = arg("--db"); if (!db) stop("--db fehlt.");
  const ordner = ausserhalb(db);
  if (!existsSync(ZIEL)) stop("data/intern.json fehlt – zuerst 'neu' ausführen.");
  const p = await entschluesseln(ZIEL, pass);
  let geaendert = 0;
  p.sammlungen.forEach((s) => {
    const dir = join(ordner, s.id);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) { console.log("Hinweis: kein Export für " + s.id + " – Liste bleibt unverändert."); return; }
    const neu = readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => {
      const x = JSON.parse(readFileSync(join(dir, f), "utf8"));
      x._id = f.replace(/\.json$/, "");
      return x;
    });
    if (!neu.length && s.liste.length) { console.log("Hinweis: Export für " + s.id + " ist leer – Liste bleibt unverändert."); return; }
    s.liste = neu; geaendert++;
  });
  const meta = join(ordner, "meta", "stand.json");
  if (existsSync(meta)) { const m = JSON.parse(readFileSync(meta, "utf8")); if (m.stand) p.stand = m.stand; if (m.hinweis) p.hinweis = m.hinweis; }
  p.uebernommen = new Date().toISOString().slice(0, 10);
  pruefeAufbau(p);
  writeFileSync(ZIEL, JSON.stringify(await verschluesseln(p, pass)) + "\n");
  console.log("OK: " + geaendert + " Sammlung(en) übernommen – " + zusammenfassung(p));
} else if (befehl === "pruefen") {
  const p = await entschluesseln(ZIEL, pass);
  pruefeAufbau(p);
  console.log("OK: " + zusammenfassung(p));
} else {
  stop("Befehl fehlt: neu | aktualisieren | pruefen");
}
