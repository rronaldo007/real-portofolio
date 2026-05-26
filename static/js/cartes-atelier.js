/* ============================================================
   cartes-atelier.js — freeform card-design playground
   Blank SVG canvas: add text / shapes / lines / photo / QR,
   drag to position, resize via handles, edit in the inspector.
   + Combinaisons (palette roles) and Modèles (starter designs)
   for non-designers. Saves to the shared library (rr-cartes-v1).
   Rendering + export from window.CartesCore.
   ============================================================ */
(function () {
  "use strict";

  var C = window.CartesCore;
  if (!C) { console.error("cartes-atelier: CartesCore missing"); return; }
  var FORMATS = C.FORMATS;
  var STORE_KEY = "rr-cartes-v1";
  var SLOT_LABEL = { bg: "Fond", ink: "Encre", sub: "Second.", accent: "Accent" };

  // ── curated colour combinations (roles: bg / ink / sub / accent) ──
  var PALETTES = [
    { name: "Encre", bg: "#15130f", ink: "#f5f2ec", sub: "#b8b2a6", accent: "#c084fc" },
    { name: "Lait", bg: "#f6f3ed", ink: "#15130f", sub: "#6d6760", accent: "#7c3aed" },
    { name: "Menthe", bg: "#0e1512", ink: "#eafff5", sub: "#9fc7b6", accent: "#6ee7b7" },
    { name: "Safran", bg: "#1a160c", ink: "#fdf6e3", sub: "#cbb98a", accent: "#fcd34d" },
    { name: "Pivoine", bg: "#1a0f15", ink: "#ffeef6", sub: "#d8a9bf", accent: "#f472b6" },
    { name: "Faïence", bg: "#0c1320", ink: "#eaf2ff", sub: "#9fb6d8", accent: "#93c5fd" },
    { name: "Ardoise", bg: "#16181c", ink: "#eef0f3", sub: "#9aa0a8", accent: "#cbd2da" },
    { name: "Or & nuit", bg: "#0a0908", ink: "#f0e9d8", sub: "#b09a6b", accent: "#d4af7a" }
  ];
  function palByName(n) { return PALETTES.find(function (p) { return p.name === n; }) || PALETTES[0]; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ── starter templates (editable freeform designs, colours = roles) ──
  function mono(x, y, t, size, fill, opt) { return Object.assign({ type: "text", x: x, y: y, text: t, size: size, family: "Geist Mono", fill: fill, spacing: 0.3 }, opt || {}); }
  function serif(x, y, t, size, fill, opt) { return Object.assign({ type: "text", x: x, y: y, text: t, size: size, family: "Instrument Serif", italic: true, fill: fill }, opt || {}); }

  var STARTERS = [
    {
      name: "Vierge", palette: "Encre", format: "classique",
      front: { bg: "bg", els: [] }, back: { bg: "ink", els: [] }
    },
    {
      name: "Minimal", palette: "Encre", format: "classique",
      front: {
        bg: "bg", els: [
          mono(6, 13, "— CARTE", 2.6, "sub"),
          serif(6, 30, "Rukundo", 9, "ink"),
          { type: "text", x: 6, y: 39, text: "Ronaldo", size: 9, family: "Instrument Serif", fill: "accent" },
          { type: "line", x1: 6, y1: 45, x2: 79, y2: 45, stroke: "sub", w: 0.2 },
          mono(6, 50, "DESIGNER & DÉVELOPPEUR", 2.6, "sub")
        ]
      },
      back: {
        bg: "ink", els: [
          mono(6, 13, "— CONTACT", 2.6, "accent"),
          mono(6, 26, "hello@rukundo.dev", 3.2, "bg", { spacing: 0 }),
          mono(6, 33, "+33 6 12 34 56 78", 3.2, "bg", { spacing: 0 }),
          mono(6, 40, "rukundo.dev", 3.2, "bg", { spacing: 0 }),
          { type: "qr", x: 58, y: 31, size: 18, target: "rukundo.dev", dark: "bg", light: "" }
        ]
      }
    },
    {
      name: "Centré", palette: "Lait", format: "classique",
      front: {
        bg: "bg", els: [
          serif(42.5, 26, "Rukundo Ronaldo", 7, "ink", { anchor: "middle" }),
          mono(42.5, 34, "DESIGNER · DÉVELOPPEUR", 2.6, "sub", { anchor: "middle" }),
          { type: "rect", x: 38, y: 38, w: 9, h: 0.7, fill: "accent" }
        ]
      },
      back: {
        bg: "bg", els: [
          { type: "qr", x: 32.5, y: 12, size: 20, target: "rukundo.dev", dark: "ink", light: "" },
          mono(42.5, 42, "SCANNEZ-MOI", 2.6, "sub", { anchor: "middle" })
        ]
      }
    },
    {
      name: "Bandeau", palette: "Pivoine", format: "classique",
      front: {
        bg: "bg", els: [
          { type: "rect", x: 0, y: 0, w: 4, h: 55, fill: "accent" },
          serif(12, 28, "Rukundo", 8.5, "ink"),
          { type: "text", x: 12, y: 37, text: "Ronaldo", size: 8.5, family: "Instrument Serif", fill: "accent" },
          mono(12, 46, "rukundo.dev", 3, "sub")
        ]
      },
      back: {
        bg: "bg", els: [
          { type: "rect", x: 0, y: 0, w: 4, h: 55, fill: "accent" },
          mono(12, 16, "— CONTACT", 2.6, "accent"),
          mono(12, 28, "hello@rukundo.dev", 3.2, "ink", { spacing: 0 }),
          mono(12, 35, "+33 6 12 34 56 78", 3.2, "ink", { spacing: 0 }),
          { type: "qr", x: 58, y: 31, size: 18, target: "rukundo.dev", dark: "ink", light: "" }
        ]
      }
    },
    {
      name: "Photo", palette: "Or & nuit", format: "classique",
      front: {
        bg: "bg", els: [
          { type: "photo", x: 6, y: 12, w: 31, h: 31, round: true },
          serif(42, 25, "Rukundo", 7, "ink"),
          { type: "text", x: 42, y: 33, text: "Ronaldo", size: 7, family: "Instrument Serif", fill: "accent" },
          mono(42, 42, "DESIGNER", 2.6, "sub")
        ]
      },
      back: {
        bg: "ink", els: [
          mono(6, 13, "— CONTACT", 2.6, "accent"),
          mono(6, 27, "hello@rukundo.dev", 3.2, "bg", { spacing: 0 }),
          mono(6, 34, "rukundo.dev", 3.2, "bg", { spacing: 0 }),
          { type: "qr", x: 58, y: 31, size: 18, target: "rukundo.dev", dark: "bg", light: "" }
        ]
      }
    }
  ];

  // ── editor state ─────────────────────────────────────────
  var ed = {
    name: "Sans titre",
    format: "classique",
    side: "front",
    palette: clone(PALETTES[0]),
    front: { bg: "bg", els: [] },
    back: { bg: "ink", els: [] },
    selected: null,
    editId: null,
    photo: null
  };
  function curFace() { return ed[ed.side]; }
  function fmt() { return FORMATS[ed.format] || FORMATS.classique; }
  function uid() { return "e" + Math.random().toString(36).slice(2, 8); }
  function col(v) { return C.resolveColor(v, ed.palette); }

  // ── store / draft ────────────────────────────────────────
  function loadStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { return {}; } }
  function saveStore(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }
  function serialize() { return { name: ed.name, format: ed.format, palette: ed.palette, front: ed.front, back: ed.back }; }
  function saveDraft() { var s = loadStore(); s.atelierDraft = serialize(); if (ed.photo) s.photo = ed.photo; saveStore(s); }
  function loadDraft() {
    var s = loadStore();
    ed.photo = s.photo || null;
    if (s.atelierDraft) {
      var d = s.atelierDraft;
      ed.name = d.name || "Sans titre";
      ed.format = d.format || "classique";
      ed.palette = d.palette || clone(PALETTES[0]);
      ed.front = d.front || { bg: "bg", els: [] };
      ed.back = d.back || { bg: "ink", els: [] };
    }
  }

  // ============================================================
  //  ELEMENT MODEL
  // ============================================================
  function makeEl(type) {
    var f = fmt(), W = f.w, H = f.h;
    var base = { id: uid(), type: type };
    if (type === "text") return Object.assign(base, { x: W * 0.12, y: H * 0.5, text: "Texte", size: H * 0.13, family: "Instrument Serif", italic: true, weight: "", fill: "ink", anchor: "start", spacing: 0, upper: false });
    if (type === "rect") return Object.assign(base, { x: W * 0.2, y: H * 0.2, w: W * 0.3, h: H * 0.18, fill: "accent", rx: 0 });
    if (type === "line") return Object.assign(base, { x1: W * 0.2, y1: H * 0.5, x2: W * 0.8, y2: H * 0.5, stroke: "sub", w: 0.3 });
    if (type === "photo") return Object.assign(base, { x: W * 0.12, y: H * 0.2, w: H * 0.5, h: H * 0.5, round: true });
    if (type === "qr") return Object.assign(base, { x: W * 0.62, y: H * 0.45, size: H * 0.4, target: "rukundo.dev", dark: "ink", light: "" });
    return base;
  }
  function addEl(type) { var e = makeEl(type); curFace().els.push(e); ed.selected = e.id; render(); buildInspector(); saveDraft(); }
  function getEl(id) { return curFace().els.find(function (e) { return e.id === id; }); }
  function selectedEl() { return ed.selected ? getEl(ed.selected) : null; }

  function elMarkup(e) {
    switch (e.type) {
      case "text": return C.T(e.x, e.y, e.text, { size: e.size, family: e.family, fill: col(e.fill), weight: e.weight, italic: e.italic, anchor: e.anchor, spacing: e.spacing, upper: e.upper });
      case "rect": return C.rect(e.x, e.y, e.w, e.h, col(e.fill), e.rx);
      case "line": return C.line(e.x1, e.y1, e.x2, e.y2, col(e.stroke), e.w) +
        '<line x1="' + e.x1 + '" y1="' + e.y1 + '" x2="' + e.x2 + '" y2="' + e.y2 + '" stroke="transparent" stroke-width="' + Math.max(2, (e.w || 0.3) * 5) + '"/>';
      case "photo": return C.photoNode(e.x, e.y, e.w, e.h, { photo: ed.photo, accent: ed.palette.accent, initial: "R" }, e.round);
      case "qr": return C.qrGroup(C.qrText(e.target || ""), e.x, e.y, e.size, col(e.dark), e.light ? col(e.light) : null);
    }
    return "";
  }
  function elBBox(e) {
    if (e.type === "rect" || e.type === "photo") return { x: e.x, y: e.y, w: e.w, h: e.h };
    if (e.type === "qr") return { x: e.x, y: e.y, w: e.size, h: e.size };
    if (e.type === "line") { var pad = fmt().h * 0.02; return { x: Math.min(e.x1, e.x2) - pad, y: Math.min(e.y1, e.y2) - pad, w: Math.abs(e.x2 - e.x1) + 2 * pad, h: Math.abs(e.y2 - e.y1) + 2 * pad }; }
    if (e.type === "text") { var node = canvas.querySelector('[data-id="' + e.id + '"] text'); if (node) { var b = node.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } }
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  // ============================================================
  //  CANVAS RENDER
  // ============================================================
  var SVGNS = "http://www.w3.org/2000/svg";
  var canvas = document.getElementById("at-canvas");
  function render() {
    if (!canvas) return;
    var f = fmt(), face = curFace();
    canvas.setAttribute("viewBox", "0 0 " + f.w + " " + f.h);
    canvas.style.aspectRatio = f.w + " / " + f.h;
    var parts = [C.rect(0, 0, f.w, f.h, col(face.bg))];
    face.els.forEach(function (e) { parts.push('<g data-id="' + e.id + '" style="cursor:move">' + elMarkup(e) + "</g>"); });
    canvas.innerHTML = parts.join("");
    drawChrome();
  }
  function drawChrome() {
    var e = selectedEl(); if (!e) return;
    var b = elBBox(e), f = fmt(), sw = Math.max(f.w, f.h) * 0.004, hs = Math.max(f.w, f.h) * 0.022;
    var handles = (e.type === "line")
      ? handleMark(e.x1, e.y1, hs, "p1") + handleMark(e.x2, e.y2, hs, "p2")
      : handleMark(b.x + b.w, b.y + b.h, hs, "se");
    var g = document.createElementNS(SVGNS, "g");
    g.innerHTML = '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h +
      '" fill="none" stroke="#c084fc" stroke-width="' + sw + '" stroke-dasharray="' + (sw * 3) + ' ' + (sw * 3) + '" pointer-events="none"/>' + handles;
    canvas.appendChild(g);
  }
  function handleMark(x, y, s, name) {
    return '<rect data-handle="' + name + '" x="' + (x - s / 2) + '" y="' + (y - s / 2) + '" width="' + s + '" height="' + s +
      '" rx="' + (s * 0.2) + '" fill="#fff" stroke="#c084fc" stroke-width="' + (s * 0.15) + '" style="cursor:nwse-resize"/>';
  }
  function svgPt(evt) { var pt = canvas.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; return pt.matrixTransform(canvas.getScreenCTM().inverse()); }

  // ── drag (window-driven) ─────────────────────────────────
  var drag = null;
  function onCanvasDown(evt) {
    var hEl = evt.target.closest("[data-handle]");
    if (hEl && ed.selected) { startDrag(evt, hEl.getAttribute("data-handle")); return; }
    var gEl = evt.target.closest("[data-id]");
    if (gEl) { ed.selected = gEl.getAttribute("data-id"); render(); buildInspector(); startDrag(evt, "move"); return; }
    ed.selected = null; render(); buildInspector();
  }
  function startDrag(evt, mode) {
    evt.preventDefault();
    var e = selectedEl(); if (!e) return;
    drag = { mode: mode, start: svgPt(evt), el: e, snap: clone(e), bbox: elBBox(e) };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragUp);
  }
  function onDragMove(evt) {
    if (!drag) return;
    var p = svgPt(evt), dx = p.x - drag.start.x, dy = p.y - drag.start.y, e = drag.el, s = drag.snap;
    if (drag.mode === "move") {
      if (e.type === "line") { e.x1 = s.x1 + dx; e.y1 = s.y1 + dy; e.x2 = s.x2 + dx; e.y2 = s.y2 + dy; }
      else { e.x = s.x + dx; e.y = s.y + dy; }
    } else if (drag.mode === "p1") { e.x1 = s.x1 + dx; e.y1 = s.y1 + dy; }
    else if (drag.mode === "p2") { e.x2 = s.x2 + dx; e.y2 = s.y2 + dy; }
    else if (drag.mode === "se") {
      if (e.type === "qr") e.size = Math.max(4, s.size + Math.max(dx, dy));
      else if (e.type === "text") { var ratio = drag.bbox.w ? (drag.bbox.w + dx) / drag.bbox.w : 1; e.size = Math.max(2, s.size * Math.max(0.2, ratio)); }
      else { e.w = Math.max(2, s.w + dx); e.h = Math.max(2, s.h + dy); }
    }
    render(); syncInspectorValues();
  }
  function onDragUp() { drag = null; window.removeEventListener("pointermove", onDragMove); window.removeEventListener("pointerup", onDragUp); saveDraft(); }

  // ============================================================
  //  COLOUR CONTROL (palette swatches + custom)
  // ============================================================
  function colorCtlHtml(k, val, allowNone) {
    var slots = C.PALETTE_KEYS;
    var sw = slots.map(function (s) {
      return '<button type="button" class="cc-sw' + (val === s ? " on" : "") + '" data-cc="' + k + '" data-slot="' + s + '" style="background:' + ed.palette[s] + '" title="' + SLOT_LABEL[s] + '"></button>';
    }).join("");
    if (allowNone) sw += '<button type="button" class="cc-sw none' + ((val === "" || val == null) ? " on" : "") + '" data-cc="' + k + '" data-slot="" title="Aucun">∅</button>';
    var isCustom = slots.indexOf(val) < 0 && !(allowNone && (val === "" || val == null));
    var cust = (typeof val === "string" && /^#/.test(val)) ? val : "#888888";
    return '<span class="cc">' + sw + '<input type="color" class="cc-cust' + (isCustom ? " on" : "") + '" data-cc="' + k + '" value="' + cust + '" title="Personnalisé"/></span>';
  }
  function wireColorControls(scope, target, after) {
    scope.querySelectorAll(".cc-sw").forEach(function (b) {
      b.addEventListener("click", function () { var t = target(); if (!t) return; t[b.getAttribute("data-cc")] = b.getAttribute("data-slot"); after(); });
    });
    scope.querySelectorAll(".cc-cust").forEach(function (inp) {
      inp.addEventListener("input", function () { var t = target(); if (!t) return; t[inp.getAttribute("data-cc")] = inp.value; after(); });
    });
  }

  // ============================================================
  //  INSPECTOR
  // ============================================================
  var FIELDS = {
    text: [
      { k: "text", label: "Texte", t: "text" },
      { k: "size", label: "Taille", t: "num", step: 0.5 },
      { k: "family", label: "Police", t: "sel", opts: [["Instrument Serif", "Serif"], ["Geist", "Sans"], ["Geist Mono", "Mono"]] },
      { k: "weight", label: "Graisse", t: "sel", opts: [["", "Normal"], ["500", "Medium"], ["600", "Semibold"], ["700", "Bold"]] },
      { k: "italic", label: "Italique", t: "bool" },
      { k: "upper", label: "Majuscules", t: "bool" },
      { k: "anchor", label: "Alignement", t: "sel", opts: [["start", "Gauche"], ["middle", "Centre"], ["end", "Droite"]] },
      { k: "spacing", label: "Interlettre", t: "num", step: 0.05 },
      { k: "fill", label: "Couleur", t: "color" }
    ],
    rect: [{ k: "w", label: "Largeur", t: "num", step: 0.5 }, { k: "h", label: "Hauteur", t: "num", step: 0.5 }, { k: "rx", label: "Arrondi", t: "num", step: 0.2 }, { k: "fill", label: "Couleur", t: "color" }],
    line: [{ k: "stroke", label: "Couleur", t: "color" }, { k: "w", label: "Épaisseur", t: "num", step: 0.1 }],
    photo: [{ k: "w", label: "Largeur", t: "num", step: 0.5 }, { k: "h", label: "Hauteur", t: "num", step: 0.5 }, { k: "round", label: "Cercle", t: "bool" }],
    qr: [{ k: "target", label: "Lien (URL)", t: "text" }, { k: "size", label: "Taille", t: "num", step: 0.5 }, { k: "dark", label: "Points", t: "color" }, { k: "light", label: "Fond", t: "color", none: true }]
  };
  var inspector = document.getElementById("at-inspector");
  function buildInspector() {
    if (!inspector) return;
    var e = selectedEl();
    if (!e) { inspector.innerHTML = '<div class="at-empty">Aucun élément sélectionné.<br/>Choisissez un modèle, ajoutez un élément, ou cliquez-en un sur la carte.</div>'; return; }
    var rows = ['<div class="at-insp-hd"><span>' + typeLabel(e.type) + '</span><span class="at-id">#' + e.id + "</span></div>"];
    if (e.type !== "line") { rows.push(numRow("x", "X", 0.5, e.x)); rows.push(numRow("y", "Y", 0.5, e.y)); }
    (FIELDS[e.type] || []).forEach(function (f) { rows.push(fieldRow(f, e[f.k])); });
    rows.push('<div class="at-insp-actions"><button data-act="dup" data-hover>Dupliquer</button><button data-act="front" data-hover>Avant</button><button data-act="back" data-hover>Arrière</button><button data-act="del" class="danger" data-hover>Supprimer</button></div>');
    inspector.innerHTML = rows.join("");
    wireInspector(e);
  }
  function typeLabel(t) { return { text: "Texte", rect: "Rectangle", line: "Ligne", photo: "Photo", qr: "QR code" }[t] || t; }
  function round2(v) { return (typeof v === "number") ? Math.round(v * 100) / 100 : v; }
  function numRow(k, label, step, val) { return '<label class="at-row"><span>' + label + '</span><input type="number" step="' + step + '" data-k="' + k + '" value="' + round2(val) + '"/></label>'; }
  function fieldRow(f, val) {
    if (f.t === "num") return numRow(f.k, f.label, f.step || 1, val);
    if (f.t === "color") return '<div class="at-row"><span>' + f.label + "</span>" + colorCtlHtml(f.k, val, f.none) + "</div>";
    if (f.t === "bool") return '<label class="at-row at-check"><span>' + f.label + '</span><input type="checkbox" data-k="' + f.k + '"' + (val ? " checked" : "") + "/></label>";
    if (f.t === "sel") return '<label class="at-row"><span>' + f.label + '</span><select data-k="' + f.k + '">' + f.opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(val) === String(o[0]) ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>";
    return '<label class="at-row"><span>' + f.label + '</span><input type="text" data-k="' + f.k + '" value="' + C.esc(val == null ? "" : val) + '"/></label>';
  }
  function wireInspector(e) {
    inspector.querySelectorAll("input[data-k], select[data-k]").forEach(function (inp) {
      var k = inp.getAttribute("data-k");
      var evt = (inp.type === "checkbox" || inp.tagName === "SELECT") ? "change" : "input";
      inp.addEventListener(evt, function () {
        if (inp.type === "checkbox") e[k] = inp.checked;
        else if (inp.type === "number") e[k] = parseFloat(inp.value) || 0;
        else e[k] = inp.value;
        render(); saveDraft();
      });
    });
    wireColorControls(inspector, selectedEl, function () { render(); buildInspector(); saveDraft(); });
    inspector.querySelectorAll("[data-act]").forEach(function (b) { b.addEventListener("click", function () { doAction(b.getAttribute("data-act"), e); }); });
  }
  function syncInspectorValues() {
    var e = selectedEl(); if (!e || !inspector) return;
    inspector.querySelectorAll('input[type="number"][data-k]').forEach(function (inp) {
      var k = inp.getAttribute("data-k");
      if (typeof e[k] === "number" && document.activeElement !== inp) inp.value = round2(e[k]);
    });
  }
  function doAction(act, e) {
    var els = curFace().els, i = els.indexOf(e);
    if (act === "del") { els.splice(i, 1); ed.selected = null; }
    else if (act === "dup") { var c = clone(e); c.id = uid(); if (c.x != null) { c.x += fmt().w * 0.03; c.y += fmt().h * 0.03; } els.splice(i + 1, 0, c); ed.selected = c.id; }
    else if (act === "front") { els.splice(i, 1); els.push(e); }
    else if (act === "back") { els.splice(i, 1); els.unshift(e); }
    render(); buildInspector(); saveDraft();
  }

  // ============================================================
  //  ASIDE — starters + palettes
  // ============================================================
  function buildStarters() {
    var host = document.getElementById("at-starters");
    if (!host) return;
    var f = FORMATS.classique;
    host.innerHTML = STARTERS.map(function (st, i) {
      var pal = palByName(st.palette);
      var inner = C.renderElements(st.front.els, st.front.bg, f.w, f.h, { palette: pal, initial: "R" });
      var svg = '<svg viewBox="0 0 ' + f.w + " " + f.h + '" preserveAspectRatio="xMidYMid meet">' + inner + "</svg>";
      return '<button class="at-card" data-starter="' + i + '" data-hover><span class="thumb">' + svg + "</span><span class='nm'>" + C.esc(st.name) + "</span></button>";
    }).join("");
    host.querySelectorAll("[data-starter]").forEach(function (b) {
      b.addEventListener("click", function () { loadStarter(STARTERS[+b.getAttribute("data-starter")]); });
    });
  }
  function loadStarter(st) {
    ed.name = st.name === "Vierge" ? "Sans titre" : st.name;
    ed.format = st.format || "classique";
    ed.palette = clone(palByName(st.palette));
    ed.side = "front";
    ed.front = { bg: st.front.bg, els: st.front.els.map(function (e) { return Object.assign(clone(e), { id: uid() }); }) };
    ed.back = { bg: st.back.bg, els: st.back.els.map(function (e) { return Object.assign(clone(e), { id: uid() }); }) };
    ed.selected = null; ed.editId = null;
    refreshAll(); buildPalettes();
  }
  function buildPalettes() {
    var host = document.getElementById("at-palettes");
    if (!host) return;
    host.innerHTML = PALETTES.map(function (p) {
      var on = p.name === ed.palette.name ? " on" : "";
      var chips = ["bg", "ink", "accent"].map(function (s) { return '<i style="background:' + p[s] + '"></i>'; }).join("");
      return '<button class="at-pal' + on + '" data-pal="' + C.esc(p.name) + '" data-hover title="' + C.esc(p.name) + '"><span class="chips">' + chips + "</span><span class='nm'>" + C.esc(p.name) + "</span></button>";
    }).join("");
    host.querySelectorAll("[data-pal]").forEach(function (b) {
      b.addEventListener("click", function () { applyPalette(palByName(b.getAttribute("data-pal"))); });
    });
  }
  function applyPalette(p) {
    ed.palette = clone(p);
    render(); buildInspector(); buildBgCtl(); buildPalettes(); saveDraft();
  }

  // ============================================================
  //  TOOLBAR
  // ============================================================
  function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function buildBgCtl() {
    var c = document.getElementById("at-bg-ctl"); if (!c) return;
    c.innerHTML = colorCtlHtml("bg", curFace().bg, false);
    wireColorControls(c, curFace, function () { render(); saveDraft(); buildBgCtl(); });
  }
  function bind(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener("click", fn); }
  function downscale(dataURL, maxSide, cb) {
    var img = new Image();
    img.onload = function () {
      var sc = Math.min(1, maxSide / Math.max(img.width, img.height));
      var w = Math.round(img.width * sc), h = Math.round(img.height * sc);
      var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(img, 0, 0, w, h);
      try { cb(cv.toDataURL("image/jpeg", 0.85)); } catch (e) { cb(dataURL); }
    };
    img.onerror = function () { cb(dataURL); };
    img.src = dataURL;
  }
  function wireToolbar() {
    document.querySelectorAll("[data-add]").forEach(function (b) { b.addEventListener("click", function () { addEl(b.getAttribute("data-add")); }); });
    document.querySelectorAll("[data-side]").forEach(function (b) {
      b.addEventListener("click", function () {
        ed.side = b.getAttribute("data-side"); ed.selected = null;
        document.querySelectorAll("[data-side]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
        render(); buildInspector(); buildBgCtl();
      });
    });
    var fmtSel = document.getElementById("at-format");
    if (fmtSel) { fmtSel.value = ed.format; fmtSel.addEventListener("change", function () { ed.format = fmtSel.value; render(); saveDraft(); }); }
    var nameInp = document.getElementById("at-name");
    if (nameInp) { nameInp.value = ed.name; nameInp.addEventListener("input", function () { ed.name = nameInp.value || "Sans titre"; saveDraft(); }); }
    var photo = document.getElementById("at-photo"), photoClear = document.getElementById("at-photo-clear");
    if (photo) photo.addEventListener("change", function () {
      var file = photo.files && photo.files[0]; if (!file) return;
      var r = new FileReader();
      r.onload = function () { downscale(r.result, 600, function (d) { ed.photo = d; saveDraft(); render(); }); };
      r.readAsDataURL(file);
    });
    if (photoClear) photoClear.addEventListener("click", function () { ed.photo = null; saveDraft(); render(); if (photo) photo.value = ""; });
    bind("at-new", newDesign);
    bind("at-save", saveToLibrary);
    buildLoadList();
    [["at-ex-svg", "svg"], ["at-ex-png", "png"], ["at-ex-jpg", "jpg"], ["at-ex-pdf", "pdf"]].forEach(function (p) {
      bind(p[0], function () { doExport(p[1], document.getElementById(p[0])); });
    });
  }
  function newDesign() {
    if (curFace().els.length && !window.confirm("Nouveau design ? Le travail non enregistré sera perdu.")) return;
    loadStarter(STARTERS[0]); // "Vierge"
  }
  function saveToLibrary() {
    var name = (window.prompt("Nom du design :", ed.name) || "").trim();
    if (!name) return;
    ed.name = name;
    var s = loadStore(); s.custom = s.custom || {};
    var id = ed.editId || ("freeform-" + Date.now().toString(36));
    ed.editId = id;
    s.custom[id] = { type: "freeform", name: name, format: ed.format, palette: ed.palette, front: ed.front, back: ed.back };
    s.design = id; s.atelierDraft = serialize();
    if (ed.photo) s.photo = ed.photo;
    saveStore(s); buildLoadList(); flash("at-save", "✓ Enregistré");
  }
  function buildLoadList() {
    var sel = document.getElementById("at-load"); if (!sel) return;
    var custom = loadStore().custom || {};
    var opts = ['<option value="">— Charger un design —</option>'];
    Object.keys(custom).forEach(function (id) { if (custom[id] && custom[id].type === "freeform") opts.push('<option value="' + id + '">' + C.esc(custom[id].name) + "</option>"); });
    sel.innerHTML = opts.join("");
    sel.onchange = function () {
      var id = sel.value; if (!id) return;
      var d = (loadStore().custom || {})[id]; if (!d) return;
      ed.name = d.name; ed.format = d.format || "classique"; ed.palette = d.palette || clone(PALETTES[0]); ed.side = "front";
      ed.front = d.front || { bg: "bg", els: [] }; ed.back = d.back || { bg: "ink", els: [] };
      ed.selected = null; ed.editId = id;
      refreshAll(); buildPalettes(); sel.value = "";
    };
  }
  function flash(id, msg) {
    var el = document.getElementById(id); if (!el) return;
    var old = el.textContent; el.textContent = msg; el.classList.add("ok");
    setTimeout(function () { el.textContent = old; el.classList.remove("ok"); }, 1400);
  }
  function doExport(type, btn) {
    if (btn) btn.classList.add("is-busy");
    var f = fmt(), ctx = { photo: ed.photo, initial: "R", palette: ed.palette };
    var front = C.renderElements(ed.front.els, ed.front.bg, f.w, f.h, ctx);
    var back = C.renderElements(ed.back.els, ed.back.bg, f.w, f.h, ctx);
    var name = "carte-" + ed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + ed.format;
    C.exportSheet({ frontInner: front, backInner: back, w: f.w, h: f.h, name: name, type: type })
      .catch(function (e) { console.error(e); window.alert("Export impossible : " + e); })
      .then(function () { if (btn) btn.classList.remove("is-busy"); });
  }

  // ============================================================
  function refreshAll() {
    var nameInp = document.getElementById("at-name"); if (nameInp) nameInp.value = ed.name;
    var fmtSel = document.getElementById("at-format"); if (fmtSel) fmtSel.value = ed.format;
    document.querySelectorAll("[data-side]").forEach(function (x) { x.classList.toggle("is-on", x.getAttribute("data-side") === ed.side); });
    buildBgCtl(); render(); buildInspector(); saveDraft();
  }
  function init() {
    loadDraft();
    if (canvas) canvas.addEventListener("pointerdown", onCanvasDown);
    document.addEventListener("keydown", function (e) {
      var ae = document.activeElement;
      if ((e.key === "Delete" || e.key === "Backspace") && ed.selected && !(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))) {
        var el = selectedEl(); if (el) { doAction("del", el); e.preventDefault(); }
      }
    });
    wireToolbar();
    buildStarters();
    buildPalettes();
    refreshAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
