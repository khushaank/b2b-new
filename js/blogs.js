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
    const activeIndex = headings.findLastIndex((heading) => heading.getBoundingClientRect().top < window.innerHeight * .42);
    document.querySelectorAll('.article-hover-toc a').forEach((link, index) => link.classList.toggle('active', index === activeIndex));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

const insightsHub = document.querySelector('.insights-hub');
if (insightsHub) {
  const featuredGrid = insightsHub.querySelector('#featuredInsights');
  const latestGrid = insightsHub.querySelector('#blogGrid');
  const featuredSection = insightsHub.querySelector('.featured-insights');
  const latestSection = insightsHub.querySelector('.latest-insights');
  const searchInput = insightsHub.querySelector('#insightTitleSearch');
  const searchStatus = insightsHub.querySelector('[data-search-status]');
  const emptyState = insightsHub.querySelector('#insightsEmpty');
  const latestCount = insightsHub.querySelector('[data-latest-count]');
  const totalCount = insightsHub.querySelector('[data-insight-total]');
  const featuredCards = featuredGrid ? [...featuredGrid.querySelectorAll('.blog-card')] : [];
  const latestCards = latestGrid ? [...latestGrid.querySelectorAll('.blog-card')] : [];
  const allCards = [...featuredCards, ...latestCards];
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  const suggestions = document.createElement('div');
  suggestions.className = 'insights-suggestions';
  suggestions.hidden = true;
  searchInput?.parentElement?.appendChild(suggestions);

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
    const query = searchInput?.value.trim().toLocaleLowerCase() || '';
    const matches = (card) => card.querySelector('h2')?.textContent.trim().toLocaleLowerCase().includes(query);
    const visibleFeatured = featuredCards.filter(matches);
    const visibleLatest = latestCards.filter(matches);
    const visibleTotal = visibleFeatured.length + visibleLatest.length;

    featuredCards.forEach((card) => { card.hidden = !visibleFeatured.includes(card); });
    latestCards.forEach((card) => { card.hidden = !visibleLatest.includes(card); });
    if (featuredSection) featuredSection.hidden = visibleFeatured.length === 0;
    if (latestSection) latestSection.hidden = visibleLatest.length === 0;
    if (emptyState) emptyState.hidden = visibleTotal !== 0;
    if (searchStatus) searchStatus.textContent = query ? `${plural(visibleTotal, 'title')} found` : '';
    if (latestCount) latestCount.textContent = plural(visibleLatest.length, 'latest article');
    if (totalCount) totalCount.textContent = allCards.length;
  };

  const updateSuggestions = () => {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLocaleLowerCase();
    const matches = allCards.filter((card) => card.querySelector('h2')?.textContent.trim().toLocaleLowerCase().includes(query)).slice(0, 5);
    suggestions.replaceChildren();
    const heading = document.createElement('p');
    heading.className = 'insights-suggestions-heading';
    heading.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 17 6-6 4 4 7-8"></path><path d="M14 7h6v6"></path></svg>';
    heading.append(query ? 'Suggested titles' : 'Trending articles');
    suggestions.appendChild(heading);
    matches.forEach((card) => {
      const sourceLink = card.querySelector('.blog-card-link');
      const link = document.createElement('a');
      const title = document.createElement('span');
      const category = document.createElement('small');
      link.href = sourceLink?.getAttribute('href') || '#';
      title.textContent = card.querySelector('h2')?.textContent.trim() || 'Read article';
      category.textContent = card.querySelector('.blog-card-category')?.textContent.trim() || 'Insight';
      link.append(title, category);
      suggestions.appendChild(link);
    });
    suggestions.hidden = matches.length === 0;
  };

  searchInput?.addEventListener('focus', updateSuggestions);
  searchInput?.addEventListener('input', () => { updateInsights(); updateSuggestions(); });
  searchInput?.addEventListener('keydown', (event) => { if (event.key === 'Escape') suggestions.hidden = true; });
  document.addEventListener('pointerdown', (event) => {
    if (!searchInput?.parentElement?.contains(event.target)) suggestions.hidden = true;
  });
  updateInsights();
}
