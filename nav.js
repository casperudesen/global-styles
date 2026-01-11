(function () {
  function normalizePath(p) {
    return (p || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+$/, "") || "/";
  }

  function setActiveLinks() {
    const current = normalizePath(window.location.pathname);

    // Match exact path or prefix (for subpages like /omraade-amager under /vores-omraader if you want)
    function isActive(target) {
      const t = normalizePath(target);
      if (t === "/") return current === "/";
      return current === t || current.startsWith(t + "/");
    }

    document.querySelectorAll("[data-fb-nav] a[data-nav]").forEach((a) => {
      const target = a.getAttribute("data-nav") || a.getAttribute("href") || "/";
      const active = isActive(target);

      a.classList.toggle("fb-nav__link--active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function initNavInteractions() {
    const nav = document.getElementById("fb-nav");
    const toggle = document.getElementById("fb-nav-toggle");
    if (!nav || !toggle) return;

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

    document.querySelectorAll(".fb-nav__mobile-link").forEach(function (link) {
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

  function init() {
    setActiveLinks();
    initNavInteractions();
  }

  // If nav is injected after load, calling init again is safe
  window.fbNavInit = init;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
