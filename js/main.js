/* =========================================================
   Faizan Mustafa — Portfolio interactions
   ========================================================= */

/* ---- Contact details: edit these before deploying ---- */
const CONFIG = {
  email: "faizanmustafaofficial1@gmail.com", // ← replace with your email
  socials: {
    // Leave a value empty ("") to hide that icon.
    linkedin: "https://www.linkedin.com/in/faizan-mustafa-47a2aa203/",  // e.g. "https://www.linkedin.com/in/your-handle"
    github: "https://github.com/Faizanmaan",    // e.g. "https://github.com/your-handle"
    upwork: "",    // e.g. "https://www.upwork.com/freelancers/~..."
    twitter: "",   // e.g. "https://x.com/your-handle"
  },
};

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------------- Split hero title into characters ---------------- */
  $$("[data-split]").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((ch, i) => {
      const wrap = document.createElement("span");
      wrap.className = "char-wrap";
      wrap.setAttribute("aria-hidden", "true");
      const c = document.createElement("span");
      c.className = "char";
      c.style.setProperty("--i", i + (el.previousElementSibling ? 6 : 0));
      c.textContent = ch;
      wrap.appendChild(c);
      el.appendChild(wrap);
    });
  });

  /* ---------------- Preloader ---------------- */
  const preloader = $("#preloader");
  const bar = $("#preloaderBar");
  const count = $("#preloaderCount");
  let progress = 0;
  let pageLoaded = false;
  window.addEventListener("load", () => (pageLoaded = true));
  setTimeout(() => (pageLoaded = true), 3500); // never block longer than this

  const t0 = performance.now();
  const tick = () => {
    // time-based so it finishes in ~1.4s once the page has loaded
    const target = pageLoaded ? 100 : 90;
    progress = Math.min(target, Math.max(progress, ((performance.now() - t0) / 1400) * 100));
    bar.style.width = progress + "%";
    count.textContent = Math.round(progress);
    if (progress >= 100) {
      setTimeout(() => {
        preloader.classList.add("is-done");
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-ready");
        startHero();
      }, 250);
    } else requestAnimationFrame(tick);
  };
  if (reduceMotion) {
    preloader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    requestAnimationFrame(() => startHero());
  } else requestAnimationFrame(tick);

  /* ---------------- Custom cursor ---------------- */
  if (finePointer && !reduceMotion) {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      document.body.classList.add("has-cursor");
    });
    document.addEventListener("mouseleave", () => document.body.classList.remove("has-cursor"));
    (function loop() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      ring.classList.toggle("is-view", !!t.closest(".project"));
      ring.classList.toggle("is-hover", !t.closest(".project") && !!t.closest("a, button, .filter"));
    });
  }

  /* ---------------- Nav: scrolled state, hide on scroll down, active link ---------------- */
  const nav = $("#nav");
  const progressBar = $("#scrollProgress");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 30);
    nav.classList.toggle("is-hidden", y > lastY && y > 400 && !mobileMenu.classList.contains("is-open"));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    updateTimeline();
  };

  const sections = $$("main section[id]");
  const navLinks = $$(".nav__links a");
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------------- Mobile menu ---------------- */
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  const setMenu = (open) => {
    mobileMenu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("is-open")));
  $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------------- Hero neural-network canvas ---------------- */
  function heroCanvas() {
    const canvas = $("#heroCanvas");
    const ctx = canvas.getContext("2d");
    let w, h, dpr, nodes = [];
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp((w * h) / 16000, 30, 95));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6, hue: Math.random() < 0.6 ? 262 : 190,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    canvas.parentElement.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

    let visible = true;
    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);
    const LINK = 130;
    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.x += (dx / d) * 1.2; p.y += (dy / d) * 1.2; }
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `hsla(${a.hue}, 90%, 70%, ${(1 - d / LINK) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 200) {
          ctx.strokeStyle = `hsla(190, 90%, 65%, ${(1 - md / 200) * 0.45})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = `hsla(${a.hue}, 90%, 75%, 0.85)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    })();
  }

  /* ---------------- Role rotator (type / delete) ---------------- */
  function roleRotator() {
    const el = $("#roleText");
    const roles = [
      "AI Agent Developer",
      "Full-Stack SaaS Engineer",
      "MVP Builder",
      "Machine Learning Engineer",
      "Automation Specialist",
    ];
    if (reduceMotion) return;
    let r = 0, i = roles[0].length, deleting = true;
    const step = () => {
      const word = roles[r];
      if (deleting) {
        i--;
        if (i <= 0) { deleting = false; r = (r + 1) % roles.length; }
      } else {
        i++;
        if (i >= roles[r].length) { deleting = true; el.textContent = roles[r]; return setTimeout(step, 2200); }
      }
      el.textContent = (deleting ? word : roles[r]).slice(0, Math.max(i, 0)) || "​";
      setTimeout(step, deleting ? 35 : 70);
    };
    setTimeout(step, 2600);
  }

  /* ---------------- Terminal typing ---------------- */
  function terminal() {
    const el = $("#terminal");
    const status = $("#terminalStatus");
    // [text, class] tokens
    const T = (t, c = "") => ({ t, c });
    const lines = [
      [T("# Faizan's AI agent stack", "c")],
      [T("from", "k"), T(" faizan "), T("import", "k"), T(" Agent, tools")],
      [],
      [T("agent"), T(" = "), T("Agent", "f"), T("(")],
      [T("    model="), T('"gpt / claude / llama"', "s"), T(",")],
      [T("    tools=[tools."), T("voice", "f"), T(", tools."), T("rag", "f"), T(", tools."), T("crm", "f"), T("],")],
      [T("    memory="), T("True", "k"), T(",")],
      [T(")")],
      [],
      [T("@agent.on", "f"), T("("), T('"new_lead"', "s"), T(")")],
      [T("async def", "k"), T(" "), T("handle", "f"), T("(lead):")],
      [T("    plan = "), T("await", "k"), T(" agent."), T("think", "f"), T("(lead)")],
      [T("    "), T("return await", "k"), T(" agent."), T("act", "f"), T("(plan)")],
      [],
      [T("agent."), T("deploy", "f"), T("(uptime="), T("99.9", "n"), T(")  "), T("# ✓ live", "c")],
    ];
    const statuses = ["agent online", "thinking…", "calling tools…", "deployed ✓  ·  18 products shipped"];
    if (reduceMotion) {
      el.innerHTML = lines.map((l) => l.map((x) => `<span class="${x.c}">${esc(x.t)}</span>`).join("")).join("\n");
      return;
    }
    let li = 0, ti = 0, ci = 0;
    const done = [];
    let current = "";
    const render = () => { el.innerHTML = done.join("\n") + (done.length ? "\n" : "") + current + '<span class="cur"></span>'; };
    const step = () => {
      if (li >= lines.length) {
        status.textContent = statuses[3];
        setTimeout(() => { li = ti = ci = 0; done.length = 0; current = ""; status.textContent = statuses[0]; step(); }, 6000);
        return;
      }
      const line = lines[li];
      if (ti >= line.length) {
        done.push(current); current = ""; li++; ti = 0; ci = 0;
        if (li === 4) status.textContent = statuses[1];
        if (li === 10) status.textContent = statuses[2];
        render();
        return setTimeout(step, 90);
      }
      const tok = line[ti];
      ci++;
      const partial = esc(tok.t.slice(0, ci));
      const built = line.slice(0, ti).map((x) => `<span class="${x.c}">${esc(x.t)}</span>`).join("");
      current = built + `<span class="${tok.c}">${partial}</span>`;
      if (ci >= tok.t.length) { ti++; ci = 0; }
      render();
      setTimeout(step, 18 + Math.random() * 30);
    };
    step();
  }
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ---------------- Counters ---------------- */
  function counters() {
    $$(".counter").forEach((el) => {
      const to = +el.dataset.to, suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = to + suffix; return; }
      const dur = 1800, start = performance.now() + 900;
      const f = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(eased * to) + (t === 1 ? suffix : "");
        if (t < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
  }

  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    heroCanvas();
    roleRotator();
    terminal();
    counters();
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); revealObs.unobserve(en.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  const observeReveals = (root = document) => {
    // stagger siblings inside the same parent
    const groups = new Map();
    $$(".reveal:not(.is-in)", root).forEach((el) => {
      const g = groups.get(el.parentElement) || [];
      g.push(el); groups.set(el.parentElement, g);
    });
    groups.forEach((g) => g.forEach((el, i) => { el.style.setProperty("--rd", `${Math.min(i, 6) * 0.08}s`); revealObs.observe(el); }));
  };
  observeReveals();

  /* ---------------- Tilt + magnetic + spotlight ---------------- */
  function bindTilt(el, strength = 8) {
    if (!finePointer || reduceMotion) return;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  }
  $$("[data-tilt]").forEach((el) => bindTilt(el, 10));

  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest && e.target.closest(".spotlight, .project");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------------- Projects ---------------- */
  const projects = window.PROJECTS || [];
  const cats = window.PROJECT_CATEGORIES || {};
  const grid = $("#projects");
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const host = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; } };

  grid.innerHTML = projects.map((p, i) => `
    <article class="project reveal ${p.featured ? "is-featured" : ""}" data-cat="${p.category}" data-id="${p.id}" tabindex="0" role="button" aria-label="Open details for ${p.title}">
      <div class="project__media">
        <div class="browser">
          <div class="browser__bar"><i></i><i></i><i></i><span class="browser__url mono">${host(p.url)}</span></div>
          <div class="project__shot">
            <img src="${p.image}" alt="Screenshot of ${p.title}" loading="lazy" decoding="async" width="1440" height="900" />
            <div class="skeleton"></div>
          </div>
        </div>
      </div>
      <div class="project__body">
        <div class="project__top">
          <span class="project__cat">${cats[p.category] || ""}</span>
          <span class="project__num">${String(i + 1).padStart(2, "0")}</span>
        </div>
        <h3>${p.title}</h3>
        <p class="project__tagline">${p.tagline}</p>
        ${p.featured ? `<p class="project__desc">${p.description}</p>` : ""}
        <div class="project__foot">
          <div class="tags">${p.tags.slice(0, p.featured ? 4 : 3).map((t) => `<span class="tag">${t}</span>`).join("")}</div>
          <a class="project__link" href="${p.url}" target="_blank" rel="noopener" aria-label="Open ${p.title} live site" data-stop>${arrow}</a>
        </div>
      </div>
    </article>`).join("");

  $$(".project__shot img", grid).forEach((img) => {
    const done = () => img.classList.add("loaded");
    img.complete ? done() : img.addEventListener("load", done);
    img.addEventListener("error", done);
  });
  $$(".project", grid).forEach((el) => bindTilt(el, 4));
  observeReveals(grid);

  // Filter counts
  const filterBtns = $$(".filter");
  filterBtns.forEach((b) => {
    const f = b.dataset.filter;
    const n = f === "all" ? projects.length : projects.filter((p) => p.category === f).length;
    $("sup", b).textContent = n;
  });

  // Filter indicator
  const indicator = $("#filterIndicator");
  const moveIndicator = () => {
    const active = $(".filter.is-active");
    if (!active || !indicator) return;
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  };
  moveIndicator();
  window.addEventListener("resize", moveIndicator);
  document.fonts && document.fonts.ready.then(moveIndicator);

  let filterTimer;
  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;
      filterBtns.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", String(b === btn)); });
      moveIndicator();
      const f = btn.dataset.filter;
      const cards = $$(".project", grid);
      cards.forEach((c) => { c.classList.remove("enter"); c.classList.add("is-hiding"); });
      clearTimeout(filterTimer);
      filterTimer = setTimeout(() => {
        let k = 0;
        cards.forEach((c) => {
          const show = f === "all" || c.dataset.cat === f;
          c.classList.remove("is-hiding");
          c.classList.toggle("is-hidden", !show);
          c.classList.add("is-in");
          if (show) {
            c.style.setProperty("--sd", `${k++ * 0.06}s`);
            void c.offsetWidth;
            c.classList.add("enter");
          }
        });
      }, 320);
    })
  );

  /* ---------------- Modal ---------------- */
  const modal = $("#modal");
  let lastFocus = null;
  const openModal = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    lastFocus = document.activeElement;
    $("#modalImg").src = p.image;
    $("#modalImg").alt = `Screenshot of ${p.title}`;
    $("#modalUrl").textContent = host(p.url);
    $("#modalCat").textContent = cats[p.category] || "";
    $("#modalTitle").textContent = p.title;
    $("#modalTagline").textContent = p.tagline;
    $("#modalDesc").textContent = p.description;
    $("#modalTags").innerHTML = p.tags.map((t) => `<span class="tag">${t}</span>`).join("");
    $("#modalLink").href = p.url;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-open")));
    $(".modal__close", modal).focus({ preventScroll: true });
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    setTimeout(() => { modal.hidden = true; }, 450);
    lastFocus && lastFocus.focus({ preventScroll: true });
  };
  grid.addEventListener("click", (e) => {
    if (e.target.closest("[data-stop]")) return;
    const card = e.target.closest(".project");
    if (card) openModal(card.dataset.id);
  });
  grid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".project");
    if (card && (e.key === "Enter" || e.key === " ") && e.target === card) { e.preventDefault(); openModal(card.dataset.id); }
  });
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!modal.hidden) closeModal();
    else if (mobileMenu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------------- Timeline progress ---------------- */
  const timeline = $("#timeline");
  const fill = $("#timelineFill");
  const steps = $$(".step", timeline);
  function updateTimeline() {
    if (!timeline) return;
    const r = timeline.getBoundingClientRect();
    const p = clamp((innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.2), 0, 1);
    if (fill) fill.style.transform = `scaleX(${p})`;
    steps.forEach((s, i) => s.classList.toggle("is-lit", p >= (i / steps.length) * 0.9 + 0.02));
  }

  /* ---------------- Contact ---------------- */
  const emailBtn = $("#emailBtn");
  emailBtn.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Project inquiry")}`;
  $("#emailText").textContent = CONFIG.email;
  const toast = $("#toast");
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("is-show"), 2200);
  };
  $("#copyEmail").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(CONFIG.email); showToast("Email copied to clipboard ✓"); }
    catch { showToast(CONFIG.email); }
  });

  const icons = {
    linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.84 0-2.12 1.43-2.12 2.9V21H9z"/>',
    github: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
    upwork: '<path d="M18.56 13.5c-1.03 0-2-.44-2.88-1.15l.21-1.01.01-.04c.19-1.07.8-2.87 2.66-2.87a2.54 2.54 0 0 1 0 5.07Zm0-7.63c-2.37 0-4.21 1.54-4.95 4.07-1.14-1.7-2-3.75-2.5-5.47H8.55v6.66a2.35 2.35 0 1 1-4.7 0V4.47H1.3v6.66a4.9 4.9 0 1 0 9.8 0v-1.12c.46.96 1.03 1.93 1.72 2.8l-1.46 6.86h2.6l1.05-4.98c.92.59 1.98.96 3.21.96a5.11 5.11 0 0 0 0-10.22Z"/>',
    twitter: '<path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.57l11.1 14.43Z"/>',
  };
  $("#socials").innerHTML = Object.entries(CONFIG.socials)
    .filter(([, url]) => url)
    .map(([k, url]) => `<a class="social" href="${url}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24">${icons[k]}</svg></a>`)
    .join("");

  $("#year").textContent = new Date().getFullYear();

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
