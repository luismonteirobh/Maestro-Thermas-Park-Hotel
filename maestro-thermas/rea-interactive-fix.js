(function () {
  "use strict";

  // 1. Force global URL helpers to always resolve to current local origin
  window.url_base = (window.location.origin + "/maestro-thermas");
  window.CONF_URL_BASE = (window.location.origin + "/maestro-thermas");
  window.CONF_URL_TEST = (window.location.origin + "/maestro-thermas");
  window.url = function (e) {
    if (!e) return (window.location.origin + "/maestro-thermas");
    if (e.startsWith("http://") || e.startsWith("https://")) {
      return e.replace(/^https?:\/\/(www\.|hml\.)?thermas\.com\.br/i, (window.location.origin + "/maestro-thermas"));
    }
    return (window.location.origin + "/maestro-thermas") + (e.startsWith("/") ? e : "/" + e);
  };
  window.theme = function (e) {
    return (window.location.origin + "/maestro-thermas") + "/themes/site" + (e ? (e.startsWith("/") ? e : "/" + e) : "");
  };
  window.getUrlBase = function () {
    return (window.location.origin + "/maestro-thermas");
  };

  // Remove white overlay blocker immediately
  function removeLoadPage() {
    var blockers = document.querySelectorAll(".load-page, .ajax-load");
    for (var i = 0; i < blockers.length; i++) {
      blockers[i].remove();
    }
  }
  removeLoadPage();
  document.addEventListener("DOMContentLoaded", removeLoadPage);
  window.addEventListener("load", removeLoadPage);

  // 2. Helper to forcefully close any open Bootstrap modal and clean backdrops
  function forceCloseModal(modalEl) {
    if (!modalEl) return;
    try {
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
        window.jQuery(modalEl).modal("hide");
      }
    } catch (_) {}
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.removeAttribute("aria-modal");
    setTimeout(function () {
      var anyVisible = document.querySelector(".modal.show");
      if (!anyVisible) {
        document.querySelectorAll(".modal-backdrop").forEach(function (bd) {
          bd.remove();
        });
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    }, 50);
  }

  // 3. Completely delete & suppress #modalPopup (Black Friday popup)
  function setupPopupBehavior() {
    var popup = document.getElementById("modalPopup");
    if (popup) {
      popup.remove();
    }
    document.querySelectorAll(".modal-backdrop").forEach(function(b) { b.remove(); });
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  // 4. Suppress Cookie Banners
  function setupCookieBanner() {
    document.querySelectorAll(".cc-window, .thermas-cookie-banner, [aria-label='cookieconsent'], .cc-banner").forEach(function(el) {
      el.remove();
    });
  }

  // 5. Smooth scroll to booking engine
  function smoothScrollToBooking(e) {
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }
    closeNavSidebar();

    var target = document.getElementById("enjoy-booking-section") || 
                 document.getElementById("enjoyBookingCard") || 
                 document.querySelector(".enjoy-booking-section");
    if (target) {
      var rect = target.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var targetY = Math.max(0, rect.top + scrollTop - 20);

      try {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      } catch (_) {
        window.scrollTo(0, targetY);
      }

      if (window.jQuery) {
        try {
          window.jQuery("html, body").stop().animate({ scrollTop: targetY }, 650);
        } catch (_) {}
      }

      setTimeout(function () {
        var checkin = document.getElementById("enjoyBoxCheckin") || 
                      document.getElementById("enjoyInputCheckin");
        if (checkin) {
          try { checkin.focus(); } catch (_) {}
        }
      }, 700);
    } else {
      window.location.href = "/maestro-thermas#enjoy-booking-section";
    }
    return false;
  }
  window.smoothScrollToBooking = smoothScrollToBooking;

  // 6. ROBUST & BULLETPROOF MENU SIDEBAR CONTROLLER
  var isNavOpen = false;

  function updateMenuIconState() {
    var p1 = document.querySelector(".js_nav-sidebar__icon-path-01");
    var p2 = document.querySelector(".js_nav-sidebar__icon-path-02");
    var p3 = document.querySelector(".js_nav-sidebar__icon-path-03");
    var p4 = document.querySelector(".js_nav-sidebar__icon-path-04");
    var p5 = document.querySelector(".js_nav-sidebar__icon-path-05");
    var g4 = document.querySelector("#js_nav-sidebar-btn .path-04");
    var g5 = document.querySelector("#js_nav-sidebar-btn .path-05");
    var textSpan = document.querySelector(".js_nav-sidebar__text-span");

    if (isNavOpen) {
      if (textSpan) {
        textSpan.textContent = "FECHAR";
        textSpan.style.setProperty("display", "inline-block", "important");
        textSpan.style.setProperty("opacity", "1", "important");
        textSpan.style.setProperty("color", "#ffffff", "important");
        textSpan.style.setProperty("visibility", "visible", "important");
      }
      // Oculta completamente as 3 barras
      [p1, p2, p3].forEach(function(p) {
        if (p) {
          p.style.setProperty("display", "none", "important");
          p.style.setProperty("opacity", "0", "important");
        }
      });
      // Exibe estritamente o X
      [p4, p5].forEach(function(p) {
        if (p) {
          p.style.setProperty("display", "block", "important");
          p.style.setProperty("opacity", "1", "important");
          p.style.setProperty("fill", "#ffffff", "important");
        }
      });
      [g4, g5].forEach(function(g) {
        if (g) {
          g.style.setProperty("display", "block", "important");
          g.style.setProperty("opacity", "1", "important");
        }
      });
    } else {
      if (textSpan) {
        textSpan.textContent = "MENU";
        textSpan.style.setProperty("display", "inline-block", "important");
        textSpan.style.setProperty("opacity", "1", "important");
        textSpan.style.setProperty("color", "#ffffff", "important");
        textSpan.style.setProperty("visibility", "visible", "important");
      }
      // Exibe estritamente as 3 barras horizontais em branco puro
      [p1, p2, p3].forEach(function(p) {
        if (p) {
          p.style.setProperty("display", "block", "important");
          p.style.setProperty("opacity", "1", "important");
          p.style.setProperty("fill", "#ffffff", "important");
          p.style.setProperty("transform", "none", "important");
        }
      });
      // Oculta estritamente o X quando o menu estiver fechado
      [p4, p5].forEach(function(p) {
        if (p) {
          p.style.setProperty("display", "none", "important");
          p.style.setProperty("opacity", "0", "important");
        }
      });
      [g4, g5].forEach(function(g) {
        if (g) {
          g.style.setProperty("display", "none", "important");
          g.style.setProperty("opacity", "0", "important");
        }
      });
    }
  }

  function openNavSidebar() {
    isNavOpen = true;
    var nav = document.getElementById("nav-sidebar");
    var aside = document.querySelector(".nav-sidebar__aside");
    var shape = document.querySelector(".nav-sidebar__shape");
    var body = document.body;

    if (body) {
      body.classList.add("nav-open");
      body.style.overflow = "hidden";
    }

    if (nav) {
      nav.classList.add("nav-active");
      nav.style.setProperty("display", "block", "important");
      nav.style.setProperty("width", "100vw", "important");
      nav.style.setProperty("height", "100vh", "important");
      nav.style.setProperty("position", "fixed", "important");
      nav.style.setProperty("top", "0", "important");
      nav.style.setProperty("left", "0", "important");
      nav.style.setProperty("right", "0", "important");
      nav.style.setProperty("bottom", "0", "important");
      nav.style.setProperty("z-index", "2147483647", "important");
      nav.style.setProperty("overflow-y", "auto", "important");
      nav.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
      nav.style.setProperty("background", "linear-gradient(135deg, #012dd5 0%, #001f94 100%)", "important");
      nav.style.setProperty("opacity", "1", "important");
      nav.style.setProperty("visibility", "visible", "important");
    }

    if (aside) {
      aside.style.setProperty("display", "block", "important");
      aside.style.setProperty("opacity", "1", "important");
      aside.style.setProperty("visibility", "visible", "important");
      aside.style.setProperty("background", "transparent", "important");
    }

    if (shape) {
      shape.style.setProperty("pointer-events", "none", "important");
      shape.style.setProperty("opacity", "0", "important");
    }

    updateMenuIconState();

    var floatBtn = document.querySelector(".floating-orcamento-btn");
    if (floatBtn) {
      floatBtn.style.setProperty("display", "none", "important");
    }

    var homeBtn = document.querySelector(".nav-sidebar__home");
    if (homeBtn) {
      homeBtn.style.setProperty("display", "block", "important");
      homeBtn.style.setProperty("opacity", "1", "important");
    }

    var btn = document.getElementById("js_nav-sidebar-btn");
    if (btn) {
      btn.style.setProperty("position", "fixed", "important");
      btn.style.setProperty("z-index", "10000001", "important");
      btn.style.setProperty("cursor", "pointer", "important");
      btn.style.setProperty("pointer-events", "auto", "important");
      btn.style.setProperty("opacity", "1", "important");
      btn.style.setProperty("visibility", "visible", "important");
    }
  }

  function closeNavSidebar() {
    isNavOpen = false;
    var nav = document.getElementById("nav-sidebar");
    var aside = document.querySelector(".nav-sidebar__aside");
    var shape = document.querySelector(".nav-sidebar__shape");
    var body = document.body;

    if (body) {
      body.classList.remove("nav-open");
      body.style.overflow = "";
    }

    if (aside) {
      aside.style.setProperty("display", "none", "important");
      aside.style.setProperty("opacity", "0", "important");
      aside.style.setProperty("visibility", "hidden", "important");
    }

    if (nav) {
      nav.classList.remove("nav-active");
      nav.style.setProperty("overflow-y", "visible", "important");
      nav.style.setProperty("background", "transparent", "important");
      nav.style.setProperty("width", "0px", "important");
      nav.style.setProperty("height", "0px", "important");
      nav.style.setProperty("z-index", "10000000", "important");
    }

    if (shape) {
      shape.style.setProperty("pointer-events", "none", "important");
      shape.style.setProperty("opacity", "0.95", "important");
      shape.style.setProperty("z-index", "910", "important");
    }

    updateMenuIconState();

    var floatBtn = document.querySelector(".floating-orcamento-btn");
    if (floatBtn) {
      floatBtn.style.setProperty("display", "flex", "important");
    }

    var homeBtn = document.querySelector(".nav-sidebar__home");
    if (homeBtn) {
      homeBtn.style.setProperty("display", "none", "important");
      homeBtn.style.setProperty("opacity", "0", "important");
    }

    var btn = document.getElementById("js_nav-sidebar-btn");
    if (btn) {
      btn.style.setProperty("position", "fixed", "important");
      btn.style.setProperty("z-index", "10000001", "important");
      btn.style.setProperty("cursor", "pointer", "important");
      btn.style.setProperty("pointer-events", "auto", "important");
      btn.style.setProperty("opacity", "1", "important");
      btn.style.setProperty("visibility", "visible", "important");
    }
  }

  function toggleNavSidebar() {
    if (isNavOpen) {
      closeNavSidebar();
    } else {
      openNavSidebar();
    }
  }

  window.openNavSidebar = openNavSidebar;
  window.closeNavSidebar = closeNavSidebar;
  window.toggleNavSidebar = toggleNavSidebar;
  window.navSidebarOpen = openNavSidebar;
  window.navSidebarClose = closeNavSidebar;

  // Intercept button clicks reliably
  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target) return;

    // Menu button click
    var menuBtn = target.closest("#js_nav-sidebar-btn, .nav-sidebar__btn");
    if (menuBtn) {
      event.preventDefault();
      event.stopPropagation();
      toggleNavSidebar();
      return;
    }

    // Home button inside sidebar
    var homeBtn = target.closest(".nav-sidebar__home");
    if (homeBtn) {
      event.preventDefault();
      closeNavSidebar();
      window.location.href = (window.location.origin + "/maestro-thermas") + "/";
      return;
    }

    // Close when clicking aside overlay backdrop outside content
    if (isNavOpen && target.classList && target.classList.contains("nav-sidebar")) {
      closeNavSidebar();
    }
  }, true);

  // Keyboard accessibility: ESC key to close sidebar
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isNavOpen) {
      closeNavSidebar();
    }
  });

  // Handle scroll header state (adds/removes body.is-scrolled)
  function handleScrollHeaderState() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (scrollY > 30) {
      if (!document.body.classList.contains("is-scrolled")) {
        document.body.classList.add("is-scrolled");
      }
    } else {
      if (document.body.classList.contains("is-scrolled")) {
        document.body.classList.remove("is-scrolled");
      }
    }
  }

  // Ensure clean overlays on scroll and resize
  function cleanNavSidebarOverlays() {
    handleScrollHeaderState();
    // Remove unwanted elements
    document.querySelectorAll(
      ".nav-sidebar__ticket, .nav-sidebar__ticket-mobile, .shadow-horizon, .header-app__social-media, .aside-social, .aside-social-vertical, .footer-social-row, .footer-social-btn, .footer-social, a[href*='instagram.com'], a[href*='facebook.com'], a[href*='tiktok.com'], a[href*='youtube.com']"
    ).forEach(function(el) { el.remove(); });

    document.querySelectorAll(".nav-sidebar__shape").forEach(function(el) {
      if (!isNavOpen) {
        el.style.pointerEvents = "none";
        el.style.zIndex = "910";
      }
    });

    var nav = document.getElementById("nav-sidebar");
    if (nav && !isNavOpen) {
      nav.style.zIndex = "10000000";
    }

    var btn = document.getElementById("js_nav-sidebar-btn");
    if (btn) {
      btn.style.zIndex = "10000001";
      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      btn.style.visibility = "visible";
    }

    updateMenuIconState();
  }

  window.addEventListener("scroll", cleanNavSidebarOverlays, { passive: true });
  window.addEventListener("resize", cleanNavSidebarOverlays, { passive: true });

  // Auto-scroll on initial load if hash is #enjoy-booking-section
  function checkHashBooking() {
    if (window.location.hash === "#enjoy-booking-section") {
      setTimeout(function () {
        smoothScrollToBooking();
      }, 400);
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setupPopupBehavior();
      setupCookieBanner();
      cleanNavSidebarOverlays();
      checkHashBooking();
    });
  } else {
    setupPopupBehavior();
    setupCookieBanner();
    cleanNavSidebarOverlays();
    checkHashBooking();
  }
})();


  // Garantir que o botão flutuante fique SEMPRE no nível raiz de <body> e acima de qualquer elemento
  function hoistFloatingButton() {
    try {
      var btn = document.querySelector('.floating-orcamento-btn');
      if (btn && btn.parentElement !== document.body) {
        document.body.appendChild(btn);
      }
      if (btn) {
        btn.style.setProperty('position', 'fixed', 'important');
        btn.style.setProperty('z-index', '2147483647', 'important');
        btn.style.setProperty('pointer-events', 'auto', 'important');
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hoistFloatingButton);
  } else {
    hoistFloatingButton();
  }
  window.addEventListener('load', hoistFloatingButton);
  window.addEventListener('scroll', hoistFloatingButton, { passive: true });
  window.addEventListener('resize', hoistFloatingButton);


  // Enhanced Anchor Navigation for Menu and Footer Links
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute('href');
    if (!hash || hash === '#' || hash === '#!') return;

    var targetEl = document.querySelector(hash);
    if (!targetEl) return;

    e.preventDefault();

    // Close menu sidebar if open
    if (typeof closeNavSidebar === 'function') {
      closeNavSidebar();
    }

    // Calculate position with offset for fixed header
    var headerOffset = 70;
    var rect = targetEl.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var targetY = Math.max(0, rect.top + scrollTop - headerOffset);

    try {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } catch (_) {
      window.scrollTo(0, targetY);
    }

    // Update browser URL hash without jump
    if (history.pushState) {
      history.pushState(null, null, hash);
    }

    // Special handlers for specific anchors
    if (hash === '#como-chegar') {
      setTimeout(function () {
        var faqBtn = document.querySelector('#faq-maestro button[aria-controls*="collapse"]');
        var comoBtn = Array.from(document.querySelectorAll('#faq-maestro button')).find(b => b.textContent.includes('Curitiba') || b.textContent.includes('aeroporto'));
        if (comoBtn && comoBtn.getAttribute('aria-expanded') !== 'true') {
          comoBtn.click();
        }
      }, 500);
    }

    if (hash === '#sobre-nos') {
      setTimeout(function () {
        var sobreBtn = Array.from(document.querySelectorAll('#faq-maestro button')).find(b => b.textContent.includes('Onde fica') || b.textContent.includes('antigo Anila'));
        if (sobreBtn && sobreBtn.getAttribute('aria-expanded') !== 'true') {
          sobreBtn.click();
        }
      }, 500);
    }
  }, true);
