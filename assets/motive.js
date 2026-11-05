/* Branchen-Motive: erzeugte Materialbilder (SVG) – Dachziegel, Solarzellen, Sichtbeton, Kupferrohre …
   Keine Fotos, keine externen Dateien: Jedes Bild entsteht im Browser aus Formen, Verläufen und Rauschfiltern.
   Motiv.svg(branche, schluessel) liefert ein dekoratives <svg>; der Schlüssel (z. B. die Termin-ID) variiert das Bild stabil. */
(function (root) {
  "use strict";
  var W = 640, H = 200, zaehler = 0;

  function rng(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5; var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function lin(id, stops, x2, y2) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : "") + "/>"; }).join("") + "</linearGradient>";
  }
  /* Filmkorn und Licht – lässt die Flächen wie fotografiert wirken */
  function licht(id, z, staerke) {
    return {
      defs: '<filter id="' + id + 'Lk" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="' + Math.floor(z() * 99) + '"/><feColorMatrix type="saturate" values="0"/></filter>' +
        '<radialGradient id="' + id + 'Lv" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>' +
        lin(id + "Lg", [[0, "#fff", .22 * (staerke || 1)], [.45, "#fff", 0]], 1, .8),
      ueber: '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'Lg)"/>' +
        '<rect width="' + W + '" height="' + H + '" filter="url(#' + id + 'Lk)" opacity=".11" style="mix-blend-mode:overlay"/>' +
        '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'Lv)"/>'
    };
  }

  /* Biberschwanz-Ziegel, versetzt gedeckt */
  function dach(id, z) {
    var d = "", s = "", tw = 34, sch = 21, farben = [];
    for (var k = 0; k < 6; k++) {
      var l = 34 + z() * 12, h = 12 + z() * 8;
      farben.push(lin(id + "z" + k, [[0, "hsl(" + f(h) + ",58%," + f(l + 8) + "%)"], [.7, "hsl(" + f(h) + ",56%," + f(l) + "%)"], [1, "hsl(" + f(h - 3) + ",55%," + f(l - 9) + "%)"]]));
    }
    d += farben.join("");
    for (var r = Math.ceil((H + 10) / sch); r >= -2; r--) {
      var y = r * sch, ver = (Math.abs(r) % 2 ? tw / 2 : 0) - 6;
      for (var x = -tw + ver; x < W + tw; x += tw) {
        var p = "M" + f(x + 1) + "," + f(y) + "h" + (tw - 2) + "v" + 27 + "a" + f((tw - 2) / 2) + ",15 0 0 1 -" + (tw - 2) + ",0z";
        s += '<path d="' + p + '" fill="#2a120a" opacity=".55" transform="translate(0,3)"/>';
        s += '<path d="' + p + '" fill="url(#' + id + "z" + Math.floor(z() * 6) + ')"/>';
      }
    }
    return { grund: "#5a2614", defs: d, inhalt: s };
  }

  /* Monokristalline Module mit Busbars, Alurahmen und Himmelsspiegelung */
  function solar(id, z) {
    var c = 27, defs = lin(id + "c", [[0, "#22386e"], [1, "#0d1838"]]) +
      '<pattern id="' + id + 'p" width="' + c + '" height="' + c + '" patternUnits="userSpaceOnUse">' +
      '<path d="M4,1h' + (c - 9) + 'l3,3v' + (c - 9) + 'l-3,3h-' + (c - 9) + 'l-3,-3v-' + (c - 9) + 'z" fill="url(#' + id + 'c)"/>' +
      [8, 13.5, 19].map(function (x) { return '<rect x="' + x + '" y="1" width=".7" height="' + (c - 2) + '" fill="#b8c3d6" opacity=".55"/>'; }).join("") +
      '<rect x="1" y="9" width="' + (c - 2) + '" height=".35" fill="#8fa0bd" opacity=".35"/><rect x="1" y="18" width="' + (c - 2) + '" height=".35" fill="#8fa0bd" opacity=".35"/></pattern>' +
      lin(id + "r", [[0, "#e6eaef"], [.5, "#9aa3ad"], [1, "#d3d8de"]]) +
      lin(id + "h", [[0, "#cfe0ff", .55], [.35, "#9cb9ef", .12], [.6, "#fff", 0]], 1, 1);
    var s = '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'r)"/>', mw = c * 6 + 2, mh = c * 4 + 2, ox = -Math.floor(z() * c * 3);
    for (var my = -40; my < H; my += mh + 8) for (var mx = ox; mx < W; mx += mw + 8) {
      s += '<rect x="' + mx + '" y="' + my + '" width="' + mw + '" height="' + mh + '" fill="#0a1229"/>' +
        '<rect x="' + (mx + 1) + '" y="' + (my + 1) + '" width="' + (mw - 2) + '" height="' + (mh - 2) + '" fill="url(#' + id + 'p)" transform="translate(0,0)"/>';
    }
    s += '<path d="M' + f(W * (.2 + z() * .2)) + ',0 L' + W + ',0 L' + W + ',' + H + ' L' + f(W * (.55 + z() * .2)) + ',' + H + 'z" fill="url(#' + id + 'h)"/>';
    return { grund: "#0d1838", defs: defs, inhalt: s, lichtStaerke: .6 };
  }

  /* Sichtbeton mit Schalungsfugen, Ankerlöchern und Luftporen */
  function beton(id, z) {
    var defs = '<filter id="' + id + 'b" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="5" seed="' + Math.floor(z() * 99) + '"/>' +
      '<feDiffuseLighting surfaceScale="2.2" lighting-color="#d9dad6" result="l"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>' +
      '<feComposite in="l" in2="SourceGraphic" operator="in"/></filter>' +
      '<radialGradient id="' + id + 'a"><stop offset="0" stop-color="#2d2f30"/><stop offset=".6" stop-color="#5d6062"/><stop offset=".85" stop-color="#8d908f"/><stop offset="1" stop-color="#b9bbb8"/></radialGradient>';
    var s = '<rect width="' + W + '" height="' + H + '" fill="#a3a5a2" filter="url(#' + id + 'b)"/>', ox = -Math.floor(z() * 140), oy = -Math.floor(z() * 60);
    for (var x = ox; x < W; x += 230) s += '<rect x="' + x + '" y="0" width="1.2" height="' + H + '" fill="#4d5050" opacity=".7"/><rect x="' + (x + 1.2) + '" y="0" width="1" height="' + H + '" fill="#e6e7e3" opacity=".5"/>';
    for (var y = oy + 125; y < H; y += 125) s += '<rect x="0" y="' + y + '" width="' + W + '" height="1.2" fill="#4d5050" opacity=".7"/><rect x="0" y="' + (y + 1.2) + '" width="' + W + '" height="1" fill="#e6e7e3" opacity=".5"/>';
    for (x = ox + 57; x < W; x += 115) for (y = oy + 31; y < H; y += 62) s += '<circle cx="' + x + '" cy="' + y + '" r="5.5" fill="url(#' + id + 'a)"/>';
    for (var i = 0; i < 70; i++) s += '<circle cx="' + f(z() * W) + '" cy="' + f(z() * H) + '" r="' + f(.5 + z() * 1.3) + '" fill="#3c3e3f" opacity="' + f(.35 + z() * .4) + '"/>';
    return { grund: "#9c9e9b", defs: defs, inhalt: s, lichtStaerke: .7 };
  }

  /* Kupferrohre mit Schellen vor dunkler Wand, dazu ein gedämmtes Rohr */
  function rohre(id, z) {
    var defs = lin(id + "k", [[0, "#5a2d12"], [.18, "#b8733d"], [.32, "#f2c19a"], [.45, "#c9824a"], [.8, "#7a3e19"], [1, "#3e1d0a"]]) +
      lin(id + "i", [[0, "#0d0f11"], [.3, "#3a3f45"], [.5, "#24282c"], [1, "#08090a"]]) +
      lin(id + "s", [[0, "#6c737a"], [.35, "#eef1f3"], [.6, "#a5adb4"], [1, "#4b5157"]]) +
      lin(id + "w", [[0, "#2a3138"], [1, "#1a1f24"]]);
    var s = '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'w)"/>', y = 18 + z() * 10, n = 0;
    while (y < H - 10) {
      var d = n === 2 ? 34 : 14 + Math.floor(z() * 14), iso = n === 2;
      s += '<rect x="0" y="' + f(y + d * .55) + '" width="' + W + '" height="' + f(d * .7) + '" fill="#000" opacity=".35" filter="blur(3px)"/>';
      s += '<rect x="0" y="' + f(y) + '" width="' + W + '" height="' + d + '" fill="url(#' + id + (iso ? "i" : "k") + ')"/>';
      for (var x = 40 + z() * 120; x < W; x += 150 + z() * 60) {
        s += '<rect x="' + f(x) + '" y="' + f(y - 4) + '" width="9" height="' + (d + 8) + '" rx="2" fill="url(#' + id + 's)"/><rect x="' + f(x + 2.5) + '" y="' + f(y - 9) + '" width="4" height="6" fill="#596068"/>';
        if (!iso && z() < .45) s += '<rect x="' + f(x + 60) + '" y="' + f(y - 2) + '" width="7" height="' + (d + 4) + '" rx="1.5" fill="url(#' + id + 'k)" opacity=".95"/>';
      }
      y += d + 16 + z() * 10; n++;
    }
    return { grund: "#1a1f24", defs: defs, inhalt: s, lichtStaerke: .6 };
  }

  /* Riffelblech (Tränenblech) */
  function riffel(id, z) {
    var g = 26, defs = lin(id + "g", [[0, "#7f8892"], [.5, "#c4cbd2"], [1, "#6e7781"]], 1, .4) +
      lin(id + "t", [[0, "#f3f6f8"], [.5, "#aeb6be"], [1, "#4f5760"]]) +
      '<pattern id="' + id + 'p" width="' + g + '" height="' + g + '" patternUnits="userSpaceOnUse">' +
      '<g transform="translate(' + g / 4 + ',' + g / 4 + ') rotate(45)"><ellipse rx="8" ry="2.4" cy="1.6" fill="#2f353b" opacity=".55"/><ellipse rx="8" ry="2.4" fill="url(#' + id + 't)"/></g>' +
      '<g transform="translate(' + 3 * g / 4 + ',' + 3 * g / 4 + ') rotate(-45)"><ellipse rx="8" ry="2.4" cy="1.6" fill="#2f353b" opacity=".55"/><ellipse rx="8" ry="2.4" fill="url(#' + id + 't)"/></g></pattern>' +
      '<filter id="' + id + 'b" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".003 .7" numOctaves="2" seed="' + Math.floor(z() * 99) + '"/><feColorMatrix type="saturate" values="0"/></filter>';
    var s = '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/>' +
      '<rect width="' + W + '" height="' + H + '" filter="url(#' + id + 'b)" opacity=".22" style="mix-blend-mode:overlay"/>' +
      '<rect x="-' + Math.floor(z() * g) + '" width="' + (W + g) + '" height="' + H + '" fill="url(#' + id + 'p)"/>';
    return { grund: "#8b949d", defs: defs, inhalt: s };
  }

  /* Trapezblech-Fassade */
  function trapez(id, z) {
    var b = 44, defs = '<pattern id="' + id + 'p" width="' + b + '" height="' + H + '" patternUnits="userSpaceOnUse">' +
      '<rect width="' + b + '" height="' + H + '" fill="#8a949e"/><rect x="0" width="10" height="' + H + '" fill="#dfe4e9"/>' +
      '<rect x="10" width="6" height="' + H + '" fill="#59626b"/><rect x="16" width="22" height="' + H + '" fill="#9aa4ad"/><rect x="38" width="6" height="' + H + '" fill="#c3cad1"/></pattern>' +
      lin(id + "g", [[0, "#fff", .25], [.5, "#000", .15], [1, "#fff", .1]], 1, 0) +
      '<filter id="' + id + 'b" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .004" numOctaves="2" seed="' + Math.floor(z() * 99) + '"/><feColorMatrix type="saturate" values="0"/></filter>';
    var s = '<rect x="-' + Math.floor(z() * b) + '" width="' + (W + b) + '" height="' + H + '" fill="url(#' + id + 'p)"/>' +
      '<rect width="' + W + '" height="' + H + '" filter="url(#' + id + 'b)" opacity=".2" style="mix-blend-mode:overlay"/>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/>';
    for (var x = 30 + z() * 60; x < W; x += 180 + z() * 80) for (var y = 26; y < H; y += 74) s += '<circle cx="' + f(Math.round(x / b) * b + 3 - Math.floor(z() * 0)) + '" cy="' + y + '" r="2.4" fill="#4a5259"/><circle cx="' + f(Math.round(x / b) * b + 3) + '" cy="' + (y - .6) + '" r="1.6" fill="#e9edf0"/>';
    return { grund: "#8a949e", defs: defs, inhalt: s };
  }

  /* Stirnholz: gestapelte Stämme mit Jahresringen und Rinde */
  function stirnholz(id, z) {
    var defs = '<radialGradient id="' + id + 'h" cx=".46" cy=".44" r=".55"><stop offset="0" stop-color="#e2b77d"/><stop offset=".7" stop-color="#c8925a"/><stop offset=".86" stop-color="#9b6638"/><stop offset=".9" stop-color="#4a2c17"/><stop offset="1" stop-color="#2c1a0d"/></radialGradient>';
    var s = "", reihe = 0;
    for (var y = 8; y < H + 40; y += 46, reihe++) {
      for (var x = (reihe % 2 ? 24 : 0) - 10; x < W + 40; x += 50) {
        var r = 21 + z() * 7, cx = x + z() * 6, cy = y + z() * 5;
        s += '<circle cx="' + f(cx + 2) + '" cy="' + f(cy + 4) + '" r="' + f(r) + '" fill="#0b0704" opacity=".6"/>';
        s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="url(#' + id + 'h)"/>';
        for (var k = 1; k < 6; k++) s += '<circle cx="' + f(cx + (z() - .5) * 1.5) + '" cy="' + f(cy + (z() - .5) * 1.5) + '" r="' + f(r * .82 * k / 6) + '" fill="none" stroke="#8a5a30" stroke-width=".7" opacity="' + f(.35 + z() * .3) + '"/>';
        if (z() < .35) { var a = z() * 6.28; s += '<path d="M' + f(cx + Math.cos(a) * r * .3) + "," + f(cy + Math.sin(a) * r * .3) + "L" + f(cx + Math.cos(a + .08) * r * .78) + "," + f(cy + Math.sin(a + .08) * r * .78) + '" stroke="#5a3519" stroke-width=".8" opacity=".5"/>'; }
      }
    }
    return { grund: "#140c06", defs: defs, inhalt: s, lichtStaerke: .7 };
  }

  /* Dielen mit Holzmaserung */
  function holz(id, z) {
    var defs = "", s = "", h = 40;
    for (var k = 0; k < 3; k++) {
      defs += '<filter id="' + id + "m" + k + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0025 .16" numOctaves="3" seed="' + Math.floor(z() * 99) + '"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 .32  0 0 0 0 .18  0 0 0 0 .08  -1.6 0 0 0 1.05"/></filter>';
    }
    var tone = ["#c58d55", "#b77d47", "#d09a62", "#a96f3d"];
    for (var y = 0, r = 0; y < H; y += h, r++) {
      var c = tone[Math.floor(z() * tone.length)];
      s += '<rect y="' + y + '" width="' + W + '" height="' + h + '" fill="' + c + '"/>' +
        '<rect y="' + y + '" width="' + W + '" height="' + h + '" filter="url(#' + id + "m" + (r % 3) + ')" opacity=".75"/>' +
        '<rect y="' + (y + h - 1.4) + '" width="' + W + '" height="1.4" fill="#3b2412" opacity=".8"/>';
      var x = -z() * 260;
      for (; x < W; x += 260 + z() * 140) s += '<rect x="' + f(x) + '" y="' + y + '" width="1.3" height="' + h + '" fill="#3b2412" opacity=".7"/>';
    }
    return { grund: "#b77d47", defs: defs, inhalt: s };
  }

  /* Leiterplatte mit Leiterbahnen, Vias und Chip */
  function platine(id, z) {
    var defs = lin(id + "g", [[0, "#173a33"], [1, "#0b231f"]], 1, 1) + lin(id + "c", [[0, "#2b2f33"], [1, "#121416"]]);
    var s = '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/>', i;
    for (i = 0; i < 26; i++) {
      var x = Math.round(z() * W / 10) * 10, y = Math.round(z() * H / 10) * 10, p = "M" + x + "," + y;
      for (var k = 0; k < 4; k++) {
        var l = 20 + Math.floor(z() * 8) * 10, dir = Math.floor(z() * 4);
        if (dir === 0) x += l; else if (dir === 1) x -= l; else if (dir === 2) { x += l / 2; y += l / 2; } else { y -= l / 2; x += l / 2; }
        p += "L" + x + "," + y;
      }
      s += '<path d="' + p + '" fill="none" stroke="#000" stroke-width="2.6" opacity=".35" transform="translate(1,1.5)"/>' +
        '<path d="' + p + '" fill="none" stroke="#cfa954" stroke-width="2" stroke-linejoin="round" opacity=".85"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="3.4" fill="#e3c27a"/><circle cx="' + x + '" cy="' + y + '" r="1.3" fill="#0b231f"/>';
    }
    var cx = 180 + z() * 280, cy = 40 + z() * 60;
    for (i = 0; i < 12; i++) s += '<rect x="' + (cx + 8 + i * 8) + '" y="' + (cy - 7) + '" width="3.5" height="7" fill="#c9ced3"/><rect x="' + (cx + 8 + i * 8) + '" y="' + (cy + 100) + '" width="3.5" height="7" fill="#c9ced3"/>';
    s += '<rect x="' + (cx + 4) + '" y="' + (cy + 4) + '" width="104" height="100" fill="#000" opacity=".45" rx="3"/><rect x="' + cx + '" y="' + cy + '" width="104" height="100" rx="3" fill="url(#' + id + 'c)"/>' +
      '<circle cx="' + (cx + 12) + '" cy="' + (cy + 12) + '" r="3" fill="#3a3f44"/>';
    return { grund: "#0b231f", defs: defs, inhalt: s, lichtStaerke: .8 };
  }

  /* Gestapelte Seecontainer */
  function container(id, z) {
    var farben = [["#9c3b25", "#6e2817"], ["#1f5f8b", "#143f5d"], ["#2f6b47", "#1f4a30"], ["#8d9399", "#5d6268"], ["#c26d1c", "#874b12"], ["#5a4a8a", "#3c315e"]];
    var defs = "", s = "", ch = 52, k;
    for (k = 0; k < farben.length; k++) defs += '<pattern id="' + id + "w" + k + '" width="9" height="' + ch + '" patternUnits="userSpaceOnUse"><rect width="9" height="' + ch + '" fill="' + farben[k][0] + '"/><rect width="2.5" height="' + ch + '" fill="#fff" opacity=".16"/><rect x="5.5" width="3" height="' + ch + '" fill="#000" opacity=".22"/></pattern>';
    defs += lin(id + "o", [[0, "#000", .3], [.12, "#000", 0], [.9, "#000", 0], [1, "#000", .35]]);
    for (var y = -18, r = 0; y < H; y += ch + 4, r++) {
      for (var x = -Math.floor(z() * 120); x < W; ) {
        var w = z() < .5 ? 122 : 244; k = Math.floor(z() * farben.length);
        s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + ch + '" fill="url(#' + id + "w" + k + ')"/>' +
          '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + ch + '" fill="url(#' + id + 'o)"/>' +
          '<rect x="' + x + '" y="' + y + '" width="7" height="' + ch + '" fill="' + farben[k][1] + '"/><rect x="' + (x + w - 7) + '" y="' + y + '" width="7" height="' + ch + '" fill="' + farben[k][1] + '"/>' +
          '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="5" fill="' + farben[k][1] + '"/><rect x="' + x + '" y="' + (y + ch - 5) + '" width="' + w + '" height="5" fill="' + farben[k][1] + '"/>';
        x += w + 3;
      }
    }
    return { grund: "#1b1f24", defs: defs, inhalt: s };
  }

  /* Blaupause: Gebäudeschnitt mit Maßketten */
  function blaupause(id, z) {
    var defs = '<pattern id="' + id + 'r" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10,0H0V10" fill="none" stroke="#fff" stroke-width=".4" opacity=".14"/></pattern>' +
      '<pattern id="' + id + 'R" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50,0H0V50" fill="none" stroke="#fff" stroke-width=".7" opacity=".2"/></pattern>';
    var ox = 60 + Math.floor(z() * 260), b = 220, st = 'fill="none" stroke="#e8f0ff" stroke-width="1.3" opacity=".85"';
    var s = '<rect width="' + W + '" height="' + H + '" fill="#1c4f86"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'r)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'R)"/>' +
      '<path d="M' + ox + ',170V95L' + (ox + b / 2) + ',38L' + (ox + b) + ',95V170Z" ' + st + "/>" +
      '<path d="M' + (ox - 14) + ',102L' + (ox + b / 2) + ',30L' + (ox + b + 14) + ',102" ' + st + "/>" +
      '<path d="M' + (ox + 24) + ',170V122H' + (ox + 66) + 'V170M' + (ox + 120) + ',110H' + (ox + 190) + 'V146H' + (ox + 120) + 'Z" ' + st + "/>" +
      '<path d="M' + ox + ',186H' + (ox + b) + 'M' + ox + ',181V191M' + (ox + b) + ',181V191M' + (ox + b + 30) + ',170V38M' + (ox + b + 25) + ',170H' + (ox + b + 35) + 'M' + (ox + b + 25) + ',38H' + (ox + b + 35) + '" fill="none" stroke="#e8f0ff" stroke-width=".8" opacity=".6"/>' +
      '<circle cx="' + (ox + b / 2) + '" cy="72" r="9" ' + st + "/>" +
      '<path d="M0,170H' + W + '" stroke="#e8f0ff" stroke-width=".8" stroke-dasharray="8 4 2 4" opacity=".45"/>';
    return { grund: "#1c4f86", defs: defs, inhalt: s, lichtStaerke: .6 };
  }

  /* Ohne Branche: Höhenlinien wie auf der Radarkarte */
  function linien(id, z) {
    var s = '<rect width="' + W + '" height="' + H + '" fill="#1d2935"/>';
    for (var m = 0; m < 3; m++) {
      var cx = z() * W, cy = z() * H;
      for (var k = 1; k < 9; k++) {
        var p = "", r0 = k * 16;
        for (var a = 0; a <= 24; a++) {
          var w = a / 24 * 6.2832, r = r0 * (1 + .18 * Math.sin(w * 3 + m) + .08 * Math.cos(w * 5 + k));
          p += (a ? "L" : "M") + f(cx + Math.cos(w) * r * 1.5) + "," + f(cy + Math.sin(w) * r);
        }
        s += '<path d="' + p + 'Z" fill="none" stroke="#7d93a8" stroke-width=".8" opacity="' + f(.5 - k * .04) + '"/>';
      }
    }
    return { grund: "#1d2935", defs: "", inhalt: s };
  }

  var MOTIVE = {
    "Bau & Immobilien": beton, "Dach & Gebäudehülle": dach, "Energie & Solar": solar, "Gebäudetechnik": rohre,
    "Industrie & Fertigung": riffel, "Metall & Oberflächen": trapez, "Material & Kreislauf": stirnholz, "Handwerk": holz,
    "Software, KI & Daten": platine, "Logistik & Handel": container, "Gründung & Innovation": blaupause
  };

  /* Die spezifischste Branche bestimmt das Motiv: „Gründung & Innovation“ nur, wenn sonst nichts passt */
  function wahl(branchen) {
    var b = (branchen || []).filter(function (x) { return MOTIVE[x]; });
    var genauer = b.filter(function (x) { return x !== "Gründung & Innovation"; });
    return genauer[0] || b[0] || "";
  }

  function svg(branche, schluessel) {
    var id = "mo" + (++zaehler), z = rng((branche || "") + "|" + (schluessel || ""));
    var m = (MOTIVE[branche] || linien)(id, z), l = licht(id, z, m.lichtStaerke);
    return '<svg class="motiv" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style="background:' + m.grund + '">' +
      "<defs>" + m.defs + l.defs + "</defs>" + m.inhalt + l.ueber + "</svg>";
  }

  root.Motiv = { svg: svg, wahl: wahl, branchen: Object.keys(MOTIVE) };
})(window);
