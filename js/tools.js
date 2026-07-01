document.querySelectorAll('.calculator-container input, .tool-container input').forEach((input) => {
  input.addEventListener('input', () => input.classList.toggle('has-value', Boolean(input.value)));
});
