(function () {
  "use strict";
  
  // Prevent double initialization
  if (window.__FB_NAV_MASTER_INIT__) return;
  window.__FB_NAV_MASTER_INIT__ = true;
  
  const BASE = "https://cdn.jsdelivr.net/gh/casperudesen/global-styles@main";
  const NAV_ID = "fb-nav";
  const CONTAINER_ID = "fb-nav-container";
  
  let navHTML = null;
  let currentPath = location.pathname;

  function log(...args) {
    console.log("[FB Nav GTM]", ...args);
  }

  // Pre-fetch nav HTML immediately
  function fetchNavHTML() {
    if (navHTML) return Promise.resolve(navHTML);
    
    return fetch(BASE + "/nav.html?v=dev9", { cache: "no-store" })
      .then(r => r.text())
      .then(html => {
        navHTML = html;
        return html;
      });
  }

  // Create or get the nav container
  function getOrCreateContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement("div");
      container.id = CONTAINER_ID;
      // Append to documentElement, not body - React controls body
      document.documentElement.appendChild(container);
    }
    return container;
  }

  // Inject guard CSS to hide default nav
  function injectGuardCSS() {
    if (document.getElementById("fb-nav-guard-style")) return;
    
    const style = document.createElement("style");
    style.id = "fb-nav-guard-style";
    style.textContent = `
      [data-section-type="NavigationComponent"],
      [data-section-type="HeaderComponent"],
      [data-component-type="NavigationComponent"],
      header.fixed.top-0 {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      
      #${CONTAINER_ID} {
        display: block !important;
        visibility: visible !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Init nav behavior (scroll, toggle, etc.)
  function initNavBehavior() {
    const nav = document.getElementById(NAV_ID);
    if (!nav || nav.dataset.initialized) return;
    nav.dataset.initialized = "true";

    // Scroll effect
    function handleScroll() {
      if (!nav.classList.contains("fb-nav--open")) {
        nav.classList.toggle("fb-nav--scrolled", window.scrollY > 50);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Mobile toggle (delegated)
    document.addEventListener("click", function(e) {
      const toggle = e.target.closest("#fb-nav-toggle");
      if (toggle) {
        e.preventDefault();
        const isOpen = nav.classList.toggle("fb-nav--open");
        document.body.classList.toggle("fb-menu-open", isOpen);
      }
      
      const mobileLink = e.target.closest(".fb-nav__mobile-link");
      if (mobileLink) {
        nav.classList.remove("fb-nav--open");
        document.body.classList.remove("fb-menu-open");
      }
    });

    // Update active links
    updateActiveLinks();
  }

  function updateActiveLinks() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;
    
    const current = location.pathname.split("?")[0].replace(/\/+$/, "") || "/";
    
    nav.querySelectorAll(".fb-nav__link, .fb-nav__mobile-link").forEach(a => {
      const href = (a.getAttribute("href") || "/").split("?")[0].replace(/\/+$/, "") || "/";
      const isActive = href === "/" ? current === "/" : current.startsWith(href);
      a.classList.toggle("fb-nav__link--active", isActive);
    });
  }

  // Main inject function
  function ensureNav(reason) {
    log("Checking nav, reason:", reason);
    
    // Guard CSS always needed
    injectGuardCSS();
    
    // If nav exists, just update links
    if (document.getElementById(NAV_ID)) {
      updateActiveLinks();
      return;
    }
    
    // Fetch and inject
    fetchNavHTML().then(html => {
      // Double-check it wasn't added while fetching
      if (document.getElementById(NAV_ID)) return;
      
      const container = getOrCreateContainer();
      container.innerHTML = html;
      initNavBehavior();
      log("Nav injected:", reason);
    });
  }

  // Route change handler
  function onRouteChange(reason) {
    if (location.pathname === currentPath) return;
    currentPath = location.pathname;
    log("Route changed:", reason, "->", currentPath);
    
    // Multiple attempts to catch React's async rendering
    ensureNav(reason);
    setTimeout(() => ensureNav(reason + " +100ms"), 100);
    setTimeout(() => ensureNav(reason + " +300ms"), 300);
    setTimeout(() => ensureNav(reason + " +800ms"), 800);
  }

  // Hook history API
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(() => onRouteChange("pushState"), 50);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    setTimeout(() => onRouteChange("replaceState"), 50);
  };

  window.addEventListener("popstate", () => onRouteChange("popstate"));

  // DOM observer for React removing our nav
  const observer = new MutationObserver(() => {
    if (!document.getElementById(NAV_ID)) {
      ensureNav("mutation-observer");
    }
  });

  // Periodic check as fallback
  setInterval(() => {
    if (!document.getElementById(NAV_ID)) {
      ensureNav("interval-check");
    }
  }, 1000);

  // Initialize
  function init() {
    log("Initializing...");
    
    // Pre-fetch nav HTML
    fetchNavHTML();
    
    // Start observer
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial inject
    ensureNav("init");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  
  // Also on load
  window.addEventListener("load", () => ensureNav("window-load"));
  
  // BFCache handling
  window.addEventListener("pageshow", e => {
    if (e.persisted) ensureNav("bfcache");
  });

})();
