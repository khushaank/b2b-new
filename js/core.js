const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.classList.remove('active');
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open');
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

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
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
