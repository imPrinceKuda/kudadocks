/* KudaDocks website: fills in values from config.js and sets up the demos on the home page. */
(() => {
  "use strict";
  const C = window.KUDADOCKS || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------------------------------------------------------------- values from config.js
  const configured = !!C.githubUser && !/YOUR-GITHUB-USERNAME/i.test(C.githubUser);
  const base = `https://github.com/${C.githubUser}/${C.githubRepo}`;
  $$("[data-kd-download]").forEach((a) => { a.href = configured ? `${base}/releases/latest/download/${C.assetName}` : "#setup"; });
  $$("[data-kd-releases]").forEach((a) => { a.href = configured ? `${base}/releases` : "#setup"; });
  $$("[data-kd]").forEach((el) => {
    const v = C[el.dataset.kd];
    if (v == null || v === "") return;
    el.textContent = el.dataset.kd === "sizeMB" ? `${v} MB` : v;
  });
  $$("[data-kd-mail]").forEach((a) => { a.href = "mailto:" + C.email; a.textContent = C.email; });
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // A note for the site owner until config.js is filled in (visitors never see it once it is).
  const pending = [];
  if (!configured) pending.push("your GitHub username");
  if (!C.sha256 || /PASTE/i.test(C.sha256)) pending.push("the installer's SHA-256");
  if (/^\[|example\.com/i.test(C.owner + " " + C.email)) pending.push("your name and contact email");
  if (pending.length && !/\bnosetup\b/.test(location.search)) {
    const note = document.createElement("div");
    note.className = "setup-note";
    note.id = "setup";
    note.setAttribute("role", "status");
    note.textContent = `Site setup: open js/config.js and add ${pending.join(", ")}. See README.md.`;
    document.body.prepend(note);
  }

  if (!window.KD) return;   // legal pages stop here
  const { Dock, WIDGETS, widgetBody, autohide } = window.KD;

  // ---------------------------------------------------------------- hero: the dock that builds itself
  const heroHost = $("#hero-dock");
  if (heroHost) {
    const hero = new Dock(heroHost, {
      label: "KudaDocks demo dock. Hover to magnify; drag any item to move it.",
      zones: [["start", "app:explorer", "app:chrome", "app:discord", "app:spotify", "app:telegram", "app:teams", "app:photoshop", "app:premiere", "app:steam"], [], ["w:weather", "w:tray", "w:clock"]],
      optional: ["app:teams", "app:premiere", "app:steam", "w:weather", "w:tray"],
      optional2: ["app:telegram", "app:photoshop"],
    });
    hero.assemble();
  }

  // ---------------------------------------------------------------- rearrange demo (full-width bar, three areas)
  const arrangeHost = $("#arrange-dock");
  if (arrangeHost) {
    const arrange = new Dock(arrangeHost, {
      label: "Full-width dock. Drag any item, or use Alt and the arrow keys, to move it.",
      layout: "full",
      size: 40,
      magnify: 1.5,
      zones: [["start", "app:explorer", "app:chrome", "app:discord", "app:spotify", "app:photoshop", "app:premiere"], [], ["w:music", "w:weather", "w:tray", "w:clock"]],
      optional: ["app:premiere", "w:weather"],
      optional2: ["app:discord", "app:photoshop", "w:tray"],
    });
    $("#arrange-reset")?.addEventListener("click", () => arrange.reset());
  }

  // ---------------------------------------------------------------- widgets demo + gallery
  const widgetHost = $("#widgets-dock");
  const gallery = $("#gallery");
  if (widgetHost && gallery) {
    const dock = new Dock(widgetHost, {
      label: "Dock for the widget demo.",
      zones: [["start", "app:explorer", "app:chrome", "app:discord", "app:spotify", "app:obs"], [], ["w:clock"]],
      optional: ["app:obs"],
      optional2: ["app:discord"],
    });
    const groups = {};
    Object.entries(WIDGETS).forEach(([key, w]) => { (groups[w.group] ||= []).push(key); });
    Object.entries(groups).forEach(([group, keys]) => {
      const box = document.createElement("div");
      box.className = "shelf";
      const h = document.createElement("h3");
      h.textContent = group;
      const row = document.createElement("div");
      row.className = "shelf-row";
      keys.forEach((key) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "tile";
        tile.dataset.w = key;
        const prev = document.createElement("span");
        prev.className = "tile-prev";
        prev.append(widgetBody(key, false));
        const name = document.createElement("span");
        name.className = "tile-name";
        name.textContent = WIDGETS[key].name;
        const state = document.createElement("span");
        state.className = "tile-state";
        tile.append(prev, name, state);
        const paint = () => {
          const on = dock.has(key);
          tile.setAttribute("aria-pressed", on);
          state.textContent = on ? "In the dock" : "Add";
        };
        paint();
        tile.addEventListener("click", () => {
          if (dock.has(key)) dock.removeWidget(key); else dock.addWidget(key);
          paint();
        });
        row.append(tile);
      });
      box.append(h, row);
      gallery.append(box);
    });
  }

  // ---------------------------------------------------------------- customize demo
  const lookHost = $("#look-dock");
  const lookScreen = $("#look-screen");
  const form = $("#look-form");
  if (lookHost && lookScreen && form) {
    const dock = new Dock(lookHost, {
      label: "Dock for the customization demo.",
      // Compact on purpose: the accent colour shows on the playing bars and the CPU meter.
      zones: [["start", "app:explorer", "app:chrome", "app:discord", "app:spotify", "app:telegram", "app:aftereffects"], [], ["w:eq", "w:cpu", "w:clock"]],
      optional: ["app:telegram", "app:aftereffects", "w:cpu"],
      optional2: ["app:discord"],
    });
    const read = () => {
      const f = new FormData(form);
      const pos = f.get("pos");
      dock.set({
        theme: f.get("theme"),
        accent: f.get("accent"),
        layout: f.get("layout"),
        pos,
        size: +f.get("size"),
        magnify: +f.get("magnify"),
        barAlpha: +f.get("bar") / 100,
      });
      lookScreen.dataset.pos = pos;
      lookScreen.dataset.layout = f.get("layout");
      $("#size-out").textContent = `${f.get("size")} px`;
      $("#magnify-out").textContent = +f.get("magnify") <= 1 ? "Off" : `${(+f.get("magnify")).toFixed(2)}×`;
      $("#bar-out").textContent = +f.get("bar") === 0 ? "Hidden" : `${f.get("bar")}%`;
      autohide(lookScreen, dock, $("#autohide").checked);
    };
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    form.addEventListener("submit", (e) => e.preventDefault());
    read();
  }
})();
