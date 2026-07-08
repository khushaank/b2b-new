const article = document.querySelector('.blog-article-wrapper, .blog-article');
if (article) {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  document.body.append(progress);

  const headings = [...article.querySelectorAll('h2')];
  if (headings.length) {
    const toc = document.createElement('aside');
    toc.className = 'article-hover-toc';
    toc.setAttribute('aria-label', 'Article contents');
    const nav = document.createElement('nav');
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.innerHTML = `<span></span><b>${heading.textContent.trim()}</b>`;
      nav.appendChild(link);
    });
    toc.appendChild(nav);
    document.body.append(toc);
  }

  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const read = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
    progress.style.transform = `scaleX(${read})`;
    document.querySelectorAll('.article-hover-toc a').forEach((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const heading = id ? document.getElementById(id) : null;
      link.classList.toggle('active', Boolean(heading && heading.getBoundingClientRect().top < window.innerHeight * .42));
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

const insightsHub = document.querySelector('.insights-hub');
if (insightsHub) {
  const featuredGrid = insightsHub.querySelector('#featuredInsights');
  const latestGrid = insightsHub.querySelector('#blogGrid');
  const loadMoreButton = insightsHub.querySelector('#loadMoreInsights');
  const remainingCount = insightsHub.querySelector('[data-remaining-count]');
  const latestCount = insightsHub.querySelector('[data-latest-count]');
  const totalCount = insightsHub.querySelector('[data-insight-total]');
  const featuredCards = featuredGrid ? [...featuredGrid.querySelectorAll('.blog-card')] : [];
  const latestCards = latestGrid ? [...latestGrid.querySelectorAll('.blog-card')] : [];
  const allCards = [...featuredCards, ...latestCards];
  const initialLatestLimit = latestCards.length;
  let visibleLatestLimit = initialLatestLimit;

  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

  allCards.forEach((card, index) => {
    const link = card.querySelector('.blog-card-link');

    card.classList.add('insight-card');
    if (featuredCards.includes(card) && index > 0) card.classList.add('insight-card-secondary');

    if (link && !link.querySelector('.insight-visual')) {
      link.insertAdjacentHTML('afterbegin', '<span class="insight-visual" aria-hidden="true"></span>');
    }
    if (link && !link.querySelector('.read-indicator')) {
      link.insertAdjacentHTML('beforeend', '<span class="read-indicator">Read insight <span aria-hidden="true">&rarr;</span></span>');
    }
  });

  const updateInsights = () => {
    const visibleLatest = latestCards.slice(0, visibleLatestLimit);
    const remaining = Math.max(0, latestCards.length - visibleLatest.length);

    latestCards.forEach((card) => { card.hidden = !visibleLatest.includes(card); });

    if (loadMoreButton) loadMoreButton.hidden = remaining === 0;
    if (remainingCount) remainingCount.textContent = remaining ? `${plural(remaining, 'more insight')} available` : '';
    if (latestCount) latestCount.textContent = plural(latestCards.length, 'latest article');
    if (totalCount) totalCount.textContent = allCards.length;
  };

  loadMoreButton?.addEventListener('click', () => {
    visibleLatestLimit += 6;
    updateInsights();
  });

  updateInsights();
}
