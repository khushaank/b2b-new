document.querySelectorAll('.calculator-container input, .tool-container input').forEach((input) => {
  input.addEventListener('input', () => input.classList.toggle('has-value', Boolean(input.value)));
});

document.querySelector('#roomType')?.addEventListener('change', () => window.onRoomChange?.());
[['rceil', 'rvCeil'], ['rwall', 'rvWall'], ['rfloor', 'rvFloor']].forEach(([inputId, outputId]) => {
  document.querySelector(`#${inputId}`)?.addEventListener('input', (event) => window.updateReflect?.(event.currentTarget, outputId));
});
