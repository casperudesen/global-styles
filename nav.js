(function () {
  // ---------------------------------------------------------
  // 1. Hjælpefunktioner til URL og aktive links
  // ---------------------------------------------------------
  function normalizePath(p) {
    return (p || "/").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  }

  function isActiveTarget(current, target) {
    const t = normalizePath(target);
    if (t === "/") return current === "/";
    return current === t || current.startsWith(t + "/");
  }

  function setActiveLinks() {
    const nav = document.getElementById("fb-nav");
    if (!nav) return; // Kan ikke sætte links, hvis nav ikke er der

    const current = normalizePath(window.location.pathname);

    // Desktop links
    nav.querySelectorAll(".fb-nav__link").forEach((a) => {
      const target = a.getAttribute("href") || "/";
      const active = isActiveTarget(current, target);

      a.classList.toggle("fb-nav__link--active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    // Mobile links
    nav.querySelectorAll(".fb-nav__mobile-link").forEach((a) => {
      const target = a.getAttribute("href") || "/";
      const active = isActiveTarget(current, target);

      a.classList.toggle("fb-nav__link--active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  // ---------------------------------------------------------
  // 2. Interaktioner (Event Delegation - Den vigtige rettelse!)
  // ---------------------------------------------------------
  function initNavInteractions() {
    // SIKRING: Kør kun denne funktion én gang globalt
    if (window.fbNavInteractionsBound) return;
    window.fbNavInteractionsBound = true;

    // A. Klik på Burger-knappen (Delegeret event)
    document.addEventListener("click", function (e) {
      // Tjek om klikket ramte #fb-nav-toggle eller noget inden i den
      const toggle = e.target.closest("#fb-nav-toggle");
      
      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        
        const nav = document.getElementById("fb-nav");
        if (nav) {
          const isOpen = nav.classList.toggle("fb-nav--open");
          document.body.classList.toggle("fb-menu-open", isOpen);
        }
      }
    });

    // B. Klik på links i mobilmenuen (Luk menuen efter klik)
    document.addEventListener("click", function (e) {
      const link = e.target.closest("#fb-nav .fb-nav__mobile-link");
      
      if (link) {
        const nav = document.getElementById("fb-nav");
        if (nav) {
          nav.classList.remove("fb-nav--open");
          document.body.classList.remove("fb-menu-open");
        }
      }
    });

    // C. Scroll effekt (Tjekker dynamisk om nav findes)
    window.addEventListener("scroll", function() {
      const nav = document.getElementById("fb-nav");
      // Kun kør logik hvis nav findes og ikke er åben
      if (nav && !nav.classList.contains("fb-nav--open")) {
        nav.classList.toggle("fb-nav--scrolled", window.scrollY > 50);
      }
    }, { passive: true });

    // D. Escape tast (Luk menu)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const nav = document.getElementById("fb-nav");
        if (nav && nav.classList.contains("fb-nav--open")) {
          nav.classList.remove("fb-nav--open");
          document.body.classList.remove("fb-menu-open");
        }
      }
    });
  }

  // ---------------------------------------------------------
  // 3. Initialisering (Venter på injector)
  // ---------------------------------------------------------
  function initOnceNavExists() {
    // Vi starter event listeners med det samme (de behøver ikke vente)
    initNavInteractions();

    // Vi tjekker om elementet er kommet, så vi kan sætte "Active" klasser
    const nav = document.getElementById("fb-nav");
    if (!nav) return false;

    setActiveLinks();
    return true;
  }

  function initWithRetry() {
    // Forsøg med det samme
    if (initOnceNavExists()) return;

    // Hvis den fejler (fordi injectoren er langsom), prøv igen løbende
    let tries = 0;
    const maxTries = 50; // 5 sekunder
    const t = setInterval(() => {
      tries += 1;
      // Hvis det lykkes, eller vi løber tør for forsøg, stop.
      if (initOnceNavExists() || tries >= maxTries) clearInterval(t);
    }, 100);
  }

  // Eksponer init-funktion globalt (hvis din injector vil kalde den manuelt)
  window.fbNavInit = initWithRetry;

  // Start scriptet
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWithRetry);
  } else {
    initWithRetry();
  }

  // Opdater aktive links hvis man bruger browserens frem/tilbage knapper
  window.addEventListener("popstate", () => setActiveLinks());
})();
