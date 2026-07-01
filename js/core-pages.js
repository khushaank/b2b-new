document.querySelectorAll('.faq-item h3, .faq-item .question').forEach((question) => {
  question.addEventListener('click', () => question.closest('.faq-item')?.classList.toggle('active'));
});
