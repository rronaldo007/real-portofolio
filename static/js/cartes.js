/* ============================================================
   cartes.js — Business-card designer (/cartes/)
   Live preview + params + presets + custom/freeform library.
   Rendering & export come from window.CartesCore (cartes-core.js).
   Freeform designs are authored in the playground (/cartes/atelier/)
   and appear here in the design selector, fully exportable.
   ============================================================ */
(function () {
  "use strict";

  var C = window.CartesCore;
  if (!C) { console.error("cartes.js: CartesCore missing"); return; }

  // primitives the DESIGNS below use directly
  var T = C.T, line = C.line, rect = C.rect, up = C.up, qrGroup = C.qrGroup, splitName = C.splitName;
  var FORMATS = C.FORMATS;
  // wrappers keeping the old signatures the DESIGNS expect
  function photoNode(x, y, w, h, st, p, round) {
    return C.photoNode(x, y, w, h, { photo: st.photo, accent: p.accent, panel: p.panel, initial: st.name }, round);
  }
  function qrText(st) { return C.qrText(st.qrTarget || st.website); }

  var STORE_KEY = "rr-cartes-v1";

  var ACCENTS = [
    { v: "#c084fc", name: "Améthyste" }, { v: "#6ee7b7", name: "Menthe" },
    { v: "#fcd34d", name: "Safran" }, { v: "#93c5fd", name: "Faïence" },
    { v: "#f472b6", name: "Pivoine" }, { v: "#e8e3d9", name: "Lait" }
  ];
  var FINISHES = { matte: "Mat", satin: "Satin", hologramme: "Holo", foil: "Foil" };

  var DEFAULTS = window.CARTES_DEFAULTS || {};
  var state = {
    design: DEFAULTS.design || "editoriale",
    format: DEFAULTS.format || "classique",
    accent: DEFAULTS.accent || "#c084fc",
    finish: DEFAULTS.finish || "satin",
    name: DEFAULTS.name || "Rukundo Ronaldo",
    role: DEFAULTS.role || "Designer & Développeur",
    email: DEFAULTS.email || "hello@rukundo.dev",
    phone: DEFAULTS.phone || "+33 6 12 34 56 78",
    website: DEFAULTS.website || "rukundo.dev",
    location: DEFAULTS.location || "Paris · Kigali",
    qrTarget: DEFAULTS.qrTarget || "",
    photo: DEFAULTS.photo || null,
    custom: {}
  };

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (saved) Object.keys(saved).forEach(function (k) {
        if (saved[k] !== undefined && saved[k] !== null) state[k] = saved[k];
      });
    } catch (e) {}
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }

  // ============================================================
  //  PRESET DESIGN REGISTRY (SVG inner markup in [0..W,0..H] mm)
  // ============================================================
  var DESIGNS = {

    editoriale: {
      label: "Éditoriale",
      pal: { bg: "#15130f", ink: "#f5f2ec", sub: "#b8b2a6", panel: "rgba(245,242,236,0.07)" },
      front: function (W, H, st, p) {
        var m = W * 0.07, s = [];
        s.push(rect(0, 0, W, H, p.bg));
        s.push('<rect x="' + (m * 0.55) + '" y="' + (m * 0.55) + '" width="' + (W - m * 1.1) + '" height="' + (H - m * 1.1) + '" fill="none" stroke="' + p.line + '" stroke-width="0.2" rx="1"/>');
        var ck = W * 0.045;
        s.push(line(m, m, m + ck, m, p.accent, 0.3) + line(m, m, m, m + ck, p.accent, 0.3));
        s.push(line(W - m, H - m, W - m - ck, H - m, p.accent, 0.3) + line(W - m, H - m, W - m, H - m - ck, p.accent, 0.3));
        s.push(T(m, m + H * 0.045, "— CARTE · N° 001", { size: H * 0.03, family: "Geist Mono", fill: p.sub, spacing: 0.22 }));
        s.push(T(W - m, m + H * 0.045, "RECTO", { size: H * 0.03, family: "Geist Mono", fill: p.sub, spacing: 0.28, anchor: "end" }));
        var nm = splitName(st.name), nz = H * 0.145;
        s.push(T(m, H * 0.49, nm.first, { size: nz, family: "Instrument Serif", italic: true, fill: p.ink }));
        s.push(T(m, H * 0.49 + nz, nm.last, { size: nz, family: "Instrument Serif", fill: p.accent }));
        s.push(T(m, H * 0.80, up(st.role), { size: H * 0.036, family: "Geist Mono", fill: p.sub, spacing: 0.28 }));
        s.push(line(m, H * 0.865, W - m, H * 0.865, p.line, 0.2, "0.6 0.6"));
        s.push(T(m, H * 0.95, "ATELIER · MMXXVI", { size: H * 0.03, family: "Geist Mono", fill: p.sub, spacing: 0.22 }));
        s.push(T(W - m, H * 0.95, up(st.location), { size: H * 0.03, family: "Geist Mono", fill: p.ink, spacing: 0.22, anchor: "end" }));
        return s.join("");
      },
      back: function (W, H, st, p) {
        var m = W * 0.07, s = [];
        s.push(rect(0, 0, W, H, p.bg2 || p.bg));
        s.push('<rect x="' + (m * 0.55) + '" y="' + (m * 0.55) + '" width="' + (W - m * 1.1) + '" height="' + (H - m * 1.1) + '" fill="none" stroke="' + p.line + '" stroke-width="0.2" rx="1"/>');
        s.push(T(m, m + H * 0.045, "— CONTACT", { size: H * 0.03, family: "Geist Mono", fill: p.sub, spacing: 0.22 }));
        s.push(T(W - m, m + H * 0.045, "VERSO", { size: H * 0.03, family: "Geist Mono", fill: p.accent, spacing: 0.28, anchor: "end" }));
        var fields = [["COURRIEL", st.email], ["TÉLÉPHONE", st.phone], ["SITE", st.website]];
        var y0 = H * 0.30, rowh = H * 0.175;
        fields.forEach(function (f, i) {
          var cy = y0 + i * rowh;
          s.push(T(m, cy, f[0], { size: H * 0.028, family: "Geist Mono", fill: p.sub, spacing: 0.22 }));
          s.push(T(m, cy + H * 0.065, f[1], { size: H * 0.052, family: "Instrument Serif", italic: true, fill: p.ink }));
        });
        s.push(T(m, H * 0.94, "— R.R.", { size: H * 0.07, family: "Instrument Serif", italic: true, fill: p.accent }));
        var q = H * 0.30;
        s.push(qrGroup(qrText(st), W - m - q, H - m - q, q, p.ink, null));
        return s.join("");
      }
    },

    mono: {
      label: "Mono",
      pal: { bg: "#f6f3ed", ink: "#15130f", sub: "#6d6760", panel: "rgba(21,19,15,0.06)" },
      front: function (W, H, st, p) {
        var m = W * 0.08, s = [];
        s.push(rect(0, 0, W, H, p.bg));
        s.push(T(m, m + 2, "RUKUNDO RONALDO — ATELIER", { size: H * 0.032, family: "Geist Mono", fill: p.sub, spacing: 0.35 }));
        s.push(rect(m, H * 0.40, H * 0.05, H * 0.05, p.accent));
        var nm = splitName(st.name);
        s.push(T(m, H * 0.62, nm.first, { size: H * 0.11, family: "Geist", weight: 600, fill: p.ink, spacing: -0.3 }));
        s.push(T(m, H * 0.62 + H * 0.115, nm.last, { size: H * 0.11, family: "Geist", weight: 600, fill: p.sub, spacing: -0.3 }));
        s.push(line(m, H - m - H * 0.05, W - m, H - m - H * 0.05, p.line, 0.2));
        s.push(T(m, H - m, up(st.role), { size: H * 0.034, family: "Geist Mono", fill: p.ink, spacing: 0.25 }));
        s.push(T(W - m, H - m, up(st.website), { size: H * 0.034, family: "Geist Mono", fill: p.sub, spacing: 0.25, anchor: "end" }));
        return s.join("");
      },
      back: function (W, H, st, p) {
        var m = W * 0.08, s = [rect(0, 0, W, H, p.ink)];
        s.push(T(m, m + 2, "— COORDONNÉES", { size: H * 0.032, family: "Geist Mono", fill: p.accent, spacing: 0.3 }));
        var rows = [["COURRIEL", st.email], ["TÉL.", st.phone], ["SITE", st.website], ["LIEU", st.location]];
        var y = H * 0.34;
        rows.forEach(function (r) {
          s.push(T(m, y, r[0], { size: H * 0.033, family: "Geist Mono", fill: "#8a8378", spacing: 0.25 }));
          s.push(T(W - m - H * 0.36 - 2, y, r[1], { size: H * 0.045, family: "Geist Mono", fill: p.bg, anchor: "end" }));
          s.push(line(m, y + H * 0.05, W - m - H * 0.36 - 2, y + H * 0.05, "rgba(245,242,236,0.12)", 0.18));
          y += H * 0.14;
        });
        var q = H * 0.36;
        s.push(qrGroup(qrText(st), W - m - q, m, q, p.bg, p.ink));
        return s.join("");
      }
    },

    photo: {
      label: "Photo",
      pal: { bg: "#15130f", ink: "#f5f2ec", sub: "#b8b2a6", panel: "rgba(245,242,236,0.08)" },
      front: function (W, H, st, p) {
        var m = W * 0.07, s = [];
        s.push(rect(0, 0, W, H, p.bg));
        s.push(rect(0, 0, W * 0.012, H, p.accent));
        var ph = H * 0.56, px = m, py = (H - ph) / 2;
        s.push(photoNode(px, py, ph, ph, st, p, true));
        var tx = px + ph + W * 0.06, nm = splitName(st.name);
        s.push(T(tx, H * 0.46, nm.first, { size: H * 0.115, family: "Instrument Serif", italic: true, fill: p.ink }));
        s.push(T(tx, H * 0.46 + H * 0.12, nm.last, { size: H * 0.115, family: "Instrument Serif", fill: p.accent }));
        s.push(T(tx, H * 0.70, up(st.role), { size: H * 0.036, family: "Geist Mono", fill: p.sub, spacing: 0.25 }));
        s.push(T(tx, H * 0.80, st.website, { size: H * 0.042, family: "Geist Mono", fill: p.ink, spacing: 0.1 }));
        return s.join("");
      },
      back: function (W, H, st, p) {
        var m = W * 0.07, s = [rect(0, 0, W, H, "#0e0d0c")];
        s.push(T(m, m + 2, "— CONTACT", { size: H * 0.032, family: "Geist Mono", fill: p.sub, spacing: 0.25 }));
        s.push(T(W - m, m + 2, "VERSO", { size: H * 0.032, family: "Geist Mono", fill: p.accent, spacing: 0.3, anchor: "end" }));
        var rows = [["COURRIEL", st.email], ["TÉLÉPHONE", st.phone], ["LIEU", st.location]];
        var y = H * 0.40;
        rows.forEach(function (r) {
          s.push(T(m, y, r[0], { size: H * 0.03, family: "Geist Mono", fill: p.sub, spacing: 0.25 }));
          s.push(T(m, y + H * 0.072, r[1], { size: H * 0.055, family: "Instrument Serif", italic: true, fill: p.ink }));
          y += H * 0.20;
        });
        var q = H * 0.40;
        s.push(qrGroup(qrText(st), W - m - q, (H - q) / 2, q, p.ink, null));
        s.push(T(W - m - q / 2, H - m * 0.6, "SCANNEZ-MOI", { size: H * 0.028, family: "Geist Mono", fill: p.sub, anchor: "middle", spacing: 0.25 }));
        return s.join("");
      }
    }
  };

  // ── design resolution (preset / clone / freeform) ────────
  function resolveDesign(key) {
    if (DESIGNS[key]) return { def: DESIGNS[key], freeform: false };
    var c = state.custom[key];
    if (c && c.type === "freeform") return { def: c, freeform: true };
    if (c) {
      var base = DESIGNS[c.base] || DESIGNS.editoriale;
      return { def: { label: c.name, pal: Object.assign({}, base.pal, c.pal || {}), front: base.front, back: base.back }, freeform: false };
    }
    return { def: DESIGNS.editoriale, freeform: false };
  }
  function designLabel(key) {
    if (DESIGNS[key]) return DESIGNS[key].label;
    var c = state.custom[key];
    return c ? c.name : key;
  }
  function designFormat(key) {
    var rd = resolveDesign(key);
    if (rd.freeform) return FORMATS[rd.def.format] || FORMATS.classique;
    return FORMATS[state.format] || FORMATS.classique;
  }
  function paletteFor(key, def) {
    var base = Object.assign({}, def.pal);
    base.accent = state.accent;
    base.line = (base.ink === "#f5f2ec" || base.ink === "#f6f3ed") ? "rgba(245,242,236,0.14)" : "rgba(21,19,15,0.14)";
    if (key === "editoriale") base.bg2 = "#0e0d0c";
    return base;
  }

  function faceInner(key, side) {
    var rd = resolveDesign(key), f = designFormat(key);
    if (rd.freeform) {
      var face = (side === "back" ? rd.def.back : rd.def.front) || { bg: "#15130f", els: [] };
      var ctx = { photo: state.photo, initial: state.name, qrTarget: state.qrTarget || state.website, palette: rd.def.palette || C.DEFAULT_PALETTE };
      return { w: f.w, h: f.h, markup: C.renderElements(face.els, face.bg, f.w, f.h, ctx) };
    }
    var pal = paletteFor(key, rd.def);
    var fn = side === "back" ? rd.def.back : rd.def.front;
    return { w: f.w, h: f.h, markup: fn(f.w, f.h, state, pal) };
  }
  function faceSvg(key, side) {
    var fi = faceInner(key, side);
    return C.faceSvgWrap(fi.markup, fi.w, fi.h);
  }

  // ============================================================
  //  LIVE PREVIEW
  // ============================================================
  var heroStage = document.getElementById("hero-stage");
  var heroCard = document.getElementById("hero-card");

  function applyDims() {
    if (!heroStage) return;
    var f = designFormat(state.design);
    var scale = Math.min(560 / f.w, 440 / f.h);
    heroStage.style.width = (f.w * scale) + "px";
    heroStage.style.height = (f.h * scale) + "px";
  }
  function renderPreview() {
    if (!heroCard) return;
    var front = heroCard.querySelector(".face.front .svg-host");
    var back = heroCard.querySelector(".face.back .svg-host");
    if (front) front.innerHTML = faceSvg(state.design, "front");
    if (back) back.innerHTML = faceSvg(state.design, "back");
    heroCard.setAttribute("data-finish", state.finish);
    applyDims();
  }
  function apply() {
    document.documentElement.style.setProperty("--accent", state.accent);
    document.documentElement.style.setProperty("--accent-soft", "color-mix(in srgb, " + state.accent + " 16%, transparent)");
    renderPreview();
    syncHud();
  }
  function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function syncHud() {
    setText("hero-fmt", designFormat(state.design).label);
    setText("hero-fin", FINISHES[state.finish] || state.finish);
    setText("hero-design", designLabel(state.design));
  }

  // ============================================================
  //  PANEL WIRING
  // ============================================================
  function buildAccents() {
    var host = document.getElementById("tw-accents");
    if (!host) return;
    host.innerHTML = "";
    ACCENTS.forEach(function (opt) {
      var b = document.createElement("button");
      b.className = "tw-sw"; b.style.background = opt.v; b.dataset.v = opt.v;
      b.setAttribute("data-hover", "");
      if (opt.v === state.accent) b.classList.add("is-on");
      b.addEventListener("click", function () {
        state.accent = opt.v; save(); apply();
        host.querySelectorAll(".tw-sw").forEach(function (s) { s.classList.toggle("is-on", s.dataset.v === opt.v); });
        setText("tw-accent-name", opt.name);
      });
      host.appendChild(b);
    });
    var cur = ACCENTS.find(function (o) { return o.v === state.accent; });
    if (cur) setText("tw-accent-name", cur.name);
  }
  function buildDesignSelector() {
    var host = document.getElementById("tw-design");
    if (!host) return;
    host.innerHTML = "";
    Object.keys(DESIGNS).concat(Object.keys(state.custom)).forEach(function (k) {
      var b = document.createElement("button");
      b.dataset.v = k; b.textContent = designLabel(k); b.setAttribute("data-hover", "");
      if (k === state.design) b.classList.add("is-on");
      b.addEventListener("click", function () {
        state.design = k; save(); apply();
        host.querySelectorAll("button").forEach(function (bb) { bb.classList.toggle("is-on", bb === b); });
      });
      host.appendChild(b);
    });
  }
  function labelOf(map, v) { var x = map[v]; return (x && x.label) ? x.label : x; }
  function wireSeg(id, key, map, labelId) {
    var el = document.getElementById(id);
    if (!el) return;
    el.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("data-hover", "");
      b.classList.toggle("is-on", b.dataset.v === state[key]);
      b.addEventListener("click", function () {
        state[key] = b.dataset.v; save(); apply();
        el.querySelectorAll("button").forEach(function (bb) { bb.classList.toggle("is-on", bb === b); });
        if (labelId && map) setText(labelId, labelOf(map, b.dataset.v));
      });
    });
    if (labelId && map) setText(labelId, labelOf(map, state[key]));
  }
  function wireText(id, key) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = state[key] || "";
    el.addEventListener("input", function () { state[key] = el.value; apply(); });
    el.addEventListener("change", save);
  }
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
  function wirePhoto() {
    var input = document.getElementById("tw-photo"), clear = document.getElementById("tw-photo-clear");
    if (input) input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { downscale(reader.result, 600, function (d) { state.photo = d; save(); apply(); }); };
      reader.readAsDataURL(file);
    });
    if (clear) clear.addEventListener("click", function () { state.photo = null; save(); apply(); if (input) input.value = ""; });
  }
  function wireCreate() {
    var btn = document.getElementById("tw-create");
    if (btn) btn.addEventListener("click", function () {
      var name = (window.prompt("Nom du nouveau design :", "Mon design") || "").trim();
      if (!name) return;
      var id = "custom-" + Date.now().toString(36);
      var base = DESIGNS[state.design] ? state.design : (state.custom[state.design] && state.custom[state.design].base) || "editoriale";
      state.custom[id] = { type: "clone", name: name, base: base, pal: {} };
      state.design = id; save(); buildDesignSelector(); apply();
    });
    var del = document.getElementById("tw-delete");
    if (del) del.addEventListener("click", function () {
      if (!state.custom[state.design]) { window.alert("Seuls les designs créés peuvent être supprimés."); return; }
      delete state.custom[state.design]; state.design = "editoriale";
      save(); buildDesignSelector(); apply();
    });
  }
  function wireExport() {
    [["ex-svg", "svg"], ["ex-png", "png"], ["ex-jpg", "jpg"], ["ex-pdf", "pdf"]].forEach(function (p) {
      var el = document.getElementById(p[0]);
      if (!el) return;
      el.addEventListener("click", function () {
        el.classList.add("is-busy");
        var f = faceInner(state.design, "front"), b = faceInner(state.design, "back");
        C.exportSheet({ frontInner: f.markup, backInner: b.markup, w: f.w, h: f.h, name: "carte-" + state.design + "-" + state.format, type: p[1] })
          .catch(function (e) { console.error(e); window.alert("Export impossible : " + e); })
          .then(function () { el.classList.remove("is-busy"); });
      });
    });
  }

  function init() {
    load();
    buildAccents();
    buildDesignSelector();
    wireSeg("tw-format", "format", FORMATS, "tw-fmt-name");
    wireSeg("tw-finish", "finish", FINISHES, "tw-fin-name");
    ["name", "role", "email", "phone", "website", "location", "qrTarget"].forEach(function (k) { wireText("tw-" + k, k); });
    wirePhoto();
    wireCreate();
    wireExport();
    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
