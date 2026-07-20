(() => {
  const scriptUrl = new URL(document.currentScript?.src || 'js/home.js', window.location.href);
  const siteRoot = new URL('../', scriptUrl);
  const path = (value) => new URL(value, siteRoot).pathname;

  import(new URL('services-data.js', scriptUrl).href).then(({ serviceCategories }) => {
    const categoryIndex = document.querySelector('[data-service-category-index]');
    const preview = document.querySelector('[data-service-category-preview]');
    const footer = document.querySelector('[data-service-category-footer]');

    const renderPreview = (category) => {
      if (!preview) return;
      preview.classList.add('is-updating');
      preview.innerHTML = `<img src="${path(category.image)}" alt="${category.imageAlt}" width="${category.imageWidth}" height="${category.imageHeight}" loading="lazy" decoding="async"><div><span>${category.number} / ${category.title}</span><p>${category.description}</p><a href="${path(category.href)}">Explore category <span aria-hidden="true">→</span></a></div>`;
      requestAnimationFrame(() => preview.classList.remove('is-updating'));
      categoryIndex?.querySelectorAll('[data-category-id]').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.categoryId === category.id);
      });
    };

    if (categoryIndex) {
      categoryIndex.innerHTML = serviceCategories.map((category) => `
        <a href="${path(category.href)}" data-category-id="${category.id}">
          <span>${category.number}</span>
          <div><strong>${category.title}</strong><p>${category.description}</p></div>
          <i aria-hidden="true">→</i>
        </a>`).join('');
      categoryIndex.querySelectorAll('[data-category-id]').forEach((link) => {
        const category = serviceCategories.find((item) => item.id === link.dataset.categoryId);
        link.addEventListener('mouseenter', () => renderPreview(category));
        link.addEventListener('focus', () => renderPreview(category));
      });
      renderPreview(serviceCategories[0]);
    }

    if (footer) {
      footer.insertAdjacentHTML('beforeend', serviceCategories
        .map((category) => `<a href="${path(category.href)}">${category.title}</a>`).join(''));
    }
  }).catch(() => { });
})();
