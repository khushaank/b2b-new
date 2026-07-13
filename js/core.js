const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const serviceBar = document.querySelector('.service-bar');
const siteRootUrl = new URL('../', document.currentScript?.src || window.location.href);

if (/\/(?:404|410|421|429|500|503)(?:\.html)?\/?$/i.test(window.location.pathname)) {
  window.location.replace(siteRootUrl.href);
}

if (serviceBar) {
  const updateStickyOffset = () => {
    document.documentElement.style.setProperty('--sticky-header-height', `${serviceBar.offsetHeight}px`);
  };
  updateStickyOffset();
  window.addEventListener('resize', updateStickyOffset);
  window.addEventListener('load', updateStickyOffset, { once: true });
}

if (navigation && serviceBar) {
  const servicesTrigger = [...navigation.querySelectorAll('a')].find((link) => /service(?:\.html)?(?:$|[?#])/.test(link.getAttribute('href') || ''));

  if (servicesTrigger) {
    const prefix = servicesTrigger.getAttribute('href').replace(/service(?:\.html)?.*$/, '');
    servicesTrigger.textContent = 'Services';
    servicesTrigger.classList.add('services-trigger');
    servicesTrigger.setAttribute('aria-haspopup', 'true');
    servicesTrigger.setAttribute('aria-expanded', 'false');
    servicesTrigger.setAttribute('aria-controls', 'services-mega-menu');
    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'services-trigger-icon';
    triggerIcon.setAttribute('aria-hidden', 'true');
    triggerIcon.innerHTML = '<svg viewBox="0 0 20 20" focusable="false"><path d="m5.5 7.5 4.5 4.5 4.5-4.5"/></svg>';
    servicesTrigger.appendChild(triggerIcon);

    const megaMenu = document.createElement('div');
    megaMenu.className = 'services-mega';
    megaMenu.id = 'services-mega-menu';
    megaMenu.setAttribute('aria-label', 'Services menu');
    megaMenu.innerHTML = `
      <div class="shell services-mega-inner">
        <div class="mega-primary">
          <span class="mega-kicker">Integrated industrial solutions</span>
          <strong>From audit findings to engineered outcomes.</strong>
          <p>One accountable partner for compliance, safety, energy performance, and turnkey project delivery across India.</p>
          <a href="${prefix}service">Explore all 80+ services <span aria-hidden="true">→</span></a>
        </div>
        <div class="mega-column">
          <b>Audits &amp; compliance</b>
          <a href="${prefix}services/energy-audits">Energy audits</a>
          <a href="${prefix}services/electrical-safety-audit">Electrical safety</a>
          <a href="${prefix}services/fire-life-safety">Fire &amp; HSE audits</a>
          <a href="${prefix}services/environment-compliances">Environment compliance</a>
          <a class="mega-all" href="${prefix}services/compliances">View compliance services →</a>
        </div>
        <div class="mega-column">
          <b>Engineering projects</b>
          <a href="${prefix}services/electrical-projects">Electrical projects</a>
          <a href="${prefix}services/hvac-projects">HVAC &amp; duct cleaning</a>
          <a href="${prefix}services/fire-projects">Fire protection projects</a>
          <a href="${prefix}services/lighting-projects">Lighting projects</a>
          <a class="mega-all" href="${prefix}services/project-management">Project management →</a>
        </div>
        <div class="mega-column">
          <b>Emission &amp; sustainability</b>
          <a href="${prefix}services/recd-kit">RECD &amp; DFK kits</a>
          <a href="${prefix}services/emission-control">Emission control</a>
          <a href="${prefix}services/carbon-footprint">Carbon footprint</a>
          <a href="${prefix}services/renewable-energy">Renewable energy</a>
          <a class="mega-all" href="${prefix}contact">Discuss your requirement →</a>
        </div>
      </div>`;
    servicesTrigger.insertAdjacentElement('afterend', megaMenu);

    const backdrop = document.createElement('div');
    backdrop.className = 'mega-backdrop';
    document.body.appendChild(backdrop);

    const setMegaMenu = (open) => {
      clearTimeout(closeTimer);
      serviceBar.classList.toggle('mega-open', open);
      document.body.classList.toggle('mega-menu-open', open && window.innerWidth > 820);
      servicesTrigger.setAttribute('aria-expanded', String(open));
    };
    let closeTimer;
    const scheduleClose = () => { closeTimer = setTimeout(() => setMegaMenu(false), 140); };

    servicesTrigger.addEventListener('mouseenter', () => setMegaMenu(true));
    serviceBar.addEventListener('mouseleave', scheduleClose);
    servicesTrigger.addEventListener('focus', () => setMegaMenu(true));
    serviceBar.addEventListener('focusout', (event) => {
      if (!serviceBar.contains(event.relatedTarget)) scheduleClose();
    });
    servicesTrigger.addEventListener('click', (event) => {
      if (window.innerWidth <= 820) return;
      event.preventDefault();
      setMegaMenu(true);
    });
    backdrop.addEventListener('click', () => setMegaMenu(false));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMegaMenu(false); });
    const closeMegaOnViewportMove = () => {
      if (serviceBar.classList.contains('mega-open')) setMegaMenu(false);
    };
    window.addEventListener('scroll', closeMegaOnViewportMove, { passive: true });
    window.addEventListener('wheel', closeMegaOnViewportMove, { passive: true });
    window.addEventListener('touchmove', closeMegaOnViewportMove, { passive: true });
    window.addEventListener('resize', () => setMegaMenu(false));
  }
}

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.classList.remove('active');
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open', 'mega-menu-open');
    serviceBar?.classList.remove('mega-open');
    navigation.querySelector('.services-trigger')?.setAttribute('aria-expanded', 'false');
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

  navigation.querySelectorAll('a:not(.services-trigger)').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
}

// Turn wide comparison tables into labelled, scan-friendly cards on phones.
document.querySelectorAll('table.service-table').forEach((table) => {
  const labels = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent.trim());
  if (!labels.length) return;
  table.querySelectorAll('tbody tr').forEach((row) => {
    [...row.cells].forEach((cell, index) => {
      cell.dataset.label = labels[index] || `Detail ${index + 1}`;
    });
  });
});

// Third-party maps load only after an explicit request, avoiding blocker errors on page load.
document.querySelectorAll('[data-map-load]').forEach((button) => {
  button.addEventListener('click', () => {
    const map = button.closest('.modern-map-container')?.querySelector('iframe[data-map-src]');
    if (!map) return;
    map.src = map.dataset.mapSrc;
    map.hidden = false;
    button.hidden = true;
  }, { once: true });
});

document.querySelectorAll('[data-current-year], #copyright-year, #year').forEach((node) => { node.textContent = new Date().getFullYear(); });

const serviceGroups = document.querySelectorAll('.service-directory .service-group');
serviceGroups.forEach((group) => {
  group.addEventListener('toggle', () => {
    if (!group.open) return;
    serviceGroups.forEach((otherGroup) => {
      if (otherGroup !== group) otherGroup.open = false;
    });
  });
});

/* Preserve the page that sent a successful enquiry, even across Web3Forms' redirect. */
const formReturnStorageKey = 'b2b-form-return';
const getPageLabel = () => {
  const heading = document.querySelector('main h1');
  return (heading?.textContent || document.title.split('|')[0] || 'previous page').trim().replace(/\s+/g, ' ').slice(0, 70);
};

document.querySelectorAll('form[action*="api.web3forms.com/submit"]').forEach((form) => {
  const source = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const label = getPageLabel();
  const redirect = form.querySelector('input[name="redirect"]');
  if (redirect?.value) {
    try {
      const destination = new URL(redirect.value, window.location.href);
      destination.searchParams.set('from', source);
      destination.searchParams.set('label', label);
      redirect.value = destination.href;
    } catch (_) { /* Keep the original provider redirect if it is malformed. */ }
  }
  form.addEventListener('submit', () => {
    try { sessionStorage.setItem(formReturnStorageKey, JSON.stringify({ url: source, label })); } catch (_) { /* Storage may be disabled. */ }
  });
});

const formReturnButton = document.querySelector('[data-form-return]');
if (formReturnButton) {
  let storedReturn = null;
  try { storedReturn = JSON.parse(sessionStorage.getItem(formReturnStorageKey) || 'null'); } catch (_) { /* Use URL fallback. */ }
  const params = new URLSearchParams(window.location.search);
  const returnPath = params.get('from') || storedReturn?.url;
  const returnLabel = params.get('label') || storedReturn?.label;
  if (returnPath) {
    try {
      const target = new URL(returnPath, window.location.origin);
      const isSafeLocalPage = target.origin === window.location.origin && !/\/success(?:\.html)?$/.test(target.pathname);
      if (isSafeLocalPage) {
        formReturnButton.href = `${target.pathname}${target.search}${target.hash}`;
        const labelNode = formReturnButton.querySelector('[data-form-return-label]');
        if (labelNode && returnLabel) labelNode.textContent = `Return to ${String(returnLabel).trim().slice(0, 50)}`;
      }
    } catch (_) { /* Keep the contact-page fallback. */ }
  }
}

document.querySelectorAll('[data-guided-form]').forEach((form) => {
  const steps = [...form.querySelectorAll('[data-form-step]')];
  const progress = form.querySelector('[data-form-progress]');
  const currentNode = form.querySelector('[data-form-current]');
  const totalNode = form.querySelector('[data-form-total]');
  const backButton = form.querySelector('[data-form-back]');
  const nextButton = form.querySelector('[data-form-next]');
  const submitButton = form.querySelector('[type="submit"]');
  let index = 0;

  const showStep = (nextIndex) => {
    index = Math.max(0, Math.min(nextIndex, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === index;
      step.classList.toggle('active', active);
      step.toggleAttribute('hidden', !active);
    });
    if (progress) progress.style.setProperty('--form-progress', `${((index + 1) / steps.length) * 100}%`);
    if (currentNode) currentNode.textContent = String(index + 1).padStart(2, '0');
    if (totalNode) totalNode.textContent = String(steps.length).padStart(2, '0');
    if (backButton) backButton.disabled = index === 0;
    if (nextButton) nextButton.hidden = index === steps.length - 1;
    if (submitButton) submitButton.hidden = index !== steps.length - 1;
    steps[index]?.querySelector('input, textarea')?.focus({ preventScroll: true });
  };

  const validCurrentStep = () => {
    const field = steps[index]?.querySelector('input, textarea');
    return !field || field.reportValidity();
  };

  form.querySelectorAll('[data-fill-message]').forEach((button) => {
    button.addEventListener('click', () => {
      const message = form.querySelector('textarea[name="message"]');
      if (message) {
        message.value = button.dataset.fillMessage;
        message.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  backButton?.addEventListener('click', () => showStep(index - 1));
  nextButton?.addEventListener('click', () => {
    if (validCurrentStep()) showStep(index + 1);
  });
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && index < steps.length - 1) {
      event.preventDefault();
      if (validCurrentStep()) showStep(index + 1);
    }
  });
  showStep(0);
});

const formSuccessMarkup = (heading, text, actionText) => `
  <div class="form-success-state" role="status" aria-live="polite">
    <div class="form-success-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 17l5 5 11-13"/></svg></div>
    <h3>${heading}</h3>
    <p>${text}</p>
    <p>Your reference details have been submitted successfully.</p>
    <button type="button" data-form-reset>${actionText}</button>
  </div>`;

const formErrorMarkup = (message) => `
  <div class="form-error-state" role="alert">
    <h3>Submission failed</h3>
    <p>${message}</p>
    <button type="button" data-form-error-dismiss>Try again</button>
  </div>`;

document.querySelectorAll('[data-smart-contact-form]').forEach((form) => {
  const steps = [...form.querySelectorAll('[data-step]')];
  const progressBar = form.querySelector('[data-step-progress]');
  const stepLabel = form.querySelector('[data-step-label]');
  const stepTitle = form.querySelector('[data-step-title]');
  const status = form.querySelector('[data-form-status]');
  const backButton = form.querySelector('[data-step-back]');
  const nextButton = form.querySelector('[data-step-next]');
  const submitButton = form.querySelector('[data-step-submit]');
  const summaryList = form.querySelector('[data-summary]');
  const sequenceItems = [...form.querySelectorAll('[data-step-sequence] li')];
  const totalSteps = steps.length;
  let stepIndex = 0;
  let submitting = false;

  const fields = {
    name: form.querySelector('#name'),
    company: form.querySelector('#company'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    service: () => form.querySelector('input[name="service"]:checked'),
    message: form.querySelector('#message'),
  };

  const setStatus = (message = '', type = '') => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('success', type === 'success');
    status.classList.toggle('error', type === 'error');
  };

  const setError = (step, message = '') => {
    const error = step?.querySelector('[data-error]');
    if (error) error.textContent = message;
    step?.querySelectorAll('input, textarea').forEach((field) => {
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    });
  };

  const phoneIsValid = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const validateStep = (step, showError = false) => {
    if (!step) return true;
    const textField = step.querySelector('input:not([type="radio"]):not([type="hidden"]):not([type="checkbox"]), textarea');
    const radio = step.querySelector('input[type="radio"]');
    let valid = true;
    let message = '';

    if (textField) {
      const value = textField.value.trim();
      if (textField.required && !value) {
        valid = false;
        message = 'Please complete this field.';
      } else if (textField.type === 'email' && !textField.validity.valid) {
        valid = false;
        message = 'Please enter a valid email address.';
      } else if (textField.name === 'phone' && !phoneIsValid(value)) {
        valid = false;
        message = 'Please enter a valid phone number.';
      } else if (textField.minLength > 0 && value.length < textField.minLength) {
        valid = false;
        message = `Please enter at least ${textField.minLength} characters.`;
      }
    } else if (radio && !fields.service()) {
      valid = false;
      message = 'Please choose a service.';
    }

    setError(step, showError && !valid ? message : '');
    return valid;
  };

  const currentStep = () => steps[stepIndex];

  const updateSummary = () => {
    if (!summaryList) return;
    const rows = [
      ['Name', fields.name?.value.trim()],
      ['Company', fields.company?.value.trim()],
      ['Email', fields.email?.value.trim()],
      ['Phone', fields.phone?.value.trim()],
      ['Service', fields.service()?.value],
      ['Requirement', fields.message?.value.trim()],
    ];
    summaryList.innerHTML = rows
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || 'Not provided')}</dd></div>`)
      .join('');
  };

  const showStep = (nextIndex) => {
    stepIndex = Math.max(0, Math.min(nextIndex, totalSteps - 1));
    steps.forEach((step, index) => {
      const active = index === stepIndex;
      step.classList.toggle('active', active);
      step.toggleAttribute('hidden', !active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });

    const activeStep = currentStep();
    const progress = ((stepIndex + 1) / totalSteps) * 100;
    form.style.setProperty('--step-progress', `${progress}%`);
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (stepLabel) stepLabel.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
    if (stepTitle) stepTitle.textContent = activeStep?.dataset.stepName || '';
    sequenceItems.forEach((item, index) => {
      const active = index === stepIndex;
      item.classList.toggle('active', active);
      item.classList.toggle('completed', index < stepIndex);
      if (active) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    if (backButton) backButton.disabled = stepIndex === 0 || submitting;
    if (nextButton) {
      nextButton.hidden = stepIndex === totalSteps - 1;
      nextButton.disabled = !validateStep(activeStep, false) || submitting;
    }
    if (submitButton) {
      submitButton.hidden = stepIndex !== totalSteps - 1;
      submitButton.disabled = submitting;
    }
    setStatus();
    if (stepIndex === totalSteps - 1) updateSummary();
    activeStep?.querySelector('input:not([type="radio"]), textarea')?.focus({ preventScroll: true });
  };

  const goNext = () => {
    if (submitting) return;
    const step = currentStep();
    if (!validateStep(step, true)) return;
    showStep(stepIndex + 1);
  };

  const validateBeforeSubmit = () => {
    for (let index = 0; index < totalSteps - 1; index += 1) {
      if (!validateStep(steps[index], true)) {
        showStep(index);
        return false;
      }
    }
    updateSummary();
    return true;
  };

  form.addEventListener('input', () => {
    validateStep(currentStep(), false);
    if (nextButton && stepIndex < totalSteps - 1) nextButton.disabled = !validateStep(currentStep(), false) || submitting;
  });

  form.addEventListener('change', () => {
    validateStep(currentStep(), false);
    if (nextButton && stepIndex < totalSteps - 1) nextButton.disabled = !validateStep(currentStep(), false) || submitting;
  });

  nextButton?.addEventListener('click', goNext);
  backButton?.addEventListener('click', () => {
    if (!submitting) showStep(stepIndex - 1);
  });

  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || submitting) return;
    const target = event.target;
    const isTextarea = target instanceof HTMLTextAreaElement;
    const isRadio = target instanceof HTMLInputElement && target.type === 'radio';
    if (isTextarea && !event.ctrlKey && !event.metaKey) return;
    if (stepIndex < totalSteps - 1 && (target instanceof HTMLInputElement || isTextarea || isRadio)) {
      event.preventDefault();
      goNext();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !validateBeforeSubmit()) return;
    submitting = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-sending');
      submitButton.textContent = 'Sending...';
    }
    if (backButton) backButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    setStatus('Sending your enquiry securely...', '');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      let result = {};
      try { result = await response.json(); } catch (_) { /* Some form providers return empty success bodies. */ }
      if (!response.ok || result.success === false) throw new Error(result.message || 'Submission failed');
      const success = document.createElement('div');
      success.innerHTML = formSuccessMarkup(
        'Enquiry received',
        'Thank you. Our team will review your requirement and contact you shortly.',
        'Send another enquiry'
      );
      form.hidden = true;
      form.after(success.firstElementChild);
      form.nextElementSibling?.querySelector('[data-form-reset]')?.addEventListener('click', () => {
        form.nextElementSibling?.remove();
        form.reset();
        submitting = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.classList.remove('is-sending');
          submitButton.textContent = 'Send enquiry';
        }
        form.hidden = false;
        showStep(0);
      });
    } catch (_) {
      submitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-sending');
        submitButton.textContent = 'Send enquiry';
      }
      if (backButton) backButton.disabled = stepIndex === 0;
      if (nextButton && stepIndex < totalSteps - 1) nextButton.disabled = !validateStep(currentStep(), false);
      setStatus('We could not send the enquiry right now. Please check your connection and try again, or call us directly.', 'error');
    }
  });

  showStep(0);
});

document.querySelectorAll('.quote-form form').forEach((form) => {
  if (form.dataset.enhancedSubmit) return;
  form.dataset.enhancedSubmit = 'true';
  const button = form.querySelector('button[type="submit"], input[type="submit"]');
  const originalButtonText = button?.textContent || button?.value || 'Submit';
  let submitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true;
    form.querySelector('.form-error-state')?.remove();
    form.querySelectorAll('input, textarea, select, button').forEach((field) => { field.disabled = true; });
    if (button) {
      button.classList.add('is-sending');
      button.textContent = 'Sending...';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      let result = {};
      try { result = await response.json(); } catch (_) { /* Some form providers return empty success bodies. */ }
      if (!response.ok || result.success === false) throw new Error(result.message || 'Submission failed');
      const success = document.createElement('div');
      success.innerHTML = formSuccessMarkup(
        'Request received',
        'Thank you. Our team will review your requirements and contact you to discuss the next steps.',
        'Submit another request'
      );
      const sidebar = form.closest('.sidebar');
      if (sidebar) sidebar.scrollTop = 0;
      form.hidden = true;
      const successState = success.firstElementChild;
      form.after(successState);
      const successHeading = successState?.querySelector('h3');
      successHeading?.setAttribute('tabindex', '-1');
      successHeading?.focus({ preventScroll: true });
      form.nextElementSibling?.querySelector('[data-form-reset]')?.addEventListener('click', () => {
        form.nextElementSibling?.remove();
        form.reset();
        form.querySelectorAll('input, textarea, select, button').forEach((field) => { field.disabled = false; });
        if (button) {
          button.classList.remove('is-sending');
          button.textContent = originalButtonText;
        }
        submitting = false;
        form.hidden = false;
      });
    } catch (_) {
      submitting = false;
      form.querySelectorAll('input, textarea, select, button').forEach((field) => { field.disabled = false; });
      if (button) {
        button.classList.remove('is-sending');
        button.textContent = originalButtonText;
      }
      const error = document.createElement('div');
      error.innerHTML = formErrorMarkup('Please check your connection and try again, or call us directly.');
      const errorState = error.firstElementChild;
      form.append(errorState);
      errorState?.setAttribute('tabindex', '-1');
      errorState?.focus({ preventScroll: true });
      form.querySelector('[data-form-error-dismiss]')?.addEventListener('click', () => {
        form.querySelector('.form-error-state')?.remove();
      });
    }
  });
});

document.querySelectorAll('.u-email-link[data-user][data-domain]').forEach((link) => {
  const address = `${link.dataset.user}@${link.dataset.domain}`;
  link.href = `mailto:${address}`;
  link.setAttribute('aria-label', 'Email B2B Industrial Solutions');
});

document.querySelectorAll('.protected-email[data-user][data-domain][data-tld]').forEach((link) => {
  const { user, domain, tld } = link.dataset;
  if (!user || !domain || !tld) return;
  const address = `${user}@${domain}.${tld}`;
  link.textContent = address;
  link.href = `mailto:${address}`;
  link.setAttribute('aria-label', 'Email B2B Industrial Solutions');
});

document.addEventListener('copy', (event) => event.preventDefault());

document.querySelectorAll('img').forEach((image) => {
  image.draggable = false;
  if (!image.hasAttribute('loading') && !image.closest('.page-header, .blog-post-hero, .client-hero')) image.loading = 'lazy';
});

document.querySelectorAll('.legacy-content > .page-header').forEach((hero) => {
  const nextSection = hero.nextElementSibling;
  if (!nextSection || hero.querySelector('.hero-scroll-cue')) return;
  const cue = document.createElement('button');
  cue.className = 'hero-scroll-cue';
  cue.type = 'button';
  cue.setAttribute('aria-label', 'Continue to page content');
  cue.innerHTML = '<span aria-hidden="true"></span>';
  cue.addEventListener('click', () => nextSection.scrollIntoView({ behavior: 'auto', block: 'start' }));
  hero.appendChild(cue);
});

/* Whole-site Ctrl/Cmd+K command palette. The full index loads only on demand. */
const commandHost = document.querySelector('.global-bar-inner');
if (commandHost) {
  const palette = document.createElement('div');
  palette.className = 'command-palette';
  palette.setAttribute('aria-hidden', 'true');
  palette.innerHTML = `
    <button class="command-scrim" type="button" aria-label="Close search"></button>
    <section class="command-panel" role="dialog" aria-modal="true" aria-label="Search the whole website">
      <div class="command-input-wrap">
        <span aria-hidden="true">⌕</span>
        <input class="command-input" id="command-palette-search" name="site-search" type="search" autocomplete="off" spellcheck="false" placeholder="Search services, pages, blogs and tools…" aria-label="Search website">
        <kbd>Esc</kbd>
      </div>
      <div class="command-status">Quick links</div>
      <div class="command-results" role="listbox"></div>
      <div class="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
    </section>`;
  document.body.appendChild(palette);

  const commandInput = palette.querySelector('.command-input');
  const commandResults = palette.querySelector('.command-results');
  const commandStatus = palette.querySelector('.command-status');
  const quickLinks = [
    { title: 'Home', url: '/', tags: 'homepage overview' },
    { title: 'All Services', url: '/service', tags: 'services directory' },
    { title: 'About B2B Industrial Solutions', url: '/about', tags: 'company' },
    { title: 'Industrial Insights', url: '/blog/', tags: 'blogs articles' },
    { title: 'Case Studies', url: '/case-studies/cement-plant-energy-audit', tags: 'results projects' },
    { title: 'Engineering Tools', url: '/tools/', tags: 'calculators' },
    { title: 'Contact Us', url: '/contact', tags: 'quote site visit' },
  ];
  let commandData = [];
  let commandIndexLoaded = false;
  let commandIndexLoading = false;
  let activeResult = 0;
  let lastFocusedElement = null;

  const decodeText = (value) => {
    const textArea = document.createElement('textarea');
    textArea.name = 'clipboard-copy-buffer';
    textArea.setAttribute('aria-hidden', 'true');
    textArea.innerHTML = value || '';
    return textArea.value;
  };

  const resolvePageUrl = (rawUrl) => {
    const clean = String(rawUrl || '/').replace(/^\/+/, '');
    if (!clean || clean === 'index') return new URL('', siteRootUrl).href;
    if (clean.endsWith('/')) return new URL(clean, siteRootUrl).href;
    if (/\.[a-z0-9]+$/i.test(clean)) return new URL(clean, siteRootUrl).href;
    return new URL(clean, siteRootUrl).href;
  };

  const sectionLabel = (url) => {
    if (url.includes('/services/')) return 'Service';
    if (url.includes('/blog/')) return 'Insight';
    if (url.includes('/locations/')) return 'Location';
    if (url.includes('/tools/')) return 'Tool';
    if (url.includes('/case-studies/')) return 'Case study';
    return 'Page';
  };

  const setActiveResult = (nextIndex) => {
    const results = [...commandResults.querySelectorAll('.command-result')];
    if (!results.length) return;
    activeResult = (nextIndex + results.length) % results.length;
    results.forEach((result, index) => {
      const active = index === activeResult;
      result.classList.toggle('active', active);
      result.setAttribute('aria-selected', String(active));
      if (active) commandInput.setAttribute('aria-activedescendant', result.id);
    });
    results[activeResult].scrollIntoView({ block: 'nearest' });
  };

  const renderResults = (items, label) => {
    commandResults.replaceChildren();
    commandStatus.textContent = label;
    activeResult = 0;

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'command-empty';
      empty.textContent = 'No matching page found. Try a service, topic, or location.';
      commandResults.appendChild(empty);
      return;
    }

    items.slice(0, 4).forEach((item, index) => {
      const link = document.createElement('a');
      link.className = `command-result${index === 0 ? ' active' : ''}`;
      link.id = `command-result-${index}`;
      link.href = resolvePageUrl(item.url);
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', String(index === 0));

      const copy = document.createElement('span');
      const title = document.createElement('b');
      const meta = document.createElement('small');
      title.textContent = decodeText(item.title).replace(/\s*[-|]\s*B2B Industrial Solutions.*$/i, '');
      meta.textContent = sectionLabel(item.url);
      copy.append(title, meta);

      const arrow = document.createElement('span');
      arrow.className = 'command-arrow';
      arrow.textContent = '↗';
      link.append(copy, arrow);
      link.addEventListener('mouseenter', () => setActiveResult(index));
      commandResults.appendChild(link);
    });
  };

  const searchCommands = () => {
    const query = commandInput.value.trim().toLowerCase();
    if (!query) {
      renderResults(quickLinks, 'Quick links');
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const ranked = commandData
      .map((item) => {
        const title = decodeText(item.title).toLowerCase();
        const tags = decodeText(item.tags).toLowerCase();
        const text = decodeText(item.text).toLowerCase();
        if (!terms.every((term) => title.includes(term) || tags.includes(term) || text.includes(term))) return null;
        let score = 0;
        terms.forEach((term) => {
          if (title.startsWith(term)) score += 12;
          else if (title.includes(term)) score += 8;
          if (tags.includes(term)) score += 4;
          if (text.includes(term)) score += 1;
        });
        return { item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
    renderResults(ranked, `${Math.min(ranked.length, 4)} best matches`);
  };

  const loadCommandIndex = () => {
    if (commandIndexLoaded || commandIndexLoading) return;
    commandIndexLoading = true;
    commandStatus.textContent = 'Loading site index…';
    const script = document.createElement('script');
    script.src = new URL('assets/js/search-data.min.js', siteRootUrl).href;
    script.onload = () => {
      commandData = typeof SEARCH_DATA === 'undefined' ? quickLinks : SEARCH_DATA;
      commandIndexLoaded = true;
      commandIndexLoading = false;
      searchCommands();
    };
    script.onerror = () => {
      commandData = quickLinks;
      commandIndexLoaded = true;
      commandIndexLoading = false;
      searchCommands();
    };
    document.head.appendChild(script);
  };

  const openCommandPalette = () => {
    lastFocusedElement = document.activeElement;
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    document.body.classList.add('command-open');
    commandInput.value = '';
    renderResults(quickLinks, 'Quick links');
    loadCommandIndex();
    commandInput.focus({ preventScroll: true });
    requestAnimationFrame(() => commandInput.focus({ preventScroll: true }));
  };

  const closeCommandPalette = () => {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('command-open');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  palette.querySelector('.command-scrim').addEventListener('click', closeCommandPalette);
  commandInput.addEventListener('input', searchCommands);

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (palette.classList.contains('open')) closeCommandPalette();
      else openCommandPalette();
    } else if (palette.classList.contains('open') && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResult(activeResult + 1);
    } else if (palette.classList.contains('open') && event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult(activeResult - 1);
    } else if (palette.classList.contains('open') && event.key === 'Enter') {
      const active = commandResults.querySelector('.command-result.active');
      if (active) {
        event.preventDefault();
        window.location.href = active.href;
      }
    } else if (event.key === 'Escape' && palette.classList.contains('open')) closeCommandPalette();
  });

  const initialCommandQuery = new URLSearchParams(window.location.search).get('q');
  if (initialCommandQuery) {
    openCommandPalette();
    commandInput.value = initialCommandQuery;
    searchCommands();
  }
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.js', siteRootUrl), { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => {});
  }, { once: true });
}
