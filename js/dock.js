/*
  KudaDocks website: the interactive dock behind every demo on the page.
  Magnifies under the pointer, lets any item be dragged anywhere (left, centre or right of the bar),
  moves items with the keyboard, adds and removes widgets, and switches themes. No libraries.
*/
(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------------------------------------------------------------- glyphs for widgets (original line icons, 24×24)
  const G = {
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="7" y="5.5" width="3.6" height="13" rx="1" fill="currentColor" stroke="none"/><rect x="13.4" y="5.5" width="3.6" height="13" rx="1" fill="currentColor" stroke="none"/>',
    prev: '<path d="M18 6v12l-8.5-6z" fill="currentColor" stroke="none"/><rect x="6" y="6" width="2.4" height="12" rx="1" fill="currentColor" stroke="none"/>',
    next: '<path d="M6 6v12l8.5-6z" fill="currentColor" stroke="none"/><rect x="15.6" y="6" width="2.4" height="12" rx="1" fill="currentColor" stroke="none"/>',
    cloud: '<path d="M7.5 18.5h9.5a3.5 3.5 0 0 0 .4-7a5 5 0 0 0-9.6-1.3A4.2 4.2 0 0 0 7.5 18.5z" fill="currentColor" stroke="none"/>',
    wifi: '<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.5a7.6 7.6 0 0 1 11 0M9.5 15.5a3.3 3.3 0 0 1 5 0"/><circle cx="12" cy="18.3" r="1.1" fill="currentColor" stroke="none"/>',
    volume: '<path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    chevron: '<path d="M7 14l5-5l5 5"/>',
    check: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.2l2.4 2.4l4.6-4.8"/>',
    hourglass: '<path d="M7 4.5h10M7 19.5h10M8 4.5c0 4 8 4.5 8 7.5s-8 3.5-8 7.5M16 4.5c0 4-8 4.5-8 7.5s8 3.5 8 7.5"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="M15 15l4.5 4.5"/>',
    trash: '<path d="M5 7.5h14M10 4.5h4M7 7.5l.8 11a1.6 1.6 0 0 0 1.6 1.5h5.2a1.6 1.6 0 0 0 1.6-1.5l.8-11"/>',
    earbuds: '<path d="M8 4.5A3.5 3.5 0 0 0 4.5 8v1A3.5 3.5 0 0 0 8 12.5V19M16 4.5A3.5 3.5 0 0 1 19.5 8v1a3.5 3.5 0 0 1-3.5 3.5V19"/>',
    swap: '<path d="M7 7.5h11l-3-3M17 16.5H6l3 3"/>',
  };
  const svg = (name, cls = "") =>
    `<svg class="g ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${G[name]}</svg>`;

  // ---------------------------------------------------------------- apps: each one's icon is assets/apps/<key>.png
  // The icons belong to their owners and appear only to show how KudaDocks displays real apps (see notices.html).
  const APPS = {
    explorer: { name: "File Explorer", running: true },
    chrome: { name: "Google Chrome", running: true },
    discord: { name: "Discord", running: true },
    spotify: { name: "Spotify", running: true },
    telegram: { name: "Telegram" },
    teams: { name: "Microsoft Teams" },
    photoshop: { name: "Adobe Photoshop" },
    premiere: { name: "Adobe Premiere Pro" },
    aftereffects: { name: "Adobe After Effects" },
    steam: { name: "Steam" },
    obs: { name: "OBS Studio" },
    outlook: { name: "Outlook" },
    terminal: { name: "Terminal" },
  };

  // ---------------------------------------------------------------- shared live data for widgets
  const live = {
    cpu: 23, ram: 58, down: 2.4, up: 0.31,
    music: { playing: true, track: 0 },
    pomo: { running: false, left: 25 * 60, endsAt: 0 },
  };
  const TRACKS = [
    { t: "Night Drive", a: "Glass Harbor" },
    { t: "Slow Orbit", a: "Mira Vale" },
    { t: "Blue Hours", a: "The Quiet Set" },
  ];

  const fmtTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const fmtDate = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  const fmtDow = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const zoneTime = (tz) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: tz });
  const WORLD = [["New York", zoneTime("America/New_York")], ["London", zoneTime("Europe/London")], ["Tokyo", zoneTime("Asia/Tokyo")]];

  // Widget markup. `inter` is false for gallery previews, which sit inside a button and must not nest buttons.
  const btn = (inter, act, glyph, label) =>
    inter
      ? `<button type="button" class="wbtn ${act}" data-act="${act}" aria-label="${label}">${svg(glyph)}</button>`
      : `<span class="wbtn ${act}" aria-hidden="true">${svg(glyph)}</span>`;

  const WIDGETS = {
    clock: { name: "Clock and date", group: "Time", html: () => `<div class="w-lines w-right"><b data-f="time"></b><span data-f="date"></span></div>` },
    flip: { name: "Flip clock", group: "Time", html: () => `<div class="w-flip" aria-hidden="true"><span data-f="h1"></span><span data-f="h2"></span><i></i><span data-f="m1"></span><span data-f="m2"></span></div>` },
    world: { name: "World clocks", group: "Time", html: () => `<div class="w-world">${WORLD.map((c, i) => `<div class="w-lines"><b data-f="z${i}"></b><span>${c[0]}</span></div>`).join("")}</div>` },
    day: { name: "Date tile", group: "Time", html: () => `<div class="w-day"><span data-f="dow"></span><b data-f="dn"></b></div>` },
    weather: { name: "Weather", group: "Weather and music", html: () => `<div class="w-row">${svg("cloud", "big")}<div class="w-lines"><b>64°</b><span>Partly cloudy</span></div></div>` },
    music: {
      name: "Music player", group: "Weather and music",
      html: (inter) => `<div class="w-music"><span class="art" data-f="art"></span><div class="w-lines"><b data-f="title"></b><span data-f="artist"></span></div>${btn(inter, "prev", "prev", "Previous track")}${btn(inter, "play", "pause", "Pause")}${btn(inter, "next", "next", "Next track")}</div>`,
    },
    eq: { name: "Playing bars", group: "Weather and music", html: () => `<div class="w-eq" data-f="eq"><i></i><i></i><i></i><i></i><i></i></div>` },
    tray: { name: "System icons", group: "System", html: () => `<div class="w-tray">${svg("chevron")}${svg("wifi")}${svg("volume")}</div>` },
    cpu: { name: "CPU", group: "System", html: () => `<div class="w-stat"><div class="w-split"><span>CPU</span><b data-f="v"></b></div><i class="meter"><i data-f="bar"></i></i></div>` },
    ram: { name: "Memory", group: "System", html: () => `<div class="w-stat"><div class="w-split"><span>Memory</span><b data-f="v"></b></div><i class="meter alt"><i data-f="bar"></i></i></div>` },
    net: { name: "Network speed", group: "System", html: () => `<div class="w-lines w-net"><span>Down <b data-f="dn"></b></span><span>Up <b data-f="up"></b></span></div>` },
    battery: {
      name: "Battery ring", group: "System",
      html: () => `<div class="w-row"><svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" class="ring-bg"/><circle cx="18" cy="18" r="14" class="ring-fg" pathLength="100" stroke-dasharray="78 100"/></svg><div class="w-lines"><b>78%</b><span>Battery</span></div></div>`,
    },
    earbuds: { name: "Earbuds battery", group: "System", html: () => `<div class="w-row">${svg("earbuds", "big")}<div class="w-lines"><b>L 80%  R 75%</b><span>Case 62%</span></div></div>` },
    pomo: { name: "Focus timer", group: "Productivity", html: (inter) => `<div class="w-row">${btn(inter, "pomo", "play", "Start focus timer")}<div class="w-lines"><b data-f="left"></b><span data-f="state">Focus</span></div></div>` },
    todo: { name: "To-do", group: "Productivity", html: () => `<div class="w-row">${svg("check", "big")}<div class="w-lines"><b>3 tasks</b><span>Edit the trailer</span></div></div>` },
    screen: { name: "Screen time", group: "Productivity", html: () => `<div class="w-row">${svg("hourglass", "big")}<div class="w-lines"><b>2h 14m</b><span>Screen time</span></div></div>` },
    search: { name: "Search", group: "Tools", html: () => `<div class="w-search">${svg("search")}<span>Search</span></div>` },
    currency: { name: "Currency", group: "Tools", html: () => `<div class="w-row">${svg("swap", "big")}<div class="w-lines"><b>0.92 EUR</b><span>1 USD</span></div></div>` },
    recycle: { name: "Recycle bin", group: "Tools", html: () => `<div class="w-row">${svg("trash", "big")}<b class="w-count">4</b></div>` },
  };

  const mounted = new Set();
  const pad = (n) => String(n).padStart(2, "0");

  function tick(body) {
    const f = (n) => body.querySelector(`[data-f="${n}"]`);
    const now = new Date();
    switch (body.dataset.w) {
      case "clock": f("time").textContent = fmtTime.format(now); f("date").textContent = fmtDate.format(now); break;
      case "flip": {
        const h = String(now.getHours() % 12 || 12).padStart(2, "0"), m = pad(now.getMinutes());
        f("h1").textContent = h[0]; f("h2").textContent = h[1]; f("m1").textContent = m[0]; f("m2").textContent = m[1];
        break;
      }
      case "world": WORLD.forEach((c, i) => { f("z" + i).textContent = c[1].format(now); }); break;
      case "day": f("dow").textContent = fmtDow.format(now); f("dn").textContent = now.getDate(); break;
      case "music": {
        const tr = TRACKS[live.music.track];
        f("title").textContent = tr.t; f("artist").textContent = tr.a;
        f("art").dataset.art = live.music.track;
        const play = body.querySelector(".play");
        if (play) {
          play.innerHTML = svg(live.music.playing ? "pause" : "play");
          if (play.tagName === "BUTTON") play.setAttribute("aria-label", live.music.playing ? "Pause" : "Play");
        }
        break;
      }
      case "eq": f("eq").classList.toggle("on", live.music.playing && !reduce.matches); break;
      case "cpu": f("v").textContent = Math.round(live.cpu) + "%"; f("bar").style.setProperty("--v", live.cpu / 100); break;
      case "ram": f("v").textContent = Math.round(live.ram) + "%"; f("bar").style.setProperty("--v", live.ram / 100); break;
      case "net": f("dn").textContent = live.down.toFixed(1) + " MB/s"; f("up").textContent = Math.round(live.up * 1000) + " KB/s"; break;
      case "pomo": {
        const p = live.pomo;
        let left = p.running ? Math.max(0, Math.round((p.endsAt - Date.now()) / 1000)) : p.left;
        if (p.running && left === 0) { p.running = false; p.left = left = 25 * 60; }
        f("left").textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
        f("state").textContent = p.running ? "Focusing" : "Focus";
        const b = body.querySelector(".pomo");
        if (b) {
          b.innerHTML = svg(p.running ? "pause" : "play");
          if (b.tagName === "BUTTON") b.setAttribute("aria-label", p.running ? "Pause focus timer" : "Start focus timer");
        }
        break;
      }
    }
  }

  function widgetBody(key, inter = true) {
    const b = document.createElement("div");
    b.className = "wbody";
    b.dataset.w = key;
    b.innerHTML = WIDGETS[key].html(inter);
    mounted.add(b);
    tick(b);
    return b;
  }

  function refresh(kinds) {
    mounted.forEach((b) => { if (!b.isConnected) mounted.delete(b); else if (!kinds || kinds.includes(b.dataset.w)) tick(b); });
  }

  // One shared timer: clocks every second, gently moving system numbers every other second.
  let beat = 0;
  setInterval(() => {
    if (++beat % 2 === 0) {
      const walk = (v, lo, hi, step) => Math.min(hi, Math.max(lo, v + (Math.random() - 0.5) * step));
      live.cpu = walk(live.cpu, 6, 64, 14);
      live.ram = walk(live.ram, 44, 72, 4);
      live.down = walk(live.down, 0.3, 9.5, 2.2);
      live.up = walk(live.up, 0.05, 0.9, 0.2);
    }
    refresh();
  }, 1000);

  // Buttons inside widgets (music, focus timer), wherever they are on the page.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button.wbtn");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "play") live.music.playing = !live.music.playing;
    else if (act === "next") live.music.track = (live.music.track + 1) % TRACKS.length;
    else if (act === "prev") live.music.track = (live.music.track + TRACKS.length - 1) % TRACKS.length;
    else if (act === "pomo") {
      const p = live.pomo;
      if (p.running) { p.left = Math.max(0, Math.round((p.endsAt - Date.now()) / 1000)); p.running = false; }
      else { p.endsAt = Date.now() + p.left * 1000; p.running = true; }
    }
    refresh(act === "pomo" ? ["pomo"] : ["music", "eq"]);
  });

  // ---------------------------------------------------------------- helpers
  const mk = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const shiftOf = (el) => {
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") return 0;
    try { return new DOMMatrixReadOnly(t).m41; } catch { return 0; }
  };
  const nameOf = (el) => el.getAttribute("aria-label") || "Item";

  // ---------------------------------------------------------------- the dock
  class Dock {
    constructor(host, opts) {
      this.host = host;
      this.o = Object.assign({ layout: "float", theme: "liquid", magnify: 1.7, size: 46, pos: "bottom", draggable: true, optional: [], label: "Interactive dock" }, opts);
      this.initial = JSON.parse(JSON.stringify(opts.zones));
      host.classList.add("dock");
      host.setAttribute("role", "toolbar");
      host.setAttribute("aria-label", this.o.label);
      this.bar = mk("div", "dock-bar");
      this.row = mk("div", "dock-row");
      this.zoneEls = [0, 1, 2].map((i) => { const z = mk("div", "zone"); z.dataset.zone = i; this.row.append(z); return z; });
      this.say = mk("div", "sr-only");
      this.say.setAttribute("aria-live", "polite");
      host.append(this.bar, this.row, this.say);
      this.k = 1;   // the dock's scale; below 1 only when even its slimmest layout is wider than its frame
      this.apply();
      this.fill(this.initial);
      this.bind();
      if (window.ResizeObserver && host.parentElement) new ResizeObserver(() => this.fit()).observe(host.parentElement);
    }

    // ---- building
    fill(zones) {
      this.zoneEls.forEach((z, i) => z.replaceChildren(...(zones[i] || []).map((id) => this.item(id))));
      this.zones = zones.map((z) => z.slice());
      this.roving();
      this.fit();
    }

    // ---- fitting: the dock, plus the room its icons need to magnify, must fit inside its frame. If it doesn't,
    // the optional items go first (the "opt" ones, then "opt2"); as a last resort the whole dock is scaled down.
    // This keeps a full-width bar's right-hand widgets pinned in place and on screen while icons magnify.
    fit() {
      const h = this.host, frame = h.parentElement;
      if (this.drag || !frame || !frame.clientWidth) return;
      h.classList.remove("fit1", "fit2");
      h.style.setProperty("--fit", "1");
      this.k = 1;
      if (!h.getClientRects().length) return;
      const room = frame.clientWidth - (this.o.layout === "full" ? 0 : 12);
      let need = 0;
      for (const level of ["", "fit1", "fit2"]) {
        if (level) h.classList.add(level);
        need = this.natural() + this.reserve();
        if (need <= room) return;
      }
      this.k = Math.max(0.45, room / need);
      h.style.setProperty("--fit", this.k.toFixed(3));
    }

    /** The dock's width with no icon magnified. */
    natural() {
      const px = (v) => parseFloat(v) || 0;
      let w = 0;
      for (const it of this.items()) {
        if (!it.getClientRects().length) continue;
        let iw = it.offsetWidth;
        if (it.classList.contains("app") && it._s > 1) { const ic = it.querySelector(".icon"); iw -= (ic.offsetWidth * (it._s - 1)) / it._s; }
        const cs = getComputedStyle(it);
        w += iw + px(cs.marginLeft) + px(cs.marginRight);
      }
      const hs = getComputedStyle(this.host);
      return w + px(hs.paddingLeft) + px(hs.paddingRight);
    }

    /** Extra width the magnification bump adds at its peak: about (M - 1) × 2.6 icons, plus a little air. */
    reserve() {
      const M = reduce.matches ? 1 : this.o.magnify;
      const app = [...this.host.querySelectorAll(".item.app")].find((a) => a.getClientRects().length);
      if (M <= 1 || !app) return 4;
      return (M - 1) * 2.6 * (app.querySelector(".icon").offsetWidth / (app._s || 1)) + 4;
    }

    item(id) {
      const [kind, key] = id === "start" ? ["start", "start"] : id.split(":");
      let el;
      if (kind === "start" || kind === "app") {
        const app = APPS[key];
        el = mk("button", "item app");
        el.type = "button";
        const name = kind === "start" ? "Start" : app.name;
        el.setAttribute("aria-label", name);
        el.title = name;
        const icon = mk("span", "icon " + (kind === "start" ? "start" : "real"));
        icon.innerHTML = `<img src="assets/${kind === "start" ? "logo" : "apps/" + key}.png" alt="" draggable="false">`;
        el.append(icon, mk("span", "run"));
        if (app?.running) el.classList.add("on");
      } else {
        el = mk("div", "item widget");
        el.setAttribute("role", "group");
        el.setAttribute("aria-label", WIDGETS[key].name);
        el.append(widgetBody(key));
      }
      el.dataset.id = id;
      el.tabIndex = -1;
      if (this.o.optional.includes(id)) el.classList.add("opt");          // hidden in a medium-width frame
      if ((this.o.optional2 || []).includes(id)) el.classList.add("opt2"); // hidden on a phone
      return el;
    }

    apply() {
      const h = this.host, o = this.o;
      h.dataset.theme = o.theme;
      h.dataset.layout = o.layout;
      h.dataset.pos = o.pos;
      h.style.setProperty("--size-base", o.size + "px");   // the stylesheet scales it down on small screens
      if (o.accent) h.style.setProperty("--accent", o.accent);
      h.style.setProperty("--bar-alpha", o.barAlpha ?? 1);
    }

    set(patch) {
      Object.assign(this.o, patch);
      this.apply();
      this.fit();
      this.kick();
    }

    /** The page-load moment: the dock puts itself together, one piece at a time. */
    assemble() {
      if (reduce.matches) return;
      const items = this.items();
      this.host.classList.add("assembling");
      items.forEach((it, i) => { it.style.setProperty("--i", i); it.classList.add("assemble"); });
      const last = items[items.length - 1];
      const done = () => { items.forEach((it) => it.classList.remove("assemble")); this.host.classList.remove("assembling"); };
      if (last) last.addEventListener("animationend", done, { once: true }); else done();
      setTimeout(done, 4000);
    }

    items() { return [...this.host.querySelectorAll(".item")]; }
    visible() { return this.items().filter((i) => i.getClientRects().length > 0); }

    // ---- events
    bind() {
      const h = this.host;
      h.addEventListener("pointermove", (e) => this.move(e));
      h.addEventListener("pointerleave", () => { this.hover = false; this.kick(); });
      h.addEventListener("pointerdown", (e) => this.down(e));
      h.addEventListener("click", (e) => this.click(e), true);
      h.addEventListener("keydown", (e) => this.key(e));
      h.addEventListener("dragstart", (e) => e.preventDefault());
      // While the button is held, the pointer is followed across the whole page. (Pointer capture alone is not
      // enough: moving the dragged item to its new place in the page makes the browser drop the capture.)
      this.onTrack = (e) => this.track(e);
      this.onRelease = (e) => { if (!this.press || e.pointerId === this.press.pid) this.up(); };
    }

    move(e) {
      if (e.pointerType !== "touch") { this.hover = true; this.px = e.clientX; this.kick(); }
    }

    track(e) {
      if (!this.press || e.pointerId !== this.press.pid) return;
      if (!this.drag && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > 6) this.begin();
      if (this.drag) { e.preventDefault(); this.dragTo(e.clientX); }
    }

    // ---- magnification: each app's size follows a smooth bump centred on the pointer, counted in icon slots
    kick() { if (!this.raf) this.raf = requestAnimationFrame(() => this.frame()); }

    frame() {
      this.raf = 0;
      const apps = [...this.host.querySelectorAll(".item.app")].filter((a) => a.getClientRects().length);
      const M = reduce.matches ? 1 : this.o.magnify, R = 2.6;
      const p = this.hover && !this.drag && M > 1 ? this.slotAt(apps) : null;
      let busy = false;
      apps.forEach((a, i) => {
        let target = 1;
        if (p !== null) { const d = Math.abs(i + 0.5 - p); if (d < R) target = 1 + (M - 1) * (Math.cos((Math.PI * d) / R) + 1) / 2; }
        const cur = a._s || 1;
        let next = cur + (target - cur) * 0.28;
        if (Math.abs(next - target) < 0.004) next = target; else busy = true;
        if (next !== cur) { a._s = next; a.style.setProperty("--s", next.toFixed(3)); }
      });
      if (busy) this.kick();
    }

    slotAt(apps) {
      const x = this.px, n = apps.length;
      if (!n) return null;
      const r = apps.map((a) => a.getBoundingClientRect());
      const w = r[0].width || 1;
      if (x < r[0].left) { const d = (r[0].left - x) / w; return d > 1.5 ? null : -d; }
      for (let i = 0; i < n; i++) {
        if (x >= r[i].left && x <= r[i].right) return i + (x - r[i].left) / r[i].width;
        if (i < n - 1 && x > r[i].right && x < r[i + 1].left) {
          const gap = r[i + 1].left - r[i].right;
          if (gap < w) return i + 1;
          const fromL = (x - r[i].right) / w, fromR = (r[i + 1].left - x) / w;
          if (fromL < fromR) return fromL > 1.5 ? null : i + 1 + fromL;
          return fromR > 1.5 ? null : i + 1 - fromR;
        }
      }
      const d = (x - r[n - 1].right) / w;
      return d > 1.5 ? null : n + d;
    }

    // ---- dragging: the item follows the pointer; the others glide out of the way
    down(e) {
      this.suppress = false;
      if (!this.o.draggable || e.button > 0 || e.target.closest(".wbtn")) return;
      const it = e.target.closest(".item");
      if (!it || !this.host.contains(it)) return;
      this.press = { it, x: e.clientX, y: e.clientY, pid: e.pointerId };
      window.addEventListener("pointermove", this.onTrack);
      window.addEventListener("pointerup", this.onRelease);
      window.addEventListener("pointercancel", this.onRelease);
    }

    capture(it) { try { it.setPointerCapture(this.press.pid); } catch { /* pointer already gone */ } }

    begin() {
      const it = this.press.it;
      this.capture(it);
      const r = it.getBoundingClientRect();
      this.drag = { it, grab: this.press.x - (r.left + r.width / 2), dx: 0 };
      this.suppress = true;
      it.classList.add("dragging");
      this.host.classList.add("is-dragging");
      this.kick();
    }

    // Positions are measured on screen; --fx is in the dock's own pixels, which differ when the dock is scaled to fit.
    layoutCenter(el) {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 - (this.drag && el === this.drag.it ? this.drag.dx : shiftOf(el) * this.k);
    }

    dragTo(x) {
      const d = this.drag, it = d.it;
      const [zi, ref] = this.target(x);
      const zone = this.zoneEls[zi];
      // Only what's on screen counts: items hidden to fit a narrow screen are skipped when deciding where it goes.
      const shown = [...zone.children].filter((c) => c === it || c.getClientRects().length);
      const at = shown.indexOf(it);
      const placed = at >= 0 && (ref ? shown[at + 1] === ref : at === shown.length - 1);
      if (!placed) {
        const last = shown.filter((c) => c !== it).pop();
        this.flip(() => { if (ref) zone.insertBefore(it, ref); else if (last) last.after(it); else zone.append(it); }, it);
        this.capture(it);   // re-take the pointer, which the move above released
      }
      const r = it.getBoundingClientRect();
      d.dx = x - d.grab - (r.left + r.width / 2 - d.dx);
      it.style.setProperty("--fx", d.dx / this.k + "px");
    }

    target(x) {
      const it = this.drag.it, cur = +it.parentElement.dataset.zone, full = this.o.layout === "full";
      let best = cur, bestD = Infinity;
      this.zoneEls.forEach((z, zi) => {
        const kids = [...z.children].filter((c) => c !== it && c.getClientRects().length);
        const r = z.getBoundingClientRect();
        let a = r.left, b = r.right;
        if (!kids.length && zi !== cur && !full) return;   // in a floating dock an empty area takes no space
        if (full && b - a < 150) {
          const anchor = zi === 0 ? r.left : zi === 2 ? r.right : (r.left + r.right) / 2;
          a = zi === 0 ? anchor : zi === 2 ? anchor - 150 : anchor - 75;
          b = zi === 0 ? anchor + 150 : zi === 2 ? anchor : anchor + 75;
        }
        let dist = x < a ? a - x : x > b ? x - b : 0;
        if (full && !kids.length && dist === 0) dist = -40;   // over an empty area's drop spot: that area wins
        else if (zi === cur) dist -= 20;
        if (dist < bestD) { bestD = dist; best = zi; }
      });
      // The item goes in front of the first on-screen item whose centre is right of the pointer (null: at the end).
      const kids = [...this.zoneEls[best].children].filter((c) => c !== it && c.getClientRects().length);
      return [best, kids.find((k) => this.layoutCenter(k) >= x) || null];
    }

    /** Runs a DOM change, then slides every other item from where it was to where it now belongs. */
    flip(mutate, except) {
      const items = this.items().filter((i) => i !== except);
      const before = new Map(items.map((i) => [i, i.getBoundingClientRect().left]));
      mutate();
      items.forEach((i) => {
        if (!i.isConnected) return;
        const dx = before.get(i) - (i.getBoundingClientRect().left - shiftOf(i) * this.k);
        if (Math.abs(dx) < 0.5 || reduce.matches) return;
        i.classList.add("no-anim");
        i.style.setProperty("--fx", dx / this.k + "px");
        i.getBoundingClientRect();
        i.classList.remove("no-anim");
        i.style.setProperty("--fx", "0px");
      });
    }

    up() {
      window.removeEventListener("pointermove", this.onTrack);
      window.removeEventListener("pointerup", this.onRelease);
      window.removeEventListener("pointercancel", this.onRelease);
      if (this.drag) {
        const it = this.drag.it;
        this.drag = null;
        it.classList.remove("dragging");
        this.host.classList.remove("is-dragging");
        it.style.setProperty("--fx", "0px");
        this.sync();
        this.tell(`${nameOf(it)} moved to ${this.where(it)}.`);
        this.roving(it);
        this.kick();
        // The browser sends the click that belongs to this drag straight after the pointer comes up; once that
        // has passed, stop swallowing clicks (a touch drag sends none, and the next real click must still work).
        setTimeout(() => { this.suppress = false; }, 0);
      }
      this.press = null;
    }

    click(e) {
      if (this.suppress) { this.suppress = false; e.stopPropagation(); e.preventDefault(); return; }
      const it = e.target.closest(".item.app");
      if (!it || !this.host.contains(it)) return;
      const icon = it.querySelector(".icon");
      icon.classList.remove("bounce");
      void icon.offsetWidth;
      if (!reduce.matches) icon.classList.add("bounce");
      if (it.dataset.id !== "start") it.classList.toggle("on");
    }

    // ---- keyboard: arrows move between items; Alt (or Shift) + arrow moves the item itself
    key(e) {
      const it = e.target.closest(".item");
      if (!it || !this.host.contains(it) || e.target.closest(".wbtn")) return;
      const all = this.visible(), i = all.indexOf(it);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        if ((e.altKey || e.shiftKey) && this.o.draggable) this.nudge(it, dir);
        else if (all[i + dir]) this.focus(all[i + dir]);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        this.focus(e.key === "Home" ? all[0] : all[all.length - 1]);
      }
    }

    nudge(it, dir) {
      const full = this.o.layout === "full";
      this.flip(() => {
        const shown = (z) => [...z.children].filter((c) => c === it || c.getClientRects().length);
        const zone = it.parentElement, sibs = shown(zone), nb = sibs[sibs.indexOf(it) + dir];
        if (nb) { if (dir > 0) nb.after(it); else nb.before(it); return; }
        for (let zi = +zone.dataset.zone + dir; zi >= 0 && zi <= 2; zi += dir) {
          const z = this.zoneEls[zi], vis = shown(z);
          if (full) { if (dir > 0) z.prepend(it); else z.append(it); return; }
          if (vis.length) {
            const edge = dir > 0 ? vis[0] : vis[vis.length - 1];
            if (dir > 0) edge.after(it); else edge.before(it);
            return;
          }
        }
      });
      it.focus();
      this.sync();
      this.tell(`${nameOf(it)} moved to ${this.where(it)}.`);
    }

    where(it) {
      const zi = +it.parentElement.dataset.zone, pos = [...it.parentElement.children].indexOf(it) + 1;
      if (this.o.layout !== "full") {
        const flat = this.visible();
        return `position ${flat.indexOf(it) + 1} of ${flat.length}`;
      }
      return `position ${pos} in the ${["left", "middle", "right"][zi]} of the bar`;
    }

    focus(it) { if (!it) return; this.roving(it); it.focus(); }

    roving(active) {
      const all = this.items();
      if (!active || !active.isConnected) active = all.find((i) => i.tabIndex === 0 && i.isConnected) || all[0];
      all.forEach((i) => { i.tabIndex = i === active ? 0 : -1; });
    }

    tell(msg) { this.say.textContent = ""; setTimeout(() => { this.say.textContent = msg; }, 30); }

    sync() {
      this.zones = this.zoneEls.map((z) => [...z.children].map((c) => c.dataset.id));
      this.fit();
      if (this.o.onChange) this.o.onChange(this);
    }

    // ---- widgets
    /** True while the widget is in the dock (one that is on its way out no longer counts). */
    has(key) { return !!this.host.querySelector(`[data-id="w:${key}"]:not(.leaving)`); }

    addWidget(key) {
      if (this.has(key)) return;
      const el = this.item("w:" + key);
      const z = this.zoneEls[2], clock = z.querySelector('[data-id="w:clock"]');
      this.flip(() => z.insertBefore(el, key !== "clock" && clock ? clock : null), el);
      if (!reduce.matches) {
        el.classList.add("entering");
        el.addEventListener("animationend", () => el.classList.remove("entering"), { once: true });
      }
      this.sync();
      this.roving();
      this.tell(`${WIDGETS[key].name} added to the dock.`);
    }

    removeWidget(key) {
      const el = this.host.querySelector(`[data-id="w:${key}"]`);
      if (!el) return;
      let gone = false;
      const done = () => { if (gone) return; gone = true; this.flip(() => el.remove()); this.sync(); this.roving(); };
      this.tell(`${WIDGETS[key].name} removed from the dock.`);
      if (reduce.matches || !el.getClientRects().length) { done(); return; }
      el.classList.remove("entering");
      el.classList.add("leaving");
      el.addEventListener("animationend", (e) => { if (e.target === el) done(); });
      setTimeout(done, 320);   // in case the animation never runs (hidden element, background tab)
    }

    reset() {
      this.fill(this.initial);
      this.sync();
      this.tell("Layout reset.");
    }
  }

  // ---------------------------------------------------------------- auto-hide inside a demo screen
  function autohide(screen, dock, on) {
    screen.classList.toggle("autohide", on);
    if (screen._ah) { screen.removeEventListener("pointermove", screen._ah.move); screen.removeEventListener("pointerleave", screen._ah.leave); }
    screen._ah = null;
    dock.host.classList.remove("tucked");
    if (!on) return;
    let timer = 0;
    const hide = () => { clearTimeout(timer); timer = setTimeout(() => dock.host.classList.add("tucked"), 650); };
    const move = (e) => {
      const r = screen.getBoundingClientRect(), d = dock.host.getBoundingClientRect();
      const top = dock.o.pos === "top";
      const atEdge = top ? e.clientY - r.top < 26 : r.bottom - e.clientY < 26;
      const overDock = e.clientY >= d.top - 30 && e.clientY <= d.bottom + 10;
      if (atEdge || (!dock.host.classList.contains("tucked") && overDock)) { clearTimeout(timer); dock.host.classList.remove("tucked"); }
      else hide();
    };
    const leave = () => hide();
    screen.addEventListener("pointermove", move);
    screen.addEventListener("pointerleave", leave);
    screen._ah = { move, leave };
    hide();
  }

  window.KD = { Dock, WIDGETS, APPS, svg, widgetBody, autohide };
})();
