(() => {
  if (document.getElementById("cl-insight-badge")) return;

  // 17 chars, excludes I,O,Q
  const VIN_RE = /\b([A-HJ-NPR-Z0-9]{17})\b/g;

  function unique(arr) { return Array.from(new Set(arr)); }

  function findFromUrl() {
    const m = location.href.match(VIN_RE);
    return m && m[0] ? m[0] : null;
  }

  function findFromMetaAndAttrs() {
    const selectors = [
      '[data-vin]',
      '[data-vehicle-vin]',
      '[data-listing-vin]',
      '[data-analytics-vin]',
      'meta[name="vin"]',
      'meta[property="vin"]'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;

      const v =
        el.getAttribute("data-vin") ||
        el.getAttribute("data-vehicle-vin") ||
        el.getAttribute("data-listing-vin") ||
        el.getAttribute("data-analytics-vin") ||
        el.getAttribute("content") ||
        "";

      const m = v.match(VIN_RE);
      if (m && m[0]) return m[0];
    }
    return null;
  }

  function findFromPageText() {
    // cheap scan: headings + body text
    const chunks = [];
    const h1 = document.querySelector("h1")?.innerText || "";
    const h2 = document.querySelector("h2")?.innerText || "";
    const body = document.body?.innerText || "";
    chunks.push(h1, h2, body);

    const all = unique(chunks.join("\n").match(VIN_RE) || []);
    return all[0] || null;
  }

  function detectVin() {
    return findFromUrl() || findFromMetaAndAttrs() || findFromPageText();
  }

  function openCarLeopard(vin) {
    // Change this destination anytime without changing extension logic:
    // - carleopard.com/ (consumer)
    // - carleopard.io/report (viewer)
    const url = new URL("https://carleopard.com/");
    url.searchParams.set("vin", vin);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function createBadge(vin) {
    const badge = document.createElement("div");
    badge.id = "cl-insight-badge";
    badge.setAttribute("role", "button");
    badge.setAttribute("aria-label", "Open Car Leopard Insight");

    const dot = document.createElement("div");
    dot.id = "cl-insight-dot";

    const textWrap = document.createElement("div");
    const title = document.createElement("div");
    title.textContent = "Car Leopard Insight";

    const sub = document.createElement("div");
    sub.id = "cl-insight-sub";
    sub.textContent = `VIN detected • ${vin}`;

    const close = document.createElement("div");
    close.id = "cl-insight-close";
    close.textContent = "×";
    close.title = "Hide";

    textWrap.appendChild(title);
    textWrap.appendChild(sub);

    badge.appendChild(dot);
    badge.appendChild(textWrap);
    badge.appendChild(close);

    badge.addEventListener("click", (e) => {
      if (e.target === close) {
        badge.remove();
        return;
      }
      openCarLeopard(vin);
    });

    document.body.appendChild(badge);
  }

  function run() {
    const vin = detectVin();
    if (!vin) return;
    createBadge(vin);
  }

  // First run
  run();

  // Handle SPA navigation (CarGurus / others sometimes behave like SPAs)
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      document.getElementById("cl-insight-badge")?.remove();
      run();
    }
  }, 900);
})();
