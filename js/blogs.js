const article = document.querySelector('.blog-article-wrapper, .blog-article');
if (article) {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  document.body.append(progress);
  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const read = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
    progress.style.transform = `scaleX(${read})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
