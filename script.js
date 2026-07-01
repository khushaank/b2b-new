(() => {
  document.querySelectorAll('.accordion button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.accordion');
      const wasOpen = item?.classList.contains('open');

      document.querySelectorAll('.accordion').forEach((accordion) => {
        accordion.classList.remove('open');
        accordion.querySelector('button')?.setAttribute('aria-expanded', 'false');
        const symbol = accordion.querySelector('button b');
        if (symbol) symbol.textContent = '+';
      });

      if (item && !wasOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        const symbol = button.querySelector('b');
        if (symbol) symbol.textContent = '−';
      }
    });
  });
})();
