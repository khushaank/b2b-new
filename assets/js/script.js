(() => {
  "use strict";

  let e = "b2b_preloader_seen_v5",
    t = !1,
    l = 0,
    s = null,
    r = null,
    a = null;

  const o = () => {
    try {
      return "1" === window.localStorage.getItem(e);
    } catch (t) {
      return !1;
    }
  };

  const i = () => {
    try {
      window.localStorage.setItem(e, "1");
    } catch (t) { }
  };

  const n = () => {
    if (a) return a;

    let existing = document.getElementById("site-preloader");
    if (existing) {
      existing.classList.add("glass-preloader");
      return (a = existing);
    }

    if (!document.body) return null;

    a = document.createElement("div");
    a.id = "site-preloader";
    a.className = "glass-preloader";
    a.setAttribute("role", "status");
    a.setAttribute("aria-live", "polite");
    a.setAttribute("aria-label", "Loading page");
    a.innerHTML = `
  <div class="preloader-content">
    <div class="preloader-logo">
      <img src="/images/logo.webp" alt="B2B Industrial Solutions">
    </div>
    <div class="preloader-bar">
      <div class="preloader-progress"></div>
    </div>
    <span class="preloader-text">Excellence in Engineering</span>
  </div>
  `;
    document.body.appendChild(a);
    return a;
  };

  const c = () => {
    let bar = a?.querySelector(".preloader-progress");
    if (bar) {
      bar.style.animation = "none";
      bar.offsetWidth;
      bar.style.animation = "";
    }
  };

  const d = () => {
    let preloader = n();
    if (preloader && !t) {
      t = !0;
      l = performance.now();
      preloader.classList.remove("preloader-done");
      document.body.classList.add("is-preloading");

      const main = document.querySelector('main');
      if (main) {
        main.style.opacity = '0';
        main.style.filter = 'blur(10px)';
        main.style.transition = 'none';
      }

      c();
    }
  };

  const v = () => {
    if (!t || !a) return;

    let elapsed = performance.now() - l;
    let remaining = Math.max(0, 4000 - elapsed);

    window.setTimeout(() => {
      if (a) {
        a.classList.add("preloader-done");
        document.body.classList.remove("is-preloading");

        const main = document.querySelector('main');
        if (main) {
          main.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), filter 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
          main.style.opacity = '1';
          main.style.filter = 'blur(0)';
        }

        window.setTimeout(() => {
          a?.remove();
          a = null;
          t = !1;
        }, 600);
      }
    }, remaining);
  };

  window.globalShowPreloader = d;

  if (o()) {
    document.body.classList.remove("is-preloading");
    let u = document.getElementById("site-preloader");
    u && u.remove();
  } else {
    d();

    window.addEventListener(
      "load",
      () => {
        s && window.clearTimeout(s);
        r && window.clearTimeout(r);
        i();
        v();
      },
      { once: !0 }
    );

    r = window.setTimeout(() => {
      i();
      v();
    }, 12000);
  }

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      document.body.classList.remove("is-preloading");
      if (a) {
        a.remove();
        a = null;
        t = !1;
      }
    }
  });
})();

// ================================================
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  let e = document.querySelector(".mobile-nav-toggle"),
    t = document.querySelector(".main-nav"),
    l = document.querySelector(".nav-overlay");

  if (t && e) {
    let s = () => {
      t.querySelectorAll(".slide-active").forEach((el) => el.classList.remove("slide-active"));
    };

    let r = (el) => el?.parentElement?.closest(".dropdown-menu, .submenu");

    let a = (el) => {
      if (!el) return;
      s();
      let current = el;
      while (current) {
        if (current.classList.contains("dropdown-menu") || current.classList.contains("submenu")) {
          current.classList.add("slide-active");
        }
        current = r(current);
      }
    };

    let o = () => {
      t.classList.remove("active");
      e.classList.remove("active");
      document.body.classList.remove("nav-open");
      document.body.style.overflow = "";
      s();
    };

    e.addEventListener("click", () => {
      if (t.classList.contains("active")) {
        o();
      } else {
        t.classList.add("active");
        e.classList.add("active");
        document.body.classList.add("nav-open");
        document.body.style.overflow = "hidden";
      }
    });

    if (l) l.addEventListener("click", o);

    t.querySelectorAll(".dropdown-menu, .submenu").forEach((menu) => {
      let backBtn = document.createElement("li");
      backBtn.className = "mobile-back-btn";
      backBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back';
      backBtn.onclick = (evt) => {
        evt.stopPropagation();
        a(r(menu));
      };
      menu.insertBefore(backBtn, menu.firstChild);
    });

    t.querySelectorAll(".nav-links a").forEach((link) => {
      let submenu = link.nextElementSibling;
      let hasSubmenu = submenu && (submenu.classList.contains("dropdown-menu") || submenu.classList.contains("submenu"));

      if (hasSubmenu) {
        link.addEventListener("click", (evt) => {
          if (window.innerWidth <= 1024) {
            evt.preventDefault();
            evt.stopPropagation();
            a(submenu);
          }
        });
      } else {
        link.addEventListener("click", o);
      }
    });

    if (t) {
      let menuStartX = 0;
      t.addEventListener("touchstart", (e) => {
        menuStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      t.addEventListener("touchend", (e) => {
        let menuEndX = e.changedTouches[0].screenX;
        if (t.classList.contains("active") && (menuStartX - menuEndX > 50)) {
          o();
        }
      }, { passive: true });
    }
  }


  let searchToggles = document.querySelectorAll(".search-toggle, .search-toggle-mobile"),
    n = document.querySelector(".search-bar"),
    c = document.getElementById("siteSearch");

  if (searchToggles.length > 0 && n) {
    searchToggles.forEach(toggle => {
      toggle.addEventListener("click", (evt) => {
        evt.preventDefault();
        n.classList.add("active");
        if (c) c.focus();
        let mobileNavToggle = document.querySelector(".mobile-nav-toggle");
        if (document.body.classList.contains("nav-open") && mobileNavToggle) {
          mobileNavToggle.click(); // Close mobile menu if open
        }
      });
    });

    let searchClose = document.querySelector(".search-close");
    if (searchClose) {
      searchClose.addEventListener("click", () => n.classList.remove("active"));
    }

    let searchStartY = 0;
    n.addEventListener("touchstart", (e) => {
      searchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    n.addEventListener("touchend", (e) => {
      let searchEndY = e.changedTouches[0].screenY;
      if (n.classList.contains("active") && (searchStartY - searchEndY > 50)) {
        n.classList.remove("active");
      }
    }, { passive: true });

    document.addEventListener("keydown", (evt) => {
      if (evt.key === "Escape" && n.classList.contains("active")) {
        n.classList.remove("active");
      }
    });

    // Clickable search icon button — focus input and trigger search
    const searchIconBtn = document.getElementById("searchSubmitBtn");
    if (searchIconBtn) {
      searchIconBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        const input = document.getElementById("siteSearch");
        if (input) {
          input.focus();
          // Dispatch an input event to trigger any live search listener
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    }
  }



  let u = document.querySelectorAll(".faq-item");
  u.forEach((item) => {
    let question = item.querySelector(".faq-question") || item.querySelector("h3") || item.querySelector("h4");
    if (question) {
      question.addEventListener("click", () => {
        let wasActive = item.classList.contains("active");
        u.forEach((faq) => faq.classList.remove("active"));
        if (!wasActive) item.classList.add("active");
      });
    }
  });

  let m = document.getElementById("backToTop");
  if (m) {
    window.addEventListener("scroll", () => {
      m.style.display = window.scrollY > 500 ? "block" : "none";
    });
    m.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const header = document.querySelector(".site-header");
  if (header) {
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;

      if (currentScroll > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      if (currentScroll > lastScroll && currentScroll > 150) {
        header.classList.add("header-hidden");
        if (window.headerHideTimeout) clearTimeout(window.headerHideTimeout);
      } else if (currentScroll < lastScroll) {
        header.classList.remove("header-hidden");
        if (window.headerHideTimeout) clearTimeout(window.headerHideTimeout);
        if (currentScroll > 150) {
          window.headerHideTimeout = setTimeout(() => {
            if (window.scrollY > 150 && !document.body.classList.contains("nav-open")) {
              header.classList.add("header-hidden");
            }
          }, 3000);
        }
      }

      lastScroll = currentScroll;
    });
  }

  let y = document.getElementById("founderModal"),
    L = document.getElementById("founderImage"),
    p = document.querySelector(".close-founder");

  const openFounderModal = () => {
    if (!y) return;
    y.classList.add("active");
    document.body.style.overflow = "hidden";
    if (window.location.hash !== '#founder') {
      window.location.hash = 'founder';
    }
  };

  const closeFounderModal = () => {
    if (!y) return;
    y.classList.remove("active");
    document.body.style.overflow = "";
    if (window.location.hash === '#founder') {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  if (L && y) {
    L.style.cursor = "pointer";
    L.addEventListener("click", openFounderModal);
  }

  if (p && y) p.addEventListener("click", closeFounderModal);

  if (y) {
    // Esc key to close
    document.addEventListener("keydown", (evt) => {
      if (evt.key === "Escape" && y.classList.contains("active")) closeFounderModal();
    });
    
    // Swipe to close
    let modalStartY = 0;
    y.addEventListener("touchstart", (e) => { modalStartY = e.changedTouches[0].screenY; }, { passive: true });
    y.addEventListener("touchend", (e) => {
      if (y.classList.contains("active") && (e.changedTouches[0].screenY - modalStartY > 80)) closeFounderModal();
    }, { passive: true });
  }

  // Handle browser back button (hashchange)
  window.addEventListener('hashchange', () => {
    if (window.location.hash !== '#founder') {
      if (y && y.classList.contains("active")) {
        y.classList.remove("active");
        document.body.style.overflow = "";
      }
    } else {
      openFounderModal();
    }
  });

  // Open from URL hash on load
  if (window.location.hash === '#founder' && y) openFounderModal();

  let b = document.querySelectorAll(".counter");
  b.forEach((counter) => {
    let target = Number(counter.getAttribute("data-target") || counter.textContent.trim());
    if (!target || Number.isNaN(target)) return;

    let increment = Math.max(1, Math.ceil(target / (1400 / 30)));
    let count = 0;
    let formatter = (num) => `${num}+`;

    let interval = setInterval(() => {
      count += increment;
      if (count >= target) {
        counter.textContent = formatter(target);
        clearInterval(interval);
      } else {
        counter.textContent = formatter(count);
      }
    }, 30);
  });
});

(function () {
  const initFaq = () => {
    const accordion = document.querySelector('.b2b-faq-accordion');
    if (!accordion) return;
    accordion.addEventListener('click', function (e) {
      const question = e.target.closest('.b2b-faq-question');
      if (!question) return;

      const item = question.closest('.b2b-faq-item');
      if (!item) return;

      const isOpen = item.classList.contains('is-open');

      accordion.querySelectorAll('.b2b-faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
      } else {
        item.classList.add('is-open');
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();

(function () {
  "use strict";
  const restoreEmails = () => {
    document.querySelectorAll('.u-email').forEach(el => {
      const user = el.getAttribute('data-user');
      const domain = el.getAttribute('data-domain');
      if (user && domain) {
        el.textContent = 'Email us';
        el.classList.add('is-restored');
      }
    });

    document.querySelectorAll('.u-email-link').forEach(el => {
      const user = el.getAttribute('data-user');
      const domain = el.getAttribute('data-domain');
      if (user && domain) {
        const email = `${user}@${domain}`;
        el.setAttribute('href', `mailto:${email}`);
        el.setAttribute('aria-label', 'Email B2B Industrial Solutions');

        if (el.textContent.includes('[at]') || el.textContent.trim() === '') {
          el.textContent = 'Email us';
        }
        el.classList.add('is-restored');
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreEmails);
  } else {
    restoreEmails();
  }
})();

(function () {
  const initMarquee = () => {
    const tracks = document.querySelectorAll('.home-marquee-track, .marquee-track');
    tracks.forEach(track => {
      if (track && !track.dataset.cloned) {
        const content = track.innerHTML;
        track.innerHTML = content + content;
        track.dataset.cloned = "true";
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
  } else {
    initMarquee();
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.b2b-faq-question, .faq-item h3').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
});
