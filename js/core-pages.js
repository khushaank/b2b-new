document.querySelectorAll('.faq-question, .faq-item h3, .faq-item .question').forEach((question) => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const open = item?.classList.toggle('active') || false;
    question.setAttribute('aria-expanded', String(open));
  });
});

const counters = document.querySelectorAll('.counter[data-target]');
if (counters.length) {
  const animateCounter = (counter) => {
    if (counter.dataset.counted) return;
    counter.dataset.counted = 'true';
    const configured = Number(counter.dataset.target || 0);
    const target = counter.id === 'years-counter' ? new Date().getFullYear() - 2013 : configured;
    const suffix = counter.textContent.includes('+') || target >= 100 ? '+' : '';
    const started = performance.now();
    const duration = 950;

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: .35 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
}

const categoryNav = document.querySelector('.category-nav');
if (categoryNav) {
  const categoryShell = categoryNav.closest('.category-nav-shell');
  const scrollButtons = [...(categoryShell?.querySelectorAll('[data-category-scroll]') || [])];
  const categoryLinks = [...categoryNav.querySelectorAll('a[href^="#"]')];
  const categorySections = categoryLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveCategory = (id) => {
    categoryLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
        const targetLeft = link.offsetLeft - (categoryNav.clientWidth - link.offsetWidth) / 2;
        categoryNav.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }
      else link.removeAttribute('aria-current');
    });
  };

  const updateCategoryControls = () => {
    const overflowing = categoryNav.scrollWidth > categoryNav.clientWidth + 2;
    categoryShell?.classList.toggle('has-overflow', overflowing);
    scrollButtons.forEach((button) => { button.hidden = !overflowing; });
    const maxScroll = Math.max(0, categoryNav.scrollWidth - categoryNav.clientWidth);
    const previous = scrollButtons.find((button) => button.dataset.categoryScroll === '-1');
    const next = scrollButtons.find((button) => button.dataset.categoryScroll === '1');
    if (previous) previous.disabled = categoryNav.scrollLeft <= 2;
    if (next) next.disabled = categoryNav.scrollLeft >= maxScroll - 2;
  };

  scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.categoryScroll || 1);
      categoryNav.scrollBy({ left: direction * Math.max(180, categoryNav.clientWidth * .7), behavior: 'smooth' });
    });
  });
  categoryNav.addEventListener('scroll', updateCategoryControls, { passive: true });
  window.addEventListener('resize', updateCategoryControls);
  requestAnimationFrame(updateCategoryControls);

  categoryLinks.forEach((link) => {
    link.addEventListener('click', () => setActiveCategory(link.hash.slice(1)));
  });

  if (location.hash && document.querySelector(location.hash)) setActiveCategory(location.hash.slice(1));

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveCategory(visible.target.id);
  }, { rootMargin: '-34% 0px -55% 0px', threshold: [0, .15, .5] });
  categorySections.forEach((section) => sectionObserver.observe(section));
}

const retryConnection = document.querySelector('[data-retry-connection]');
if (retryConnection) {
  retryConnection.addEventListener('click', () => window.location.reload());
  window.addEventListener('online', () => window.location.reload(), { once: true });
}

const clientGrid = document.querySelector('#client-grid');
if (clientGrid) {
  const clients = [...clientGrid.querySelectorAll('.client-item')];
  const filterButton = document.querySelector('#filter-toggle-btn');
  const filterMenu = document.querySelector('#filter-dropdown');
  const filterLabel = document.querySelector('#filter-active-label');
  const loadMore = document.querySelector('#load-more-btn');
  const pageSize = 20;
  let activeFilter = 'all';
  let visibleCount = pageSize;

  const renderClients = () => {
    const matches = clients.filter((item) => activeFilter === 'all' || item.dataset.category === activeFilter);
    clients.forEach((item) => { item.hidden = true; });
    matches.slice(0, visibleCount).forEach((item) => { item.hidden = false; });
    if (loadMore) {
      loadMore.hidden = visibleCount >= matches.length;
      loadMore.setAttribute('aria-label', `Show ${Math.min(pageSize, Math.max(0, matches.length - visibleCount))} more clients`);
    }
  };

  filterButton?.addEventListener('click', () => {
    const open = filterButton.getAttribute('aria-expanded') !== 'true';
    filterButton.setAttribute('aria-expanded', String(open));
  });
  filterMenu?.querySelectorAll('.filter-opt').forEach((option) => {
    option.addEventListener('click', () => {
      activeFilter = option.dataset.filter || 'all';
      visibleCount = pageSize;
      filterMenu.querySelectorAll('.filter-opt').forEach((item) => {
        const active = item === option;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      if (filterLabel) filterLabel.textContent = option.textContent.trim().replace(' Clients', '');
      filterButton?.setAttribute('aria-expanded', 'false');
      renderClients();
    });
  });
  loadMore?.addEventListener('click', () => {
    visibleCount += pageSize;
    renderClients();
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#filter-toggle-wrapper')) filterButton?.setAttribute('aria-expanded', 'false');
  });
  renderClients();
}
