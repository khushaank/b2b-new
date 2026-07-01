const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const serviceBar = document.querySelector('.service-bar');

if (navigation && serviceBar) {
  const servicesTrigger = [...navigation.querySelectorAll('a')].find((link) => /service\.html(?:$|[?#])/.test(link.getAttribute('href') || ''));

  if (servicesTrigger) {
    const prefix = servicesTrigger.getAttribute('href').replace(/service\.html.*$/, '');
    servicesTrigger.textContent = 'Services';
    servicesTrigger.classList.add('services-trigger');
    servicesTrigger.setAttribute('aria-haspopup', 'true');
    servicesTrigger.setAttribute('aria-expanded', 'false');

    const megaMenu = document.createElement('div');
    megaMenu.className = 'services-mega';
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
      event.preventDefault();
      setMegaMenu(!serviceBar.classList.contains('mega-open'));
    });
    backdrop.addEventListener('click', () => setMegaMenu(false));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMegaMenu(false); });
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

document.querySelectorAll('[data-current-year], #copyright-year').forEach((node) => { node.textContent = new Date().getFullYear(); });

document.querySelectorAll('.u-email-link[data-user][data-domain]').forEach((link) => {
  const address = `${link.dataset.user}@${link.dataset.domain}`;
  link.href = `mailto:${address}`;
  link.textContent = address;
});

document.querySelectorAll('img').forEach((image) => {
  if (!image.hasAttribute('loading') && !image.closest('.page-header, .blog-post-hero, .client-hero')) image.loading = 'lazy';
});
