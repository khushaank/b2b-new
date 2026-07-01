document.querySelectorAll('.accordion button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.accordion');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion').forEach((accordion) => {
      accordion.classList.remove('open');
      accordion.querySelector('button').setAttribute('aria-expanded', 'false');
      accordion.querySelector('button b').textContent = '+';
    });
    if (!wasOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('b').textContent = '−';
    }
  });
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.classList.toggle('active');
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.classList.remove('active');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('#year').textContent = new Date().getFullYear();
