/* Start-up- & Event-Radar – das Radar.
   Azimutale Projektion um Regensburg: Richtung = echte Himmelsrichtung, Abstand = Entfernung (logarithmisch).
   Läuft ohne Bibliotheken; Bewegung nur, wenn das Radar sichtbar ist und keine reduzierte Bewegung gewünscht ist. */
(function (root) {
  "use strict";
  var K = root.RadarKarte;
  var NS = "http://www.w3.org/2000/svg";
  var RAD = Math.PI / 180;
  var R = 1000;
  var RINGE = [[100, "100 km"], [300, "300 km"], [1000, "1.000 km"], [2000, "2.000 km"]];
  var STAEDTE = [
    ["München", 48.137, 11.575], ["Nürnberg", 49.452, 11.077], ["Prag", 50.075, 14.438], ["Wien", 48.208, 16.374],
    ["Berlin", 52.52, 13.405], ["Hamburg", 53.551, 9.994], ["Zürich", 47.377, 8.542], ["Mailand", 45.464, 9.19],
    ["Paris", 48.857, 2.352], ["London", 51.507, -0.128], ["Rom", 41.903, 12.496], ["Madrid", 40.417, -3.704],
    ["Warschau", 52.23, 21.01], ["Kopenhagen", 55.676, 12.568]
  ];
  var PX = { A: 7, B: 5.6, C: 4.4 };
  var UMLAUF = 7000;
  var reduziert = root.matchMedia ? root.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var zaehler = 0;

  function proj(lat, lon) {
    var c = K.zentrum, p1 = c[0] * RAD, p2 = lat * RAD, dl = (lon - c[1]) * RAD;
    var th = Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl));
    var h = Math.pow(Math.sin((p2 - p1) / 2), 2) + Math.cos(p1) * Math.cos(p2) * Math.pow(Math.sin(dl / 2), 2);
    var d = 2 * 6371 * Math.asin(Math.sqrt(h));
    var r = radius(d);
    return { x: r * Math.sin(th), y: -r * Math.cos(th), d: d, b: (th / RAD + 360) % 360 };
  }
  function radius(d) { return Math.log(1 + Math.min(d, K.dmax * 1.25) / K.d0) / Math.log(1 + K.dmax / K.d0) * R; }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function sektor(a1, a2, r) {
    var x1 = Math.sin(a1 * RAD) * r, y1 = -Math.cos(a1 * RAD) * r, x2 = Math.sin(a2 * RAD) * r, y2 = -Math.cos(a2 * RAD) * r;
    return "M0,0L" + x1.toFixed(1) + "," + y1.toFixed(1) + "A" + r + "," + r + " 0 0 1 " + x2.toFixed(1) + "," + y2.toFixed(1) + "Z";
  }

  function Radar(wrap, opts) {
    var self = this;
    this.wrap = wrap; this.opts = opts || {};
    this.id = "r" + (++zaehler);
    this.blips = {}; this.liste = []; this.k = 0.3; this.fokusId = null;
    this.laeuft = false; this.sichtbar = true; this.erstDurchlauf = !reduziert.matches && !this.opts.sofort;
    this.t0 = performance.now();

    var svg = this.svg = el("svg", { viewBox: "-1090 -1090 2180 2180", class: "radar-svg", role: "img", "aria-label": this.opts.label || "Radar der Termine nach Richtung und Entfernung von Regensburg" });
    var defs = el("defs", null, svg);
    var cp = el("clipPath", { id: this.id + "-clip" }, defs); el("circle", { r: R }, cp);
    var rg = el("radialGradient", { id: this.id + "-bg", cx: "0", cy: "0", r: "1000", gradientUnits: "userSpaceOnUse" }, defs);
    el("stop", { offset: "0", class: "rg-a" }, rg); el("stop", { offset: "1", class: "rg-b" }, rg);

    el("circle", { r: R, class: "r-bg", fill: "url(#" + this.id + "-bg)" }, svg);
    var karte = el("g", { "clip-path": "url(#" + this.id + "-clip)", class: "r-karte" }, svg);
    el("path", { d: K.land, class: "r-land", "fill-rule": "evenodd" }, karte);
    el("path", { d: K.deutschland, class: "r-de" }, karte);
    el("path", { d: K.grenzen, class: "r-grenzen" }, karte);

    var ringe = el("g", { class: "r-ringe" }, svg);
    RINGE.forEach(function (rr) { el("circle", { r: radius(rr[0]).toFixed(1), class: rr[0] === 100 ? "ring ring-region" : "ring" }, ringe); });
    el("path", { d: "M0,-1000V1000M-1000,0H1000", class: "r-achse" }, ringe);
    this.ringText = el("g", { class: "r-ringtext" }, svg);
    RINGE.forEach(function (rr) {
      var t = el("text", { x: 8, y: (-radius(rr[0]) - 8).toFixed(1) }, self.ringText); t.textContent = rr[1];
    });

    this.staedte = el("g", { class: "r-staedte", "aria-hidden": "true" }, svg);
    STAEDTE.forEach(function (s) {
      var p = proj(s[1], s[2]);
      var g = el("g", { transform: "translate(" + p.x.toFixed(1) + "," + p.y.toFixed(1) + ")" }, self.staedte);
      el("circle", { r: 4, class: "st-punkt" }, g);
      var t = el("text", { x: 10, y: 4 }, g); t.textContent = s[0];
    });

    var sweep = this.sweep = el("g", { class: "r-sweep", "clip-path": "url(#" + this.id + "-clip)" }, svg);
    var inner = this.sweepInner = el("g", null, sweep);
    for (var i = 0; i < 26; i++) {
      el("path", { d: sektor(-(i + 1) * 1.8, -i * 1.8 + 0.2, R), class: "sw-scheibe", "fill-opacity": (0.34 * Math.pow(1 - i / 26, 1.7)).toFixed(3) }, inner);
    }
    el("line", { x1: 0, y1: 0, x2: 0, y2: -R, class: "sw-kante" }, inner);

    this.peil = el("g", { class: "r-peil" }, svg);
    this.peilLinie = el("line", { x1: 0, y1: 0, x2: 0, y2: 0 }, this.peil);
    this.peilText = el("text", { x: 0, y: 0 }, this.peil);

    this.blipG = el("g", { class: "r-blips" }, svg);
    el("circle", { r: R, class: "r-rand" }, svg);
    var komp = this.kompass = el("g", { class: "r-kompass", "aria-hidden": "true" }, svg);
    [["N", 0, -1048], ["O", 1048, 0], ["S", 0, 1048], ["W", -1048, 0]].forEach(function (k) {
      var t = el("text", { x: k[1], y: k[2], "text-anchor": "middle", "dominant-baseline": "central" }, komp); t.textContent = k[0];
    });
    var z = this.zentrum = el("g", { class: "r-zentrum" }, svg);
    el("circle", { r: 14, class: "z-ring" }, z); el("circle", { r: 5, class: "z-punkt" }, z);
    this.zText = el("text", { x: 0, y: 34, "text-anchor": "middle" }, z); this.zText.textContent = "Regensburg";

    wrap.appendChild(svg);

    this.onResize = function () { self.messen(); };
    if (root.ResizeObserver) { this.ro = new ResizeObserver(this.onResize); this.ro.observe(wrap); }
    else root.addEventListener("resize", this.onResize);
    if (root.IntersectionObserver) {
      this.io = new IntersectionObserver(function (es) { self.sichtbar = es[0].isIntersecting; self.pruefeLauf(); }, { threshold: 0.05 });
      this.io.observe(wrap);
    }
    this.onVis = function () { self.pruefeLauf(); };
    document.addEventListener("visibilitychange", this.onVis);
    this.onMotion = function () { self.erstDurchlauf = false; self.pruefeLauf(); self.zeichneStatisch(); };
    if (reduziert.addEventListener) reduziert.addEventListener("change", this.onMotion);

    svg.addEventListener("pointerover", function (ev) { var b = blipVon(ev.target); if (b) self.hover(b.getAttribute("data-id"), true); });
    svg.addEventListener("pointerout", function (ev) { var b = blipVon(ev.target); if (b && !(ev.relatedTarget && b.contains(ev.relatedTarget))) self.hover(null, true); });
    svg.addEventListener("click", function (ev) { var b = blipVon(ev.target); if (b && self.opts.oeffnen) self.opts.oeffnen(b.getAttribute("data-id")); });
    function blipVon(t) { while (t && t !== svg) { if (t.getAttribute && t.getAttribute("data-id")) return t; t = t.parentNode; } return null; }

    this.messen();
  }

  Radar.proj = proj;

  Radar.prototype.messen = function () {
    var w = this.wrap.clientWidth || 300;
    var k = w / 2180;
    if (Math.abs(k - this.k) < 0.0005 && this.gemessen) return;
    this.k = k; this.gemessen = true;
    var u = 1 / k;
    var klein = w < 380;
    this.staedte.setAttribute("font-size", (11 * u).toFixed(1));
    this.staedte.style.display = w < 300 ? "none" : "";
    Array.prototype.forEach.call(this.staedte.querySelectorAll("circle"), function (c) { c.setAttribute("r", (1.6 * u).toFixed(1)); });
    Array.prototype.forEach.call(this.staedte.querySelectorAll("text"), function (t) { t.setAttribute("x", (5 * u).toFixed(1)); t.setAttribute("y", (3.6 * u).toFixed(1)); });
    this.ringText.setAttribute("font-size", ((klein ? 9.5 : 10.5) * u).toFixed(1));
    Array.prototype.forEach.call(this.ringText.querySelectorAll("text"), function (t, i) {
      t.setAttribute("x", (4 * u).toFixed(1)); t.setAttribute("y", (-radius(RINGE[i][0]) - 4 * u).toFixed(1));
    });
    this.kompass.setAttribute("font-size", (11 * u).toFixed(1));
    this.zText.setAttribute("font-size", (11.5 * u).toFixed(1)); this.zText.setAttribute("y", (17 * u).toFixed(1));
    this.zentrum.querySelector(".z-ring").setAttribute("r", (6 * u).toFixed(1));
    this.zentrum.querySelector(".z-punkt").setAttribute("r", (2.4 * u).toFixed(1));
    this.peilText.setAttribute("font-size", (12 * u).toFixed(1));
    this.svg.style.setProperty("--u", u.toFixed(3));
    if (this.liste.length) this.setze(this.liste, true);
  };

  /* Blips setzen: Kollisionen werden spiralförmig aufgelöst, A zuerst, damit wichtige Termine nah an ihrem Ort bleiben. */
  Radar.prototype.setze = function (liste, nurLayout) {
    var self = this, u = 1 / this.k;
    this.liste = liste;
    var mitOrt = liste.filter(function (e) { return e.geo; });
    var sortiert = mitOrt.slice().sort(function (a, b) { return a.prioritaet < b.prioritaet ? -1 : a.prioritaet > b.prioritaet ? 1 : (a.start < b.start ? -1 : 1); });
    var platziert = [], neu = {};
    sortiert.forEach(function (e) {
      var p = proj(e.geo[0], e.geo[1]);
      var r = PX[e.prioritaet] * u, abstand = 2.2 * u;
      var x = p.x, y = p.y;
      for (var i = 0; i < 400; i++) {
        if (i > 0) {
          var w = i * 137.508 * RAD, s = (r * 1.25 + abstand) * Math.sqrt(i);
          x = p.x + Math.cos(w) * s; y = p.y + Math.sin(w) * s;
        }
        var frei = platziert.every(function (q) { var dx = q.x - x, dy = q.y - y; return dx * dx + dy * dy >= Math.pow(q.r + r + abstand, 2); });
        if (frei) break;
      }
      platziert.push({ x: x, y: y, r: r });
      neu[e.id] = { e: e, x: x, y: y, r: r, d: p.d, b: (Math.atan2(x, -y) / RAD + 360) % 360, ox: p.x, oy: p.y };
    });

    Object.keys(this.blips).forEach(function (id) {
      if (!neu[id]) {
        var alt = self.blips[id].g;
        delete self.blips[id];
        if (reduziert.matches || !alt.animate) alt.remove();
        else alt.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-out" }).onfinish = function () { alt.remove(); };
      }
    });
    Object.keys(neu).forEach(function (id) {
      var n = neu[id], b = self.blips[id];
      if (!b) {
        var g = el("g", { class: "blip prio-" + n.e.prioritaet + (n.e.status === "geschätzt" ? " geschaetzt" : ""), "data-id": id }, self.blipG);
        var halo = el("circle", { class: "b-halo" }, g);
        var ping = el("circle", { class: "b-ping" }, g);
        var kern = el("circle", { class: "b-kern" }, g);
        el("circle", { class: "b-treffer" }, g);
        b = self.blips[id] = { g: g, halo: halo, ping: ping, kern: kern, vorher: null, gezeigt: !self.erstDurchlauf };
        if (!b.gezeigt) g.style.opacity = "0";
        else if (!nurLayout && !reduziert.matches && g.animate && self.gestartet) {
          kern.animate([{ transform: "scale(0)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
        }
      }
      b.x = n.x; b.y = n.y; b.r = n.r; b.d = n.d; b.b = n.b; b.e = n.e;
      b.g.style.transform = "translate(" + n.x.toFixed(1) + "px," + n.y.toFixed(1) + "px)";
      b.kern.setAttribute("r", n.r.toFixed(1));
      b.halo.setAttribute("r", (n.r * 2.4).toFixed(1));
      b.ping.setAttribute("r", n.r.toFixed(1));
      b.g.querySelector(".b-treffer").setAttribute("r", Math.max(n.r * 1.8, 11 * u).toFixed(1));
      b.kern.setAttribute("stroke-width", (n.e.status === "geschätzt" ? 1.8 * u : 1.2 * u).toFixed(1));
    });
    if (this.fokusId) this.fokus(this.fokusId);
    this.gestartet = true;
    this.zeichneStatisch();
    this.pruefeLauf();
  };

  Radar.prototype.zeichneStatisch = function () {
    var an = !reduziert.matches;
    this.sweep.style.display = an ? "" : "none";
    if (!an) {
      var self = this;
      Object.keys(this.blips).forEach(function (id) { var b = self.blips[id]; b.g.style.opacity = ""; b.gezeigt = true; b.halo.style.opacity = "0.25"; b.kern.style.opacity = "1"; });
    }
  };

  Radar.prototype.pruefeLauf = function () {
    var soll = this.sichtbar && !document.hidden && !reduziert.matches && !this.weg;
    if (soll && !this.laeuft) { this.laeuft = true; this.letzt = performance.now(); this.tick(); }
    else if (!soll && this.laeuft) { this.laeuft = false; cancelAnimationFrame(this.raf); }
  };

  Radar.prototype.tick = function () {
    var self = this;
    if (!this.laeuft) return;
    var jetzt = performance.now();
    this.winkel = (((jetzt - this.t0) / UMLAUF) * 360) % 360;
    var s = this.winkel;
    this.sweepInner.setAttribute("transform", "rotate(" + s.toFixed(2) + ")");
    var alleGezeigt = true;
    Object.keys(this.blips).forEach(function (id) {
      var b = self.blips[id];
      var diff = (s - b.b + 360) % 360;
      if (b.vorher !== null && diff < b.vorher - 180) {
        if (!b.gezeigt) {
          b.gezeigt = true; b.g.style.opacity = "";
          if (b.kern.animate) b.kern.animate([{ transform: "scale(0)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" });
        }
        if (b.ping.animate) b.ping.animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: "scale(" + (b.e.prioritaet === "A" ? 4.2 : 3.2) + ")", opacity: 0 }], { duration: 1500, easing: "cubic-bezier(.1,.6,.3,1)" });
      }
      b.vorher = diff;
      if (!b.gezeigt) { alleGezeigt = false; return; }
      var i = Math.exp(-diff / 62);
      b.halo.style.opacity = (0.08 + 0.6 * i).toFixed(3);
      b.kern.style.opacity = (0.62 + 0.38 * i).toFixed(3);
    });
    if (this.erstDurchlauf && alleGezeigt && jetzt - this.t0 > 400) this.erstDurchlauf = false;
    this.raf = requestAnimationFrame(function () { self.tick(); });
  };

  Radar.prototype.bildschirm = function (b) {
    var ctm = this.svg.getScreenCTM();
    if (!ctm) return null;
    var pt = this.svg.createSVGPoint(); pt.x = b.x; pt.y = b.y;
    var p = pt.matrixTransform(ctm);
    return { x: p.x, y: p.y, r: b.r * this.k };
  };

  Radar.prototype.hover = function (id, vonRadar) {
    if (this.opts.hover) this.opts.hover(id, vonRadar);
    this.fokus(id);
  };

  Radar.prototype.fokus = function (id) {
    var self = this;
    if (this.fokusId && this.blips[this.fokusId]) this.blips[this.fokusId].g.classList.remove("fokus");
    this.fokusId = id;
    var b = id && this.blips[id];
    this.svg.classList.toggle("hat-fokus", !!b);
    var tip = this.opts.tooltip;
    if (!b) { this.peil.classList.remove("an"); if (tip) tip(null); return; }
    b.g.classList.add("fokus");
    this.blipG.appendChild(b.g);
    this.peilLinie.setAttribute("x2", b.x.toFixed(1)); this.peilLinie.setAttribute("y2", b.y.toFixed(1));
    var u = 1 / this.k, len = Math.hypot(b.x, b.y) || 1;
    var tx = b.x / 2 + (-b.y / len) * 12 * u, ty = b.y / 2 + (b.x / len) * 12 * u;
    this.peilText.setAttribute("x", tx.toFixed(1)); this.peilText.setAttribute("y", ty.toFixed(1));
    this.peilText.setAttribute("text-anchor", "middle");
    this.peilText.textContent = Math.round(b.d / 5) * 5 < 10 ? "in Regensburg" : (Math.round(b.d / 5) * 5).toLocaleString("de-DE") + " km";
    this.peil.classList.add("an");
    if (tip) { var p = self.bildschirm(b); if (p) tip(b.e, p); }
  };

  Radar.prototype.entferne = function () {
    this.weg = true; this.pruefeLauf();
    if (this.ro) this.ro.disconnect(); else root.removeEventListener("resize", this.onResize);
    if (this.io) this.io.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    if (reduziert.removeEventListener) reduziert.removeEventListener("change", this.onMotion);
    if (this.opts.tooltip) this.opts.tooltip(null);
  };

  root.Radar = Radar;
})(window);
