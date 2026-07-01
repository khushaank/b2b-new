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
  const categoryLinks = [...categoryNav.querySelectorAll('a[href^="#"]')];
  const categorySections = categoryLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveCategory = (id) => {
    categoryLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

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
