(function () {
  function normalizePath(p) {
    return (p || "/").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  }

  function isActiveTarget(current, target) {
    const t = normalizePath(target);
    if (t === "/") return current === "/";
    return current === t || current.startsWith(t + "/");
  }

  function setActiveLinks() {
    const current = normalizePath(window.location.pathname);

    // Desktop links
    document.querySelectorAll("#fb-nav .fb-nav__link").forEach((a) => {
      const target = a.getAttribute("href") || "/";
      const active = isActiveTarget(current, target);

      a.classList.toggle("fb-nav__link--active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    // Mobile links
    document.querySelectorAll("#fb-nav .fb-nav__mobile-link").forEach((a) => {
      const target = a.getAttribute("href") || "/";
      const active = isActiveTarget(current, target);

      a.classList.toggle("fb-nav__link--active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function initNavInteractions() {
    const nav = document.getElementById("fb-nav");
    const toggle = document.getElementById("fb-nav-toggle");
    if (!nav || !toggle) return;

    // Prevent double-binding
    if (nav.dataset.fbBound === "1") return;
    nav.dataset.fbBound = "1";

    function handleScroll() {
      if (!nav.classList.contains("fb-nav--open")) {
        nav.classList.toggle("fb-nav--scrolled", window.scrollY > 50);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = nav.classList.toggle("fb-nav--open");
      document.body.classList.toggle("fb-menu-open", isOpen);
    });

    document.querySelectorAll("#fb-nav .fb-nav__mobile-link").forEach((link) => {
      link.addEventListener("click", function () {
        nav.classList.remove("fb-nav--open");
        document.body.classList.remove("fb-menu-open");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("fb-nav--open")) {
        nav.classList.remove("fb-nav--open");
        document.body.classList.remove("fb-menu-open");
      }
    });
  }

  function initOnceNavExists() {
    // Only run when injected nav is actually in DOM
    const nav = document.getElementById("fb-nav");
    if (!nav) return false;

    setActiveLinks();
    initNavInteractions();
    return true;
  }

  function initWithRetry() {
    if (initOnceNavExists()) return;

    // Retry a few times in case nav.html is injected async
    let tries = 0;
    const maxTries = 40; // ~4s at 100ms
    const t = setInterval(() => {
      tries += 1;
      if (initOnceNavExists() || tries >= maxTries) clearInterval(t);
    }, 100);
  }

  // Expose for your injector to call after innerHTML is set
  window.fbNavInit = initWithRetry;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWithRetry);
  } else {
    initWithRetry();
  }

  // Re-run active link on SPA style navigation if history changes
  window.addEventListener("popstate", () => setActiveLinks());
})();
