(function () {
  "use strict";

  // ============================================
  // VERSION CONTROL - CHANGE ONLY HERE
  // ============================================
  var VERSION = "v1.0.6";
  var BASE = "https://cdn.jsdelivr.net/gh/casperudesen/global-styles@main";
  var DEBUG = false;

  // ============================================
  // PREVENT DOUBLE INIT
  // ============================================
  if (window.fbNavSystemLoaded) return;
  window.fbNavSystemLoaded = true;

  var NAV_ID = "fb-nav";
  var CONTAINER_ID = "fb-nav-container";
  var navHTML = null;
  var currentPath = location.pathname;
  var injectionInProgress = false;

  // ============================================
  // LOGGING
  // ============================================
  function log() {
    if (DEBUG) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[FB NAV " + VERSION + "]");
      console.log.apply(console, args);
    }
  }

  // ============================================
  // 1. LOAD CSS (once)
  // ============================================
  function loadCSS() {
    if (document.getElementById("fb-global-css")) return;
    var css = document.createElement("link");
    css.id = "fb-global-css";
    css.rel = "stylesheet";
    css.href = BASE + "/a.css?v=" + VERSION;
    document.head.appendChild(css);
    log("CSS loaded");
  }

  // ============================================
  // 2. INJECT CRITICAL INLINE CSS
  // ============================================
  function injectCriticalCSS() {
    if (document.getElementById("fb-critical-css")) return;
    var style = document.createElement("style");
    style.id = "fb-critical-css";
    style.textContent = [
      "/* 1. KILLS SYSTEM FORCED PADDING/HEIGHTS */",
      ":root, body, #root, [style*='--heightMobile'] {",
      "  --heightMobile: 0px !important;",
      "  --heightDesktop: 0px !important;",
      "  --heightMobileVisible: 0px !important;",
      "  --heightDesktopVisible: 0px !important;",
      "}",
      "",
      "/* 2. NEUTRALIZE TAILWIND PADDING CLASSES */",
      ".pt-\\[var\\(--heightMobile\\)\\],",
      ".md\\:pt-\\[var\\(--heightDesktop\\)\\] {",
      "  padding-top: 0 !important;",
      "}",
      "",
      "/* Hide RealEquity default header */",
      "[data-section-type='NavigationComponent'],",
      "[data-section-type='HeaderComponent'],",
      "[data-component-type='NavigationComponent'],",
      "[data-component-type='HeaderComponent'],",
      "header.fixed.top-0,",
      "body > div#root > div > header:first-child,",
      "body > div#root > header:first-child {",
      "  display: none !important;",
      "  visibility: hidden !important;",
      "  height: 0 !important;",
      "  overflow: hidden !important;",
      "}",
      "",
      "/* Nav container */",
      "#fb-nav-container, #fb-nav-mount, .fb-nav {",
      "  position: fixed !important;",
      "  top: 0; left: 0; right: 0;",
      "  z-index: 999999 !important;",
      "  -webkit-transform: translateZ(999999px);",
      "}",
      "",
      "/* Mobile menu open state */",
      "body.fb-menu-open {",
      "  overflow: hidden !important;",
      "  position: fixed !important;",
      "  width: 100%;",
      "}",
      "body.fb-menu-open .fb-nav__mobile {",
      "  opacity: 1 !important;",
      "  visibility: visible !important;",
      "  pointer-events: auto !important;",
      "}",
      "body.fb-menu-open .fb-nav {",
      "  background: var(--c-primary) !important;",
      "}",
      "body.fb-menu-open .fb-nav__hamburger span:nth-child(1) {",
      "  transform: translateY(7px) rotate(45deg);",
      "}",
      "body.fb-menu-open .fb-nav__hamburger span:nth-child(2) {",
      "  opacity: 0; transform: scaleX(0);",
      "}",
      "body.fb-menu-open .fb-nav__hamburger span:nth-child(3) {",
      "  transform: translateY(-7px) rotate(-45deg);",
      "}",
      "body.fb-menu-open .fb-nav__logo,",
      "body.fb-menu-open .fb-nav__icon { color: #fff !important; }",
      "body.fb-menu-open .fb-nav__logo-svg path { fill: #fff !important; }",
      "body.fb-menu-open .fb-nav__hamburger span { background: #fff !important; }",
      "",
      "#fb-nav-toggle {",
      "  cursor: pointer !important;",
      "  -webkit-tap-highlight-color: transparent;",
      "  pointer-events: auto !important;",
      "}",
      "",
      "/* Section animations */",
      ".fb-section-animate {",
      "  opacity: 0;",
      "  transform: translateY(30px);",
      "  transition: opacity 0.6s ease, transform 0.6s ease;",
      "}",
      ".fb-section-animate.fb-visible { opacity: 1; transform: translateY(0); }",
      "",
      "/* Hero animations */",
      ".hero-title, .hero-subtitle, .hero-buttons {",
      "  opacity: 0;",
      "  transform: translateY(20px);",
      "  transition: opacity 0.8s ease, transform 0.8s ease;",
      "}",
      ".hero-title.fb-visible { opacity: 1; transform: translateY(0); }",
      ".hero-subtitle.fb-visible { opacity: 1; transform: translateY(0); transition-delay: 0.15s; }",
      ".hero-buttons.fb-visible { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }"
    ].join("\n");
    document.head.insertBefore(style, document.head.firstChild);
    log("Critical CSS injected");
  }

  // ============================================
  // 3. FETCH NAV HTML
  // ============================================
  function fetchNavHTML(callback) {
    if (navHTML) { callback(navHTML); return; }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BASE + "/nav.html?v=" + VERSION, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          navHTML = xhr.responseText;
          log("Nav HTML fetched");
          callback(navHTML);
        } else {
          log("Nav fetch failed:", xhr.status);
        }
      }
    };
    xhr.send();
  }

  // ============================================
  // 4. INJECT NAVIGATION
  // ============================================
  function injectNav(reason) {
    if (injectionInProgress) { log("Injection in progress, skipping"); return; }
    if (document.getElementById(NAV_ID)) { log("Nav already exists"); return; }

    injectionInProgress = true;
    log("Injecting nav:", reason);

    fetchNavHTML(function (html) {
      if (document.getElementById(NAV_ID)) { injectionInProgress = false; return; }

      var container = document.getElementById(CONTAINER_ID);
      if (!container) {
        container = document.createElement("div");
        container.id = CONTAINER_ID;
        // Append to documentElement — outside React's component tree
        document.documentElement.appendChild(container);
      }

      container.innerHTML = html;
      initNavBehavior();
      injectionInProgress = false;
      log("Nav injected successfully");
    });
  }

  // ============================================
  // 5. INIT NAV BEHAVIOUR
  // ============================================
  function initNavBehavior() {
    var nav = document.getElementById(NAV_ID);
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add("fb-nav--scrolled");
    if (typeof window.fbNavInit === "function") window.fbNavInit();
  }

  // ============================================
  // 6. GLOBAL EVENT DELEGATION (attached once)
  // ============================================
  function setupGlobalEvents() {
    document.addEventListener("click", function (e) {
      var toggle = e.target.closest("#fb-nav-toggle");
      var nav = document.getElementById(NAV_ID);

      if (toggle && nav) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = nav.classList.toggle("fb-nav--open");
        document.body.classList.toggle("fb-menu-open", isOpen);
        log("Menu toggled:", isOpen ? "open" : "closed");
      }

      if (e.target.closest(".fb-nav__mobile-link")) {
        if (nav) nav.classList.remove("fb-nav--open");
        document.body.classList.remove("fb-menu-open");
      }

      var link = e.target.closest("a[href]");
      if (link) {
        var href = link.getAttribute("href");
        if (href && (href.startsWith("/") || href.startsWith(location.origin))) {
          setTimeout(function () { ensureNav("link-click"); }, 50);
        }
      }
    }, true);

    window.addEventListener("scroll", function () {
      var nav = document.getElementById(NAV_ID);
      if (nav && !document.body.classList.contains("fb-menu-open")) {
        nav.classList.toggle("fb-nav--scrolled", window.scrollY > 50);
      }
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var nav = document.getElementById(NAV_ID);
        if (nav && nav.classList.contains("fb-nav--open")) {
          nav.classList.remove("fb-nav--open");
          document.body.classList.remove("fb-menu-open");
        }
      }
    });

    log("Global events set up");
  }

  // ============================================
  // 7. ROUTE CHANGE DETECTION
  // ============================================
  function ensureNav(reason) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!document.getElementById(NAV_ID)) injectNav(reason);
      });
    });
  }

  function onRouteChange(reason) {
    log("Route change:", reason, "->", location.pathname);
    currentPath = location.pathname;
    ensureNav(reason);
    setTimeout(function () { ensureNav(reason + "+100"); }, 100);
    setTimeout(function () { ensureNav(reason + "+300"); }, 300);
    setTimeout(function () { ensureNav(reason + "+600"); }, 600);
    setTimeout(function () { ensureNav(reason + "+1200"); }, 1200);
    setTimeout(initPageClasses, 200);
  }

  function hookHistoryAPI() {
    var origPush = history.pushState;
    history.pushState = function () {
      origPush.apply(this, arguments);
      onRouteChange("pushState");
    };

    var origReplace = history.replaceState;
    history.replaceState = function () {
      origReplace.apply(this, arguments);
      setTimeout(function () { ensureNav("replaceState"); }, 100);
    };

    window.addEventListener("popstate", function () {
      onRouteChange("popstate");
    });

    log("History API hooked");
  }

  // ============================================
  // 8. DOM MONITORING
  // ============================================
  function startMonitoring() {
    var observer = new MutationObserver(function () {
      if (!document.getElementById(NAV_ID)) {
        log("MutationObserver: nav missing, re-injecting");
        ensureNav("mutation-observer");
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }

    // Interval fallback
    setInterval(function () {
      if (!document.getElementById(NAV_ID) || !document.getElementById(CONTAINER_ID)) {
        injectNav("interval-check");
      }
    }, 500);

    // Path-change polling (React may change URL without events)
    setInterval(function () {
      if (location.pathname !== currentPath) {
        onRouteChange("path-poll");
      }
    }, 200);

    // BFCache restore
    window.addEventListener("pageshow", function (e) {
      var isBackForward = e.persisted;
      if (!isBackForward && window.performance &&
          typeof window.performance.getEntriesByType === "function") {
        var navEntry = window.performance.getEntriesByType("navigation")[0];
        if (navEntry && navEntry.type === "back_forward") isBackForward = true;
      }
      if (isBackForward) {
        log("BFCache restore");
        onRouteChange("bfcache");
      }
    });

    log("Monitoring started");
  }

  // ============================================
  // 9. PAGE CLASSES & ANIMATIONS
  // ============================================
  function initPageClasses() {
    if (document.body.classList.contains("fb-page-initialized")) return;

    var pageSlug = location.pathname
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .replace(/\//g, "-") || "forside";

    var oldClasses = [];
    document.body.classList.forEach(function (c) {
      if (c.startsWith("fb-page-")) oldClasses.push(c);
    });
    oldClasses.forEach(function (c) { document.body.classList.remove(c); });

    document.body.classList.add("fb-page-" + pageSlug);
    document.body.classList.add("fb-page-initialized");

    var sections = document.querySelectorAll("section[data-section-type]");
    var index = 0;
    sections.forEach(function (section) {
      var type = section.getAttribute("data-section-type");
      if (type === "DynamicSectionComponent" || type === "Emnevisning") {
        index++;
        section.classList.add("fb-section", "fb-section-" + index);
      }
    });

    var heroSection = null;
    sections.forEach(function (section) {
      if (heroSection) return;
      if (section.querySelector(".hero-title") || section.querySelector(".hero-buttons")) {
        heroSection = section;
      }
    });
    if (heroSection) heroSection.classList.add("fb-hero-section");

    log("Page classes initialized:", pageSlug, index + " sections");

    initHeroAnimation();
    initSectionAnimations();
  }

  function initHeroAnimation() {
    var hero = document.querySelector(".fb-hero-section");
    if (!hero) return;
    var title = hero.querySelector(".hero-title");
    var subtitle = hero.querySelector(".hero-subtitle");
    var buttons = hero.querySelector(".hero-buttons");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (title) title.classList.add("fb-visible");
        if (subtitle) subtitle.classList.add("fb-visible");
        if (buttons) buttons.classList.add("fb-visible");
      });
    });
  }

  function initSectionAnimations() {
    if (!("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("fb-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    document.querySelectorAll(".fb-section:not(.fb-section-1):not(.fb-hero-section)")
      .forEach(function (el) {
        if (!el.classList.contains("fb-section-animate")) {
          el.classList.add("fb-section-animate");
          observer.observe(el);
        }
      });
  }

  // ============================================
  // 10. MAIN INIT
  // ============================================
  function init() {
    log("Initializing...");
    injectCriticalCSS();
    loadCSS();
    setupGlobalEvents();
    hookHistoryAPI();
    startMonitoring();

    injectNav("init");
    setTimeout(function () { injectNav("init+100"); }, 100);
    setTimeout(function () { injectNav("init+500"); }, 500);
    setTimeout(function () { injectNav("init+1000"); }, 1000);

    setTimeout(initPageClasses, 200);
    setTimeout(initPageClasses, 600);

    log("Initialization complete");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    ensureNav("window-load");
    initPageClasses();
  });

})();
