/* shared interactions: cursor, smooth scroll, theme, reveals, hover preview */

(function () {
  // honored throughout: skip continuous/entrance animations when the user
  // asks for reduced motion.
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── Theme toggle ──────────────────────────────────
  const root = document.documentElement;
  const saved = localStorage.getItem("rr-theme");
  if (saved) root.setAttribute("data-theme", saved);
  else root.setAttribute("data-theme", "dark");

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    const cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("rr-theme", next);
  });

  // ─── Custom cursor ─────────────────────────────────
  if (!matchMedia("(hover: none)").matches) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    });

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx - 14}px, ${ry - 14}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    const setHover = (on, kind) => {
      dot.classList.toggle("is-hover", !!on);
      ring.classList.toggle("is-hover", !!on && kind !== "text");
      ring.classList.toggle("is-text", kind === "text");
    };

    document.addEventListener("pointerover", (e) => {
      const target = e.target.closest("[data-cursor]");
      if (target) {
        setHover(true, target.getAttribute("data-cursor") || "default");
      } else if (e.target.closest("a, button, [data-hover]")) {
        setHover(true, "default");
      }
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest("a, button, [data-hover], [data-cursor]")) setHover(false);
    });
  }

  // ─── Split text helper ────────────────────────────
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.innerHTML = "";
    const line = document.createElement("span");
    line.className = "split-line";
    text.split("").forEach((c, i) => {
      const span = document.createElement("span");
      span.className = "ch" + (c === " " ? " space" : "");
      span.textContent = c;
      if (!reduceMotion) span.style.transitionDelay = (i * 0.025) + "s";
      line.appendChild(span);
    });
    el.appendChild(line);
  });

  // ─── Reveal on scroll ─────────────────────────────
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          if (e.target.hasAttribute("data-reveal-once")) io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal, [data-split]").forEach((el) => io.observe(el));

  // ─── Hover image preview (project lists) ──────────
  const projects = document.querySelectorAll("[data-preview]");
  if (projects.length) {
    const canvas = document.createElement("div");
    canvas.className = "preview-canvas";
    const frames = new Map();
    projects.forEach((p) => {
      const src = p.getAttribute("data-preview");
      const f = document.createElement("div");
      f.className = "frame";
      f.style.background = src; // expects gradient/url
      canvas.appendChild(f);
      frames.set(p, f);
    });
    document.body.appendChild(canvas);

    let tx = 0, ty = 0, cx = 0, cy = 0;
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      canvas.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX - 160;
      ty = e.clientY - 100;
    });

    projects.forEach((p) => {
      p.addEventListener("pointerenter", () => {
        canvas.classList.add("is-on");
        frames.forEach((f) => f.classList.remove("is-on"));
        frames.get(p).classList.add("is-on");
      });
      p.addEventListener("pointerleave", () => {
        canvas.classList.remove("is-on");
      });
    });
  }

  // ─── Magnetic hover ───────────────────────────────
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.25;
      const dy = (e.clientY - r.top - r.height / 2) * 0.25;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });

  // ─── Page transition curtain ──────────────────────
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  document.body.appendChild(curtain);
  // Slide out on load (skip the sweep under reduced motion)
  if (!reduceMotion) {
    requestAnimationFrame(() => {
      curtain.classList.add("is-out");
      setTimeout(() => curtain.classList.remove("is-out"), 750);
    });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-transition]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http")) return;
    e.preventDefault();
    if (reduceMotion) { window.location.href = href; return; }
    curtain.classList.remove("is-out");
    curtain.classList.add("is-in");
    setTimeout(() => { window.location.href = href; }, 650);
  });

  // ─── Marquee duplication (for seamless loops) ─────
  document.querySelectorAll("[data-marquee]").forEach((m) => {
    m.innerHTML = m.innerHTML + m.innerHTML;
  });
})();
