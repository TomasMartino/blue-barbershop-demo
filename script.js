/* ============================================================
   THE BLUE BARBERSHOP — JavaScript del sitio
   Funcionalidades:
   1. Menú mobile (hamburguesa)
   2. Header sticky que cambia al scrollear
   3. Animaciones de entrada con IntersectionObserver
   4. Lightbox de galería con teclado (Esc, ←, →)
   ============================================================ */

(function () {
  "use strict";

  /* Utilidad: ¿el usuario prefiere reducir el movimiento? */
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. MENÚ MOBILE
     ---------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("nav");

  if (navToggle && nav) {
    // Abre/cierra el menú y actualiza aria-expanded
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );
    });

    // Al hacer clic en un link del menú, se cierra (navegación en una sola página)
    nav.querySelectorAll(".nav__link, .nav__cta").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menú de navegación");
      });
    });

    // Al presionar Escape se cierra el menú mobile
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     2. HEADER STICKY — cambia de estilo al hacer scroll
     ---------------------------------------------------------- */
  var header = document.getElementById("header");

  if (header) {
    var updateHeader = function () {
      // A partir de 40px de scroll el header pasa a fondo sólido
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };

    updateHeader(); // estado inicial
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ----------------------------------------------------------
     3. ANIMACIONES DE ENTRADA (IntersectionObserver)
     Los elementos con la clase .reveal aparecen al entrar en pantalla.
     ---------------------------------------------------------- */
  var revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length > 0) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      // Sin animación: mostramos todo de inmediato
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target); // anima una sola vez
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------
     4. LIGHTBOX DE LA GALERÍA
     - Click en una miniatura → abre la imagen grande
     - Esc cierra · ← y → navegan · botones visibles
     - Mantiene el foco dentro del diálogo (accesibilidad)
     ---------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var btnClose = document.getElementById("lightbox-close");
  var btnPrev = document.getElementById("lightbox-prev");
  var btnNext = document.getElementById("lightbox-next");
  var galleryButtons = Array.prototype.slice.call(
    document.querySelectorAll(".masonry__btn")
  );

  var currentIndex = 0;
  var lastFocusedElement = null;

  // Abre el lightbox con la imagen en la posición `index`
  function openLightbox(index) {
    if (!lightbox || galleryButtons.length === 0) return;

    currentIndex = index;
    lastFocusedElement = document.activeElement;
    renderLightboxImage();

    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    btnClose.focus();
  }

  // Actualiza imagen y pie de foto según currentIndex
  function renderLightboxImage() {
    var button = galleryButtons[currentIndex];
    var fullSrc = button.getAttribute("data-lightbox-src");
    var altText = button.getAttribute("data-lightbox-alt") || "";
    var thumb = button.querySelector("img");

    lightboxImg.src = fullSrc;
    lightboxImg.alt = altText;
    lightboxCaption.textContent =
      altText + " · " + (currentIndex + 1) + " de " + galleryButtons.length;

    // Previsualización en background (la miniatura original)
    if (thumb) {
      lightbox.style.backgroundImage = "url('" + thumb.src + "')";
      lightbox.style.backgroundSize = "cover";
      lightbox.style.backgroundPosition = "center";
      lightbox.style.backgroundBlendMode = "darken";
    }
  }

  // Cierra el lightbox y devuelve el foco al botón que lo abrió
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;

    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImg.src = "";

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryButtons.length) % galleryButtons.length;
    renderLightboxImage();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryButtons.length;
    renderLightboxImage();
  }

  if (lightbox && galleryButtons.length > 0) {
    // Abrir desde cada miniatura de la galería
    galleryButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", showPrev);
    btnNext.addEventListener("click", showNext);

    // Cerrar al hacer clic fuera de la imagen
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    // Teclado: Esc cierra, flechas navegan
    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      switch (event.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          showPrev();
          break;
        case "ArrowRight":
          showNext();
          break;
        case "Tab": {
          // Foco atrapado dentro del diálogo (accesibilidad)
          var focusables = [btnClose, btnPrev, btnNext];
          var first = focusables[0];
          var last = focusables[focusables.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
          break;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     5. NAVEGACIÓN SUAVE (solo si no se pidió reducir movimiento)
     ---------------------------------------------------------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var targetId = anchor.getAttribute("href");
        if (targetId.length <= 1) return;

        var target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        // Actualiza la URL sin salto brusco
        if (history.pushState) {
          history.pushState(null, "", targetId);
        }
      });
    });
  }
})();
