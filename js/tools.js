document.querySelectorAll('.calculator-container input, .tool-container input').forEach((input) => {
  input.addEventListener('input', () => input.classList.toggle('has-value', Boolean(input.value)));
});

document.querySelector('#roomType')?.addEventListener('change', () => window.onRoomChange?.());
[['rceil', 'rvCeil'], ['rwall', 'rvWall'], ['rfloor', 'rvFloor']].forEach(([inputId, outputId]) => {
  document.querySelector(`#${inputId}`)?.addEventListener('input', (event) => window.updateReflect?.(event.currentTarget, outputId));
});

document.querySelector('.calc-btn')?.addEventListener('click', () => window.calculate?.());
document.querySelector('.reset-link')?.addEventListener('click', () => window.resetAll?.());

[['btnFt', 'ft'], ['btnM', 'm'], ['btnFt2', 'ft'], ['btnM2', 'm']].forEach(([id, unit]) => {
  document.querySelector(`#${id}`)?.addEventListener('click', () => window.setUnit?.(unit));
});
[['cBtnFt', 'ft'], ['cBtnM', 'm']].forEach(([id, unit]) => {
  document.querySelector(`#${id}`)?.addEventListener('click', () => window.setCeilUnit?.(unit));
});
document.querySelectorAll('.stepper').forEach((stepper) => {
  const input = stepper.querySelector('input');
  stepper.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => window.step?.(input.id, index ? 1 : -1)));
});
