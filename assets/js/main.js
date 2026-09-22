/* ==========================================================================
   Kronos — Interacciones de la landing
   ========================================================================== */
(() => {
  "use strict";

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Header con fondo al hacer scroll --- */
  const header = $("#site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Menú móvil --- */
  const nav = $("#primary-nav");
  const navToggle = $(".nav-toggle");
  if (nav && navToggle) {
    const setMenu = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (header) header.classList.toggle("is-menu-open", open);
    };

    navToggle.addEventListener("click", () => {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* --- Animación de aparición al hacer scroll --- */
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty("--reveal-delay", `${entry.target.dataset.delay || 0}ms`);
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* --- Contadores animados --- */
  const counters = $$("[data-count]");
  const renderCount = (el) => {
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    el.textContent = parseFloat(el.dataset.count).toFixed(decimals);
  };
  if (counters.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || "0", 10);
            const duration = 1600;
            const start = performance.now();

            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = (target * eased).toFixed(decimals);
              if (progress < 1) requestAnimationFrame(tick);
              else el.textContent = target.toFixed(decimals);
            };

            requestAnimationFrame(tick);
            countObserver.unobserve(el);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => countObserver.observe(el));
    } else {
      counters.forEach(renderCount);
    }
  }

  /* --- Enlace activo según la sección visible --- */
  const navLinks = $$(".nav__link");
  const sections = $$("main section[id]");
  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = navLinks.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
          if (!match) return;
          navLinks.forEach((link) => link.classList.toggle("is-active", link === match));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* --- Brillo que sigue al cursor en las tarjetas --- */
  if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  /* --- FAQ: solo una respuesta abierta a la vez --- */
  const faqItems = $$(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* --- Año dinámico en el footer --- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
