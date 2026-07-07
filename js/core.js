const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const serviceBar = document.querySelector('.service-bar');
const siteRootUrl = new URL('../', document.currentScript?.src || window.location.href);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sitePreloader = document.querySelector('.site-preloader');

/* Replace printed pages with a concise brand and copyright notice. */
const printProtection = document.createElement('section');
printProtection.className = 'print-protection';
printProtection.setAttribute('aria-hidden', 'true');
printProtection.innerHTML = `
  <img src="${new URL('assets/images/logo.webp', siteRootUrl).href}" alt="B2B Industrial Solutions">
  <h1>B2B Industrial Solutions</h1>
  <p>Printing or reproducing this website is strictly prohibited.</p>
  <small>For authorised documents, use the contact form.</small>`;
document.body.appendChild(printProtection);

/* Keep page text selectable while preventing it from being copied to the clipboard. */
const isEditableTarget = (target) => target instanceof Element && Boolean(target.closest('input, textarea, [contenteditable="true"]'));
let copyNoticeTimer;
const showCopyNotice = () => {
  let notice = document.querySelector('.copy-protection-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'copy-protection-notice';
    notice.setAttribute('role', 'status');
    notice.textContent = 'Website content can be selected but not copied.';
    document.body.appendChild(notice);
  }
  notice.classList.add('visible');
  clearTimeout(copyNoticeTimer);
  copyNoticeTimer = setTimeout(() => notice.classList.remove('visible'), 1800);
};
['copy', 'cut'].forEach((eventName) => {
  document.addEventListener(eventName, (event) => {
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    event.clipboardData?.setData('text/plain', '');
    showCopyNotice();
  });
});

if (sitePreloader) {
  const finishLoading = () => {
    sitePreloader.classList.add('preloader-hidden');
    sitePreloader.setAttribute('aria-hidden', 'true');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sitePreloader.remove();
    } else {
      sitePreloader.addEventListener('transitionend', () => sitePreloader.remove(), { once: true });
    }
  };
  if (document.readyState === 'complete') requestAnimationFrame(finishLoading);
  else window.addEventListener('load', finishLoading, { once: true });
}

if (navigation && serviceBar) {
  const servicesTrigger = [...navigation.querySelectorAll('a')].find((link) => /service\.html(?:$|[?#])/.test(link.getAttribute('href') || ''));

  if (servicesTrigger) {
    const prefix = servicesTrigger.getAttribute('href').replace(/service\.html.*$/, '');
    servicesTrigger.textContent = 'Services';
    servicesTrigger.classList.add('services-trigger');
    servicesTrigger.setAttribute('aria-haspopup', 'true');
    servicesTrigger.setAttribute('aria-expanded', 'false');
    servicesTrigger.setAttribute('aria-controls', 'services-mega-menu');
    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'services-trigger-icon';
    triggerIcon.setAttribute('aria-hidden', 'true');
    triggerIcon.innerHTML = '<svg viewBox="0 0 20 20" focusable="false"><path d="m5.5 7.5 4.5 4.5 4.5-4.5"/></svg>';
    servicesTrigger.appendChild(triggerIcon);

    const megaMenu = document.createElement('div');
    megaMenu.className = 'services-mega';
    megaMenu.id = 'services-mega-menu';
    megaMenu.setAttribute('aria-label', 'Services menu');
    megaMenu.innerHTML = `
      <div class="shell services-mega-inner">
        <div class="mega-primary">
          <span class="mega-kicker">Integrated industrial solutions</span>
          <strong>From audit findings to engineered outcomes.</strong>
          <p>One accountable partner for compliance, safety, energy performance, and turnkey project delivery across India.</p>
          <a href="${prefix}service.html">Explore all 80+ services <span aria-hidden="true">→</span></a>
        </div>
        <div class="mega-column">
          <b>Audits &amp; compliance</b>
          <a href="${prefix}services/energy-audits.html">Energy audits</a>
          <a href="${prefix}services/electrical-safety-audit.html">Electrical safety</a>
          <a href="${prefix}services/fire-life-safety.html">Fire &amp; HSE audits</a>
          <a href="${prefix}services/environment-compliances.html">Environment compliance</a>
          <a class="mega-all" href="${prefix}services/compliances.html">View compliance services →</a>
        </div>
        <div class="mega-column">
          <b>Engineering projects</b>
          <a href="${prefix}services/electrical-projects.html">Electrical projects</a>
          <a href="${prefix}services/hvac-projects.html">HVAC &amp; duct cleaning</a>
          <a href="${prefix}services/fire-projects.html">Fire protection projects</a>
          <a href="${prefix}services/lighting-projects.html">Lighting projects</a>
          <a class="mega-all" href="${prefix}services/project-management.html">Project management →</a>
        </div>
        <div class="mega-column">
          <b>Emission &amp; sustainability</b>
          <a href="${prefix}services/recd-kit.html">RECD &amp; DFK kits</a>
          <a href="${prefix}services/emission-control.html">Emission control</a>
          <a href="${prefix}services/carbon-footprint.html">Carbon footprint</a>
          <a href="${prefix}services/renewable-energy.html">Renewable energy</a>
          <a class="mega-all" href="${prefix}contact.html">Discuss your requirement →</a>
        </div>
      </div>`;
    servicesTrigger.insertAdjacentElement('afterend', megaMenu);

    const backdrop = document.createElement('div');
    backdrop.className = 'mega-backdrop';
    document.body.appendChild(backdrop);

    let closeTimer;
    const setMegaMenu = (open) => {
      clearTimeout(closeTimer);
      serviceBar.classList.toggle('mega-open', open);
      document.body.classList.toggle('mega-menu-open', open && window.innerWidth > 820);
      servicesTrigger.setAttribute('aria-expanded', String(open));
    };
    const scheduleClose = () => { closeTimer = setTimeout(() => setMegaMenu(false), 120); };

    servicesTrigger.addEventListener('mouseenter', () => setMegaMenu(true));
    serviceBar.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    serviceBar.addEventListener('mouseleave', scheduleClose);
    servicesTrigger.addEventListener('focus', () => setMegaMenu(true));
    serviceBar.addEventListener('focusout', (event) => {
      if (!serviceBar.contains(event.relatedTarget)) scheduleClose();
    });
    servicesTrigger.addEventListener('click', (event) => {
      if (window.innerWidth <= 820) return;
      event.preventDefault();
      setMegaMenu(!serviceBar.classList.contains('mega-open'));
    });
    backdrop.addEventListener('click', () => setMegaMenu(false));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMegaMenu(false); });
    const closeMegaOnViewportMove = () => {
      if (serviceBar.classList.contains('mega-open')) setMegaMenu(false);
    };
    window.addEventListener('scroll', closeMegaOnViewportMove, { passive: true });
    window.addEventListener('wheel', closeMegaOnViewportMove, { passive: true });
    window.addEventListener('touchmove', closeMegaOnViewportMove, { passive: true });
    window.addEventListener('resize', () => setMegaMenu(false));
  }
}

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.classList.remove('active');
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open', 'mega-menu-open');
    serviceBar?.classList.remove('mega-open');
    navigation.querySelector('.services-trigger')?.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.classList.toggle('active');
    navigation.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  navigation.querySelectorAll('a:not(.services-trigger)').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
}

// Turn wide comparison tables into labelled, scan-friendly cards on phones.
document.querySelectorAll('table.service-table').forEach((table) => {
  const labels = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent.trim());
  if (!labels.length) return;
  table.querySelectorAll('tbody tr').forEach((row) => {
    [...row.cells].forEach((cell, index) => {
      cell.dataset.label = labels[index] || `Detail ${index + 1}`;
    });
  });
});

// Third-party maps load only after an explicit request, avoiding blocker errors on page load.
document.querySelectorAll('[data-map-load]').forEach((button) => {
  button.addEventListener('click', () => {
    const map = button.closest('.modern-map-container')?.querySelector('iframe[data-map-src]');
    if (!map) return;
    map.src = map.dataset.mapSrc;
    map.hidden = false;
    button.hidden = true;
  }, { once: true });
});

document.querySelectorAll('[data-current-year], #copyright-year, #year').forEach((node) => { node.textContent = new Date().getFullYear(); });

const serviceGroups = document.querySelectorAll('.service-directory .service-group');
const animateServiceGroup = (group, open) => {
  const content = group.querySelector('.service-link-grid');
  if (!content || prefersReducedMotion) {
    group.open = open;
    return;
  }

  group.dataset.animating = 'true';
  if (open) {
    group.open = true;
    content.style.height = '0px';
    content.style.opacity = '0';
    content.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      content.style.height = `${content.scrollHeight}px`;
      content.style.opacity = '1';
    });
  } else {
    group.dataset.closing = 'true';
    content.style.height = `${content.scrollHeight}px`;
    content.style.opacity = '1';
    content.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      content.style.height = '0px';
      content.style.opacity = '0';
    });
  }

  content.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'height') return;
    if (!open) group.open = false;
    delete group.dataset.animating;
    delete group.dataset.closing;
    content.style.height = '';
    content.style.opacity = '';
    content.style.overflow = '';
  }, { once: true });
};

serviceGroups.forEach((group) => {
  group.querySelector('summary')?.addEventListener('click', (event) => {
    event.preventDefault();
    const shouldOpen = !group.open;
    serviceGroups.forEach((otherGroup) => {
      if (otherGroup !== group && otherGroup.open) animateServiceGroup(otherGroup, false);
    });
    animateServiceGroup(group, shouldOpen);
  });
});

/* Preserve the page that sent a successful enquiry, even across Web3Forms' redirect. */
const formReturnStorageKey = 'b2b-form-return';
const getPageLabel = () => {
  const heading = document.querySelector('main h1');
  return (heading?.textContent || document.title.split('|')[0] || 'previous page').trim().replace(/\s+/g, ' ').slice(0, 70);
};

document.querySelectorAll('form[action*="api.web3forms.com/submit"]').forEach((form) => {
  const source = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const label = getPageLabel();
  const redirect = form.querySelector('input[name="redirect"]');
  if (redirect?.value) {
    try {
      const destination = new URL(redirect.value, window.location.href);
      destination.searchParams.set('from', source);
      destination.searchParams.set('label', label);
      redirect.value = destination.href;
    } catch (_) { /* Keep the original provider redirect if it is malformed. */ }
  }
  form.addEventListener('submit', () => {
    try { sessionStorage.setItem(formReturnStorageKey, JSON.stringify({ url: source, label })); } catch (_) { /* Storage may be disabled. */ }
  });
});

const formReturnButton = document.querySelector('[data-form-return]');
if (formReturnButton) {
  let storedReturn = null;
  try { storedReturn = JSON.parse(sessionStorage.getItem(formReturnStorageKey) || 'null'); } catch (_) { /* Use URL fallback. */ }
  const params = new URLSearchParams(window.location.search);
  const returnPath = params.get('from') || storedReturn?.url;
  const returnLabel = params.get('label') || storedReturn?.label;
  if (returnPath) {
    try {
      const target = new URL(returnPath, window.location.origin);
      const isSafeLocalPage = target.origin === window.location.origin && !target.pathname.endsWith('/success.html');
      if (isSafeLocalPage) {
        formReturnButton.href = `${target.pathname}${target.search}${target.hash}`;
        const labelNode = formReturnButton.querySelector('[data-form-return-label]');
        if (labelNode && returnLabel) labelNode.textContent = `Return to ${String(returnLabel).trim().slice(0, 50)}`;
      }
    } catch (_) { /* Keep the contact-page fallback. */ }
  }
}

document.querySelectorAll('.u-email-link[data-user][data-domain]').forEach((link) => {
  const address = `${link.dataset.user}@${link.dataset.domain}`;
  link.href = `mailto:${address}`;
  link.setAttribute('aria-label', 'Email B2B Industrial Solutions');
});

document.querySelectorAll('img').forEach((image) => {
  image.draggable = false;
  if (!image.hasAttribute('loading') && !image.closest('.page-header, .blog-post-hero, .client-hero')) image.loading = 'lazy';
});

document.querySelectorAll('main img, main iframe').forEach((media) => {
  if (media instanceof HTMLImageElement && media.fetchPriority === 'high') return;
  media.classList.add('skeleton-media');
  const finishMedia = () => media.classList.add('media-ready');
  if (media.tagName === 'IMG' && media.complete && media.naturalWidth) finishMedia();
  else media.addEventListener('load', finishMedia, { once: true });
  media.addEventListener('error', finishMedia, { once: true });
});

const startSmoothScrolling = () => {
  if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
  const activate = () => {
    if (typeof Lenis === 'undefined' || window.siteLenis) return;
    window.siteLenis = new Lenis({ duration: .85, smoothWheel: true, syncTouch: false });
    const frame = (time) => {
      window.siteLenis?.raf(time);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (typeof Lenis !== 'undefined') activate();
  else {
    const script = document.createElement('script');
    script.src = new URL('assets/js/lenis.min.js', siteRootUrl).href;
    script.onload = activate;
    document.head.appendChild(script);
  }
};

if (document.readyState === 'complete') startSmoothScrolling();
else window.addEventListener('load', startSmoothScrolling, { once: true });

/* Minimal scroll reveal shared by every page. */
const revealTargets = [
  ...document.querySelectorAll('.reveal'),
  ...document.querySelectorAll('.legacy-content > section:not(:first-child), main > section:not(:first-child)'),
  ...document.querySelectorAll('.blog-card, .catalog-card, .service-card, .result-card'),
];

document.querySelectorAll('.legacy-content > .page-header').forEach((hero, index) => {
  const nextSection = hero.nextElementSibling;
  if (!nextSection || hero.querySelector('.hero-scroll-cue')) return;
  const cue = document.createElement('button');
  cue.className = 'hero-scroll-cue';
  cue.type = 'button';
  cue.setAttribute('aria-label', 'Continue to page content');
  cue.innerHTML = '<span aria-hidden="true"></span>';
  cue.addEventListener('click', () => nextSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' }));
  cue.style.setProperty('--cue-delay', `${index * 40}ms`);
  hero.appendChild(cue);
});

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });

  [...new Set(revealTargets)].forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--reveal-delay', `${(index % 3) * 35}ms`);
    revealObserver.observe(element);
  });
} else {
  revealTargets.forEach((element) => element.classList.add('visible'));
}

/* Whole-site Ctrl/Cmd+K command palette. The full index loads only on demand. */
const commandHost = document.querySelector('.global-bar-inner');
if (commandHost) {
  const palette = document.createElement('div');
  palette.className = 'command-palette';
  palette.setAttribute('aria-hidden', 'true');
  palette.innerHTML = `
    <button class="command-scrim" type="button" aria-label="Close search"></button>
    <section class="command-panel" role="dialog" aria-modal="true" aria-label="Search the whole website">
      <div class="command-input-wrap">
        <span aria-hidden="true">⌕</span>
        <input class="command-input" id="command-palette-search" name="site-search" type="search" autocomplete="off" spellcheck="false" placeholder="Search services, pages, blogs and tools…" aria-label="Search website">
        <kbd>Esc</kbd>
      </div>
      <div class="command-status">Quick links</div>
      <div class="command-results" role="listbox"></div>
      <div class="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
    </section>`;
  document.body.appendChild(palette);

  const commandInput = palette.querySelector('.command-input');
  const commandResults = palette.querySelector('.command-results');
  const commandStatus = palette.querySelector('.command-status');
  const quickLinks = [
    { title: 'Home', url: '/index', tags: 'homepage overview' },
    { title: 'All Services', url: '/service', tags: 'services directory' },
    { title: 'About B2B Industrial Solutions', url: '/about', tags: 'company' },
    { title: 'Industrial Insights', url: '/blog/', tags: 'blogs articles' },
    { title: 'Case Studies', url: '/case-studies/cement-plant-energy-audit', tags: 'results projects' },
    { title: 'Engineering Tools', url: '/tools/', tags: 'calculators' },
    { title: 'Contact Us', url: '/contact', tags: 'quote site visit' },
  ];
  let commandData = [];
  let commandIndexLoaded = false;
  let commandIndexLoading = false;
  let activeResult = 0;
  let lastFocusedElement = null;

  const decodeText = (value) => {
    const textArea = document.createElement('textarea');
    textArea.name = 'clipboard-copy-buffer';
    textArea.setAttribute('aria-hidden', 'true');
    textArea.innerHTML = value || '';
    return textArea.value;
  };

  const resolvePageUrl = (rawUrl) => {
    const clean = String(rawUrl || '/').replace(/^\/+/, '');
    if (!clean || clean === 'index') return new URL('index.html', siteRootUrl).href;
    if (clean.endsWith('/')) return new URL(`${clean}index.html`, siteRootUrl).href;
    if (/\.[a-z0-9]+$/i.test(clean)) return new URL(clean, siteRootUrl).href;
    return new URL(`${clean}.html`, siteRootUrl).href;
  };

  const sectionLabel = (url) => {
    if (url.includes('/services/')) return 'Service';
    if (url.includes('/blog/')) return 'Insight';
    if (url.includes('/locations/')) return 'Location';
    if (url.includes('/tools/')) return 'Tool';
    if (url.includes('/case-studies/')) return 'Case study';
    return 'Page';
  };

  const setActiveResult = (nextIndex) => {
    const results = [...commandResults.querySelectorAll('.command-result')];
    if (!results.length) return;
    activeResult = (nextIndex + results.length) % results.length;
    results.forEach((result, index) => {
      const active = index === activeResult;
      result.classList.toggle('active', active);
      result.setAttribute('aria-selected', String(active));
      if (active) commandInput.setAttribute('aria-activedescendant', result.id);
    });
    results[activeResult].scrollIntoView({ block: 'nearest' });
  };

  const renderResults = (items, label) => {
    commandResults.replaceChildren();
    commandStatus.textContent = label;
    activeResult = 0;

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'command-empty';
      empty.textContent = 'No matching page found. Try a service, topic, or location.';
      commandResults.appendChild(empty);
      return;
    }

    items.slice(0, 4).forEach((item, index) => {
      const link = document.createElement('a');
      link.className = `command-result${index === 0 ? ' active' : ''}`;
      link.id = `command-result-${index}`;
      link.href = resolvePageUrl(item.url);
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', String(index === 0));

      const copy = document.createElement('span');
      const title = document.createElement('b');
      const meta = document.createElement('small');
      title.textContent = decodeText(item.title).replace(/\s*[-|]\s*B2B Industrial Solutions.*$/i, '');
      meta.textContent = sectionLabel(item.url);
      copy.append(title, meta);

      const arrow = document.createElement('span');
      arrow.className = 'command-arrow';
      arrow.textContent = '↗';
      link.append(copy, arrow);
      link.addEventListener('mouseenter', () => setActiveResult(index));
      commandResults.appendChild(link);
    });
  };

  const searchCommands = () => {
    const query = commandInput.value.trim().toLowerCase();
    if (!query) {
      renderResults(quickLinks, 'Quick links');
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const ranked = commandData
      .map((item) => {
        const title = decodeText(item.title).toLowerCase();
        const tags = decodeText(item.tags).toLowerCase();
        const text = decodeText(item.text).toLowerCase();
        if (!terms.every((term) => title.includes(term) || tags.includes(term) || text.includes(term))) return null;
        let score = 0;
        terms.forEach((term) => {
          if (title.startsWith(term)) score += 12;
          else if (title.includes(term)) score += 8;
          if (tags.includes(term)) score += 4;
          if (text.includes(term)) score += 1;
        });
        return { item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
    renderResults(ranked, `${Math.min(ranked.length, 4)} best matches`);
  };

  const loadCommandIndex = () => {
    if (commandIndexLoaded || commandIndexLoading) return;
    commandIndexLoading = true;
    commandStatus.textContent = 'Loading site index…';
    const script = document.createElement('script');
    script.src = new URL('assets/js/search-data.min.js', siteRootUrl).href;
    script.onload = () => {
      commandData = typeof SEARCH_DATA === 'undefined' ? quickLinks : SEARCH_DATA;
      commandIndexLoaded = true;
      commandIndexLoading = false;
      searchCommands();
    };
    script.onerror = () => {
      commandData = quickLinks;
      commandIndexLoaded = true;
      commandIndexLoading = false;
      searchCommands();
    };
    document.head.appendChild(script);
  };

  const openCommandPalette = () => {
    lastFocusedElement = document.activeElement;
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    document.body.classList.add('command-open');
    window.siteLenis?.stop();
    commandInput.value = '';
    renderResults(quickLinks, 'Quick links');
    loadCommandIndex();
    commandInput.focus({ preventScroll: true });
    requestAnimationFrame(() => commandInput.focus({ preventScroll: true }));
  };

  const closeCommandPalette = () => {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('command-open');
    window.siteLenis?.start();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  palette.querySelector('.command-scrim').addEventListener('click', closeCommandPalette);
  commandInput.addEventListener('input', searchCommands);

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (palette.classList.contains('open')) closeCommandPalette();
      else openCommandPalette();
    } else if (palette.classList.contains('open') && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResult(activeResult + 1);
    } else if (palette.classList.contains('open') && event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult(activeResult - 1);
    } else if (palette.classList.contains('open') && event.key === 'Enter') {
      const active = commandResults.querySelector('.command-result.active');
      if (active) {
        event.preventDefault();
        window.location.href = active.href;
      }
    } else if (event.key === 'Escape' && palette.classList.contains('open')) closeCommandPalette();
  });

  const initialCommandQuery = new URLSearchParams(window.location.search).get('q');
  if (initialCommandQuery) {
    openCommandPalette();
    commandInput.value = initialCommandQuery;
    searchCommands();
  }
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.min.js', siteRootUrl), { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => {});
  }, { once: true });
}
