/* ============================================================
   cartes-core.js — shared rendering + export engine
   Used by both the designer (/cartes/) and the freeform
   playground (/cartes/atelier/). Exposes window.CartesCore.

   Needs: window.qrcode (qrcode.min.js) for QR, and
   window.CARTES_FONT_URLS for embedding fonts in exports.
   ============================================================ */
(function () {
  "use strict";

  var MM = 25.4;          // mm per inch
  var EXPORT_DPI = 300;   // print resolution

  var FORMATS = {
    classique: { w: 85, h: 55, label: "85 × 55" },
    carre:     { w: 90, h: 90, label: "90 × 90" },
    verticale: { w: 55, h: 85, label: "55 × 85" },
    mini:      { w: 70, h: 44, label: "70 × 44" }
  };

  var FONT_FILES = {
    serif:     "instrument-serif-latin.woff2",
    serifItal: "instrument-serif-italic-latin.woff2",
    body:      "geist-latin.woff2",
    mono:      "geist-mono-latin.woff2"
  };

  // ── string helpers ───────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function up(s) { return String(s == null ? "" : s).toUpperCase(); }

  // ── SVG primitives (mm = user units) ─────────────────────
  function T(x, y, str, o) {
    o = o || {};
    var attrs = [
      'x="' + x + '"', 'y="' + y + '"',
      'font-family="' + (o.family || "Geist") + '"',
      'font-size="' + (o.size || 4) + '"',
      'fill="' + (o.fill || "#000") + '"'
    ];
    if (o.weight) attrs.push('font-weight="' + o.weight + '"');
    if (o.italic) attrs.push('font-style="italic"');
    if (o.anchor) attrs.push('text-anchor="' + o.anchor + '"');
    if (o.spacing != null) attrs.push('letter-spacing="' + o.spacing + '"');
    if (o.opacity != null) attrs.push('opacity="' + o.opacity + '"');
    return '<text ' + attrs.join(" ") + '>' + esc(o.upper ? up(str) : str) + "</text>";
  }
  function line(x1, y1, x2, y2, stroke, w, dash) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="' + stroke + '" stroke-width="' + (w || 0.2) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") +
      ' stroke-linecap="round"/>';
  }
  function rect(x, y, w, h, fill, rx) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" fill="' + fill + '"' + (rx ? ' rx="' + rx + '"' : "") + "/>";
  }

  function qrGroup(text, x, y, size, dark, light) {
    if (!text || typeof window.qrcode !== "function") {
      return rect(x, y, size, size, light || "#0000000d", 1) +
        T(x + size / 2, y + size / 2, "QR", { size: size * 0.18, fill: dark || "#000", anchor: "middle", family: "Geist Mono" });
    }
    var qr;
    try { qr = window.qrcode(0, "M"); qr.addData(text); qr.make(); }
    catch (e) { return rect(x, y, size, size, light || "#0000000d", 1); }
    var n = qr.getModuleCount(), quiet = 2, cell = size / (n + quiet * 2);
    var ox = x + quiet * cell, oy = y + quiet * cell, parts = [], d = "";
    if (light) parts.push(rect(x, y, size, size, light, cell));
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        var px = ox + c * cell, py = oy + r * cell;
        d += "M" + px.toFixed(3) + "," + py.toFixed(3) + "h" + cell.toFixed(3) +
             "v" + cell.toFixed(3) + "h" + (-cell).toFixed(3) + "z";
      }
    }
    parts.push('<path d="' + d + '" fill="' + (dark || "#000") + '"/>');
    return parts.join("");
  }

  var _photoUID = 0;
  function photoNode(x, y, w, h, ctx, round) {
    ctx = ctx || {};
    var id = "ph" + (++_photoUID);
    var shape = round
      ? '<circle cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" r="' + (Math.min(w, h) / 2) + '"/>'
      : '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5"/>';
    if (ctx.photo) {
      return '<clipPath id="' + id + '">' + shape + "</clipPath>" +
        '<image href="' + ctx.photo + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
        '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>';
    }
    var panel = ctx.panel || "rgba(128,128,128,0.18)";
    var accent = ctx.accent || "#c084fc";
    var initial = (ctx.initial || "R").trim().charAt(0) || "R";
    var bg = round
      ? '<circle cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" r="' + (Math.min(w, h) / 2) + '" fill="' + panel + '"/>'
      : rect(x, y, w, h, panel, 1.5);
    return bg + T(x + w / 2, y + h / 2 + Math.min(w, h) * 0.14, initial,
      { size: Math.min(w, h) * 0.5, family: "Instrument Serif", italic: true, fill: accent, anchor: "middle" });
  }

  function splitName(n) {
    var parts = String(n || "").trim().split(/\s+/);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  }
  function qrText(raw) {
    var t = String(raw || "").trim();
    if (!t) return "";
    if (!/^https?:\/\//i.test(t) && !/^mailto:|^tel:/i.test(t)) t = "https://" + t.replace(/^\/+/, "");
    return t;
  }

  // ── palette roles: colors may be a token (bg/ink/sub/accent) or a hex ──
  var PALETTE_KEYS = ["bg", "ink", "sub", "accent"];
  var DEFAULT_PALETTE = { bg: "#15130f", ink: "#f5f2ec", sub: "#b8b2a6", accent: "#c084fc" };
  function resolveColor(v, pal) {
    if (v == null || v === "") return v;
    return (pal && PALETTE_KEYS.indexOf(v) >= 0) ? pal[v] : v;
  }

  // ── freeform element list → SVG inner markup ─────────────
  // els: [{type, ...}], ctx: { photo, initial, palette }
  function renderElements(els, bg, w, h, ctx) {
    ctx = ctx || {};
    var pal = ctx.palette || DEFAULT_PALETTE;
    function col(v) { return resolveColor(v, pal); }
    var s = [rect(0, 0, w, h, col(bg) || "#15130f")];
    (els || []).forEach(function (e) {
      switch (e.type) {
        case "text":
          s.push(T(e.x, e.y, e.text, {
            size: e.size, family: e.family, fill: col(e.fill), weight: e.weight,
            italic: e.italic, anchor: e.anchor, spacing: e.spacing, upper: e.upper
          }));
          break;
        case "rect": s.push(rect(e.x, e.y, e.w, e.h, col(e.fill), e.rx)); break;
        case "line": s.push(line(e.x1, e.y1, e.x2, e.y2, col(e.stroke), e.w, e.dash)); break;
        case "photo": s.push(photoNode(e.x, e.y, e.w, e.h,
          { photo: ctx.photo, accent: pal.accent, initial: ctx.initial }, e.round)); break;
        case "qr": s.push(qrGroup(qrText(e.target || ctx.qrTarget), e.x, e.y, e.size, col(e.dark), col(e.light))); break;
      }
    });
    return s.join("");
  }

  function faceSvgWrap(inner, w, h, attrs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h +
      '" ' + (attrs || 'width="100%" height="100%" preserveAspectRatio="xMidYMid meet"') +
      '>' + inner + "</svg>";
  }

  // ── fonts (embed for raster/pdf fidelity) ────────────────
  var _fontCSS = null;
  function fontUrl(key) {
    var urls = window.CARTES_FONT_URLS || {};
    return urls[key] || ((window.CARTES_FONT_BASE || "/static/fonts/") + FONT_FILES[key]);
  }
  function bufToB64(buf) {
    var bytes = new Uint8Array(buf), bin = "", chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(bin);
  }
  function fontCSS() {
    if (_fontCSS) return Promise.resolve(_fontCSS);
    var faces = [
      { fam: "Instrument Serif", style: "normal", key: "serif" },
      { fam: "Instrument Serif", style: "italic", key: "serifItal" },
      { fam: "Geist", style: "normal", key: "body" },
      { fam: "Geist Mono", style: "normal", key: "mono" }
    ];
    return Promise.all(faces.map(function (f) {
      return fetch(fontUrl(f.key)).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
        return '@font-face{font-family:"' + f.fam + '";font-style:' + f.style +
          ';font-weight:400 700;src:url(data:font/woff2;base64,' + bufToB64(buf) + ') format("woff2");}';
      }).catch(function () { return ""; });
    })).then(function (arr) { _fontCSS = arr.join("\n"); return _fontCSS; });
  }

  // ── export: combined recto+verso sheet ───────────────────
  function exportSvgString(frontInner, backInner, w, h, embedFonts) {
    var gap = w * 0.08, W = w * 2 + gap, H = h;
    var defs = embedFonts ? '<defs><style type="text/css"><![CDATA[' + embedFonts + ']]></style></defs>' : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'width="' + W + 'mm" height="' + H + 'mm" viewBox="0 0 ' + W + ' ' + H + '">' + defs +
      '<g>' + frontInner + '</g>' +
      '<g transform="translate(' + (w + gap) + ',0)">' + backInner + '</g></svg>';
  }
  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }
  function rasterize(frontInner, backInner, w, h) {
    return fontCSS().then(function (css) {
      var svg = exportSvgString(frontInner, backInner, w, h, css);
      var gap = w * 0.08, Wmm = w * 2 + gap, Hmm = h;
      var pxW = Math.round(Wmm / MM * EXPORT_DPI), pxH = Math.round(Hmm / MM * EXPORT_DPI);
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          var cv = document.createElement("canvas"); cv.width = pxW; cv.height = pxH;
          resolve({ canvas: cv, ctx: cv.getContext("2d"), img: img, pxW: pxW, pxH: pxH, Wmm: Wmm, Hmm: Hmm });
        };
        img.onerror = reject;
        img.src = "data:image/svg+xml;base64," + bufToB64(new TextEncoder().encode(svg).buffer);
      });
    });
  }
  function buildPDF(jpeg, pxW, pxH, ptW, ptH) {
    var enc = new TextEncoder(), chunks = [], offset = 0, offsets = [];
    function push(x) { var b = (x instanceof Uint8Array) ? x : enc.encode(x); chunks.push(b); offset += b.length; }
    function obj(n, body) { offsets[n] = offset; push(n + " 0 obj\n" + body + "\nendobj\n"); }
    push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + ptW.toFixed(2) + " " + ptH.toFixed(2) +
      "] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>");
    var content = "q " + ptW.toFixed(2) + " 0 0 " + ptH.toFixed(2) + " 0 0 cm /Im0 Do Q";
    obj(4, "<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream");
    offsets[5] = offset;
    push("5 0 obj\n<< /Type /XObject /Subtype /Image /Width " + pxW + " /Height " + pxH +
      " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpeg.length + " >>\nstream\n");
    push(jpeg); push("\nendstream\nendobj\n");
    var xrefPos = offset, n = 6, xref = "xref\n0 " + n + "\n0000000000 65535 f \n";
    for (var i = 1; i < n; i++) xref += ("0000000000" + offsets[i]).slice(-10) + " 00000 n \n";
    push(xref); push("trailer\n<< /Size " + n + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF");
    var total = chunks.reduce(function (a, c) { return a + c.length; }, 0), out = new Uint8Array(total), pos = 0;
    chunks.forEach(function (c) { out.set(c, pos); pos += c.length; });
    return new Blob([out], { type: "application/pdf" });
  }

  // public: export a recto/verso card sheet in the given type
  function exportSheet(opts) {
    var frontInner = opts.frontInner, backInner = opts.backInner;
    var w = opts.w, h = opts.h, name = opts.name || "carte", type = opts.type;
    function fn(ext) { return name + "." + ext; }
    if (type === "svg") {
      return fontCSS().then(function (css) {
        downloadBlob(new Blob([exportSvgString(frontInner, backInner, w, h, css)], { type: "image/svg+xml" }), fn("svg"));
      });
    }
    if (type === "png" || type === "jpg") {
      var mime = type === "png" ? "image/png" : "image/jpeg";
      return rasterize(frontInner, backInner, w, h).then(function (r) {
        if (type === "jpg") { r.ctx.fillStyle = "#fff"; r.ctx.fillRect(0, 0, r.pxW, r.pxH); }
        r.ctx.drawImage(r.img, 0, 0, r.pxW, r.pxH);
        return new Promise(function (res) { r.canvas.toBlob(function (b) { downloadBlob(b, fn(type)); res(); }, mime, 0.95); });
      });
    }
    if (type === "pdf") {
      return rasterize(frontInner, backInner, w, h).then(function (r) {
        r.ctx.fillStyle = "#fff"; r.ctx.fillRect(0, 0, r.pxW, r.pxH);
        r.ctx.drawImage(r.img, 0, 0, r.pxW, r.pxH);
        var url = r.canvas.toDataURL("image/jpeg", 0.95), bin = atob(url.split(",")[1]);
        var jpeg = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);
        downloadBlob(buildPDF(jpeg, r.pxW, r.pxH, r.Wmm * 72 / MM, r.Hmm * 72 / MM), fn("pdf"));
      });
    }
    return Promise.reject(new Error("unknown export type: " + type));
  }

  window.CartesCore = {
    MM: MM, EXPORT_DPI: EXPORT_DPI, FORMATS: FORMATS,
    esc: esc, up: up, T: T, line: line, rect: rect,
    qrGroup: qrGroup, photoNode: photoNode, splitName: splitName, qrText: qrText,
    renderElements: renderElements, faceSvgWrap: faceSvgWrap,
    fontCSS: fontCSS, exportSheet: exportSheet, downloadBlob: downloadBlob,
    PALETTE_KEYS: PALETTE_KEYS, DEFAULT_PALETTE: DEFAULT_PALETTE, resolveColor: resolveColor
  };
})();
