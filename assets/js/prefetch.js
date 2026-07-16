/**
 * Hover/touch prefetch — speeds up internal page navigation by
 * fetching the destination HTML before the user actually clicks.
 *
 * What it does:
 *   - On `mouseover` (or `touchstart` on mobile) of any internal
 *     same-origin link, inject <link rel="prefetch"> for the URL
 *     so the browser warms its HTTP cache.
 *   - When the user then clicks, the page renders from cache —
 *     usually instant.
 *
 * What it skips:
 *   - External links (different origin)
 *   - mailto:, tel:, javascript:
 *   - Same-page hash anchors (#how, #pricing, etc.)
 *   - The current page itself
 *   - Users with `Save-Data` / `prefers-reduced-data` on
 *   - URLs already prefetched in this session
 *
 * 60ms debounce on hover avoids prefetching every link the cursor
 * skims past on its way somewhere else.
 */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Respect data-saver / reduced-data users.
  try {
    var c = navigator.connection;
    if (c && (c.saveData === true)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-data: reduce)").matches) return;
  } catch (e) { /* ignore */ }

  // Feature-detect rel=prefetch. Fall back to a quiet fetch() so
  // the cache still warms on older Safari.
  var supportsPrefetch = (function () {
    try {
      var link = document.createElement("link");
      return !!(link.relList && link.relList.supports && link.relList.supports("prefetch"));
    } catch (e) { return false; }
  })();

  var prefetched = new Set();

  function prefetch(url) {
    if (prefetched.has(url)) return;
    prefetched.add(url);
    if (supportsPrefetch) {
      var link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      link.as = "document";
      document.head.appendChild(link);
    } else {
      try { fetch(url, { credentials: "same-origin", priority: "low" }).catch(function () {}); }
      catch (e) { /* ignore */ }
    }
  }

  // Returns the URL string to prefetch, or null if the link isn't
  // eligible.
  function eligible(a) {
    if (!a || !a.href) return null;
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.origin !== location.origin) return null;
    // Same pathname + same search means we're already here (or just
    // jumping to a hash on the current page).
    if (u.pathname === location.pathname && u.search === location.search) return null;
    if (a.target && a.target !== "" && a.target !== "_self") return null;
    if (a.hasAttribute("download")) return null;
    return u.pathname + u.search;
  }

  var hoverTimer = null;

  document.addEventListener("mouseover", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var url = eligible(a);
    if (!url) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () { prefetch(url); }, 60);
  }, { passive: true });

  document.addEventListener("mouseout", function () {
    clearTimeout(hoverTimer);
  }, { passive: true });

  // No hover on touch — prefetch the moment a finger lands on a link.
  document.addEventListener("touchstart", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var url = eligible(a);
    if (!url) return;
    prefetch(url);
  }, { passive: true });

  // Also prefetch links that focus via keyboard (Tab nav).
  document.addEventListener("focusin", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var url = eligible(a);
    if (!url) return;
    prefetch(url);
  }, { passive: true });
})();
