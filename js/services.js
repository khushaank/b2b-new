document.querySelectorAll('.faq-question, .accordion-header').forEach((trigger) => {
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('tabindex', '0');
  const toggle = () => trigger.closest('.faq-item, .accordion-item')?.classList.toggle('active');
  trigger.addEventListener('click', toggle);
  trigger.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') toggle(); });
});
