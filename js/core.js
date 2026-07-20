const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const serviceBar = document.querySelector('.service-bar');
const siteRootUrl = new URL('../', document.currentScript?.src || window.location.href);

const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const hasInlineRequirementAction = document.querySelector('main a[href*="contact#form"], main #form, main .contact-step-form, main .quote-form, main form[action*="web3forms"]');
const isRequirementPage = pathname === '/' || pathname === '/contact' || pathname === '/service' || pathname.startsWith('/services/');

if (!isRequirementPage && !hasInlineRequirementAction && !document.querySelector('.floating-requirement')) {
  const requirementButton = document.createElement('a');
  requirementButton.className = 'floating-requirement';
  requirementButton.href = new URL('contact#form', siteRootUrl).pathname + '#form';
  requirementButton.textContent = 'Discuss requirement';
  requirementButton.setAttribute('aria-label', 'Discuss your requirement');
  document.body.append(requirementButton);
}

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

const siteHeader = document.querySelector('.site-header');
const updateHeaderState = () => siteHeader?.classList.toggle('is-scrolled', window.scrollY > 10);
updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  });
});

const serviceNavigationReady = navigation && serviceBar
  ? import(new URL('js/services-data.js', siteRootUrl).href).then(({ serviceCategories }) => {
    const servicesTrigger = [...navigation.querySelectorAll('a')]
      .find((link) => /service(?:\.html)?(?:$|[?#])/.test(link.getAttribute('href') || ''));
    if (!servicesTrigger) return null;

    const path = (value) => new URL(value, siteRootUrl).pathname;
    servicesTrigger.textContent = 'Services';
    servicesTrigger.classList.add('services-trigger');
    servicesTrigger.setAttribute('aria-haspopup', 'true');
    servicesTrigger.setAttribute('aria-expanded', 'false');
    servicesTrigger.setAttribute('aria-controls', 'services-mega-menu mobile-services-menu');
    servicesTrigger.insertAdjacentHTML('beforeend', '<span class="services-trigger-icon" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="m5.5 7.5 4.5 4.5 4.5-4.5"/></svg></span>');

    const megaMenu = document.createElement('div');
    megaMenu.className = 'services-mega';
    megaMenu.id = 'services-mega-menu';
    megaMenu.setAttribute('aria-label', 'Services menu');
    megaMenu.setAttribute('aria-hidden', 'true');
    megaMenu.innerHTML = `
      <div class="services-mega-inner">
        <div class="mega-categories" role="tablist" aria-label="Service categories">
          <div class="mega-section-label">Service categories</div>
          ${serviceCategories.map((category, index) => `
            <button type="button" class="mega-category${index ? '' : ' is-active'}" role="tab"
              id="mega-tab-${category.id}" aria-selected="${index === 0}" aria-controls="services-category-panel"
              tabindex="${index ? '-1' : '0'}" data-service-category="${category.id}">
              <span>${category.number}</span><b>${category.title}</b><i aria-hidden="true">›</i>
            </button>`).join('')}
        </div>
        <div class="mega-services" id="services-category-panel" role="tabpanel" aria-labelledby="mega-tab-${serviceCategories[0].id}"></div>
        <aside class="mega-visual" aria-live="polite"></aside>
      </div>`;

    const mobileServices = document.createElement('div');
    mobileServices.className = 'mobile-services';
    mobileServices.id = 'mobile-services-menu';
    mobileServices.innerHTML = `
      <div class="mobile-services-head"><span>Service categories</span><a href="${path('service')}">View all services</a></div>
      <div class="mobile-service-groups">
        ${serviceCategories.map((category, index) => `
          <details class="mobile-service-group"${index ? '' : ' open'}>
            <summary><span><b>${category.number}</b>${category.title}</span><i aria-hidden="true">+</i></summary>
            <div>${category.services.map((service) => `<a href="${path(service.href)}">${service.title}</a>`).join('')}<a class="mobile-category-link" href="${path(category.href)}">Explore category →</a></div>
          </details>`).join('')}
      </div>`;
    servicesTrigger.insertAdjacentElement('afterend', megaMenu);
    megaMenu.insertAdjacentElement('afterend', mobileServices);

    const categoryButtons = [...megaMenu.querySelectorAll('.mega-category')];
    const servicesPanel = megaMenu.querySelector('.mega-services');
    const visualPanel = megaMenu.querySelector('.mega-visual');
    let activeCategory = serviceCategories[0];
    let closeTimer;
    let hoverTimer;
    let suppressFocusOpen = false;

    const renderCategory = (category) => {
      if (!category || activeCategory.id === category.id && servicesPanel.children.length) return;
      activeCategory = category;
      categoryButtons.forEach((button) => {
        const active = button.dataset.serviceCategory === category.id;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      servicesPanel.classList.add('is-updating');
      visualPanel.classList.add('is-updating');
      servicesPanel.setAttribute('aria-labelledby', `mega-tab-${category.id}`);
      servicesPanel.innerHTML = `<div class="mega-panel-head"><span>${category.number}</span><div><strong>${category.title}</strong><small>${category.services.length} services</small></div></div><div class="mega-service-list">${category.services.map((service) => `<a href="${path(service.href)}">${service.title}<span aria-hidden="true">↗</span></a>`).join('')}</div>`;
      visualPanel.innerHTML = `<img src="${path(category.image)}" alt="${category.imageAlt}" width="${category.imageWidth}" height="${category.imageHeight}" loading="lazy" decoding="async"><div><span>${category.number} / ${category.title}</span><p>${category.description}</p><a href="${path(category.href)}">Explore category <span aria-hidden="true">→</span></a></div>`;
      requestAnimationFrame(() => {
        servicesPanel.classList.remove('is-updating');
        visualPanel.classList.remove('is-updating');
      });
    };

    const setMegaMenu = (open) => {
      clearTimeout(closeTimer);
      if (open && window.innerWidth <= 960) return;
      serviceBar.classList.toggle('mega-open', open);
      document.body.classList.toggle('mega-menu-open', open);
      servicesTrigger.setAttribute('aria-expanded', String(open));
      megaMenu.setAttribute('aria-hidden', String(!open));
    };
    const scheduleClose = () => { closeTimer = setTimeout(() => setMegaMenu(false), 220); };
    const scheduleCategory = (category) => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => renderCategory(category), 90);
    };

    renderCategory(serviceCategories[0]);
    categoryButtons.forEach((button, index) => {
      const category = serviceCategories[index];
      button.addEventListener('mouseenter', () => scheduleCategory(category));
      button.addEventListener('focus', () => renderCategory(category));
      button.addEventListener('click', () => renderCategory(category));
      button.addEventListener('keydown', (event) => {
        let targetIndex = index;
        if (event.key === 'ArrowDown') targetIndex = (index + 1) % categoryButtons.length;
        else if (event.key === 'ArrowUp') targetIndex = (index - 1 + categoryButtons.length) % categoryButtons.length;
        else if (event.key === 'Home') targetIndex = 0;
        else if (event.key === 'End') targetIndex = categoryButtons.length - 1;
        else if (event.key === 'ArrowRight') {
          event.preventDefault();
          servicesPanel.querySelector('a')?.focus();
          return;
        } else return;
        event.preventDefault();
        categoryButtons[targetIndex].focus();
      });
    });
    servicesPanel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        megaMenu.querySelector('.mega-category.is-active')?.focus();
      }
    });

    servicesTrigger.addEventListener('mouseenter', () => setMegaMenu(true));
    servicesTrigger.addEventListener('focus', () => {
      if (!suppressFocusOpen) setMegaMenu(true);
    });
    serviceBar.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    serviceBar.addEventListener('mouseleave', scheduleClose);
    serviceBar.addEventListener('focusout', (event) => {
      if (!serviceBar.contains(event.relatedTarget)) scheduleClose();
    });
    servicesTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      if (window.innerWidth > 960) {
        setMegaMenu(true);
        return;
      }
      const open = !mobileServices.classList.contains('is-open');
      mobileServices.classList.toggle('is-open', open);
      servicesTrigger.classList.toggle('mobile-open', open);
      servicesTrigger.setAttribute('aria-expanded', String(open));
    });

    mobileServices.querySelectorAll('details').forEach((group) => {
      group.addEventListener('toggle', () => {
        if (!group.open) return;
        mobileServices.querySelectorAll('details').forEach((other) => {
          if (other !== group) other.open = false;
        });
      });
    });

    const backdrop = document.createElement('div');
    backdrop.className = 'mega-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', () => setMegaMenu(false));
    document.addEventListener('pointerdown', (event) => {
      if (window.innerWidth > 960 && !serviceBar.contains(event.target)) setMegaMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && serviceBar.classList.contains('mega-open')) {
        suppressFocusOpen = true;
        setMegaMenu(false);
        servicesTrigger.focus();
        suppressFocusOpen = false;
      }
    });
    window.addEventListener('scroll', () => setMegaMenu(false), { passive: true });
    window.addEventListener('resize', () => {
      setMegaMenu(false);
      if (window.innerWidth > 960) {
        mobileServices.classList.remove('is-open');
        servicesTrigger.classList.remove('mobile-open');
      }
    });
    return { servicesTrigger, megaMenu, mobileServices, setMegaMenu };
  }).catch(() => null)
  : Promise.resolve(null);

if (menuButton && navigation) {
  serviceNavigationReady.then((serviceNavigation) => {
    const closeMenu = (restoreFocus = false) => {
      menuButton.classList.remove('active');
      navigation.classList.remove('open');
      document.body.classList.remove('menu-open', 'mega-menu-open');
      serviceBar?.classList.remove('mega-open');
      serviceNavigation?.mobileServices.classList.remove('is-open');
      serviceNavigation?.servicesTrigger.classList.remove('mobile-open');
      serviceNavigation?.servicesTrigger.setAttribute('aria-expanded', 'false');
      serviceNavigation?.megaMenu.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      if (restoreFocus) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      const open = menuButton.classList.toggle('active');
      navigation.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      if (open) requestAnimationFrame(() => navigation.querySelector(':scope > a')?.focus());
    });

    navigation.querySelectorAll('a:not(.services-trigger)').forEach((link) => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (event) => {
      if (!document.body.classList.contains('menu-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...serviceBar.querySelectorAll('a, button, summary')]
        .filter((element) => element.offsetParent !== null && !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
  });
}

document.querySelectorAll('table.service-table').forEach((table) => {
  const labels = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent.trim());
  if (!labels.length) return;
  table.querySelectorAll('tbody tr').forEach((row) => {
    [...row.cells].forEach((cell, index) => {
      cell.dataset.label = labels[index] || `Detail ${index + 1}`;
    });
  });
});

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

const formReturnStorageKey = 'b2b-form-return';
const getPageLabel = () => {
  const heading = document.querySelector('main h1');
  return (heading?.textContent || document.title.split('|')[0] || 'previous page').trim().replace(/\s+/g, ' ').slice(0, 70);
};

document.querySelectorAll('form[action*="api.web3forms.com/submit"]').forEach((form) => {
  form.querySelectorAll('input[name="name"]').forEach((field) => {
    if (!field.hasAttribute('minlength')) field.minLength = 2;
    if (!field.hasAttribute('maxlength')) field.maxLength = 100;
  });
  form.querySelectorAll('input[type="email"]').forEach((field) => {
    if (!field.hasAttribute('maxlength')) field.maxLength = 254;
  });
  form.querySelectorAll('input[type="tel"]').forEach((field) => {
    if (!field.hasAttribute('minlength')) field.minLength = 8;
    if (!field.hasAttribute('maxlength')) field.maxLength = 20;
    if (!field.hasAttribute('pattern')) field.pattern = '[0-9+() \\-]{8,20}';
  });
  form.querySelectorAll('textarea').forEach((field) => {
    if (!field.hasAttribute('minlength')) field.minLength = 10;
    if (!field.hasAttribute('maxlength')) field.maxLength = 2000;
  });
  const source = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const label = getPageLabel();
  const redirect = form.querySelector('input[name="redirect"]');
  if (redirect?.value) {
    try {
      const destination = new URL(redirect.value, window.location.href);
      destination.searchParams.set('from', source);
      destination.searchParams.set('label', label);
      redirect.value = destination.href;
    } catch (_) { }
  }
  form.addEventListener('submit', () => {
    try { sessionStorage.setItem(formReturnStorageKey, JSON.stringify({ url: source, label })); } catch (_) { }
  });
});

const formReturnButton = document.querySelector('[data-form-return]');
if (formReturnButton) {
  let storedReturn = null;
  try { storedReturn = JSON.parse(sessionStorage.getItem(formReturnStorageKey) || 'null'); } catch (_) { }
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
    } catch (_) { }
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

  const setError = (field, message = '') => {
    const errorId = field?.getAttribute('aria-describedby');
    const error = errorId
      ? document.getElementById(errorId)
      : field?.type === 'radio' ? field.closest('[data-step]')?.querySelector('[data-error]') : null;
    if (error) error.textContent = message;
    const fieldsToMark = field?.type === 'radio'
      ? field.closest('[data-step]')?.querySelectorAll(`input[name="${field.name}"]`)
      : [field];
    fieldsToMark?.forEach((control) => control?.setAttribute('aria-invalid', message ? 'true' : 'false'));
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
    let valid = true;
    const radioGroups = new Set();
    for (const field of step.querySelectorAll('input:not([type="hidden"]), textarea')) {
      if (field.type === 'radio') {
        if (radioGroups.has(field.name)) continue;
        radioGroups.add(field.name);
      }
      const value = field.value.trim();
      let message = '';
      if (field.type === 'radio' && !form.querySelector(`input[name="${field.name}"]:checked`)) {
        message = 'Please choose a service.';
      } else if (field.type === 'checkbox' && field.required && !field.checked) {
        message = 'Please confirm that we may contact you about this enquiry.';
      } else if (field.required && !value) message = 'Please complete this field.';
      else if (field.type === 'email' && !field.validity.valid) message = 'Please enter a valid email address.';
      else if (field.name === 'phone' && !phoneIsValid(value)) message = 'Please enter a valid phone number.';
      else if (field.minLength > 0 && value.length > 0 && value.length < field.minLength) {
        message = `Please enter at least ${field.minLength} characters.`;
      }
      if (message) valid = false;
      setError(field, showError ? message : '');
    }
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
    if (backButton) {
      backButton.hidden = stepIndex === 0;
      backButton.disabled = submitting;
    }
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
    for (let index = 0; index < totalSteps; index += 1) {
      if (!validateStep(steps[index], true)) {
        if (index !== stepIndex) showStep(index);
        validateStep(steps[index], true);
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
    if (target instanceof HTMLTextAreaElement) return;
    if (stepIndex < totalSteps - 1 && target instanceof HTMLInputElement) {
      event.preventDefault();
      goNext();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !validateBeforeSubmit() || !form.reportValidity()) return;
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
      try { result = await response.json(); } catch (_) { }
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
      if (backButton) backButton.disabled = false;
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
      try { result = await response.json(); } catch (_) { }
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
  link.setAttribute('aria-label', 'Email us at B2B Industrial Solutions');
});

document.querySelectorAll('.protected-email[data-user][data-domain][data-tld]').forEach((link) => {
  const { user, domain, tld } = link.dataset;
  if (!user || !domain || !tld) return;
  const address = `${user}@${domain}.${tld}`;
  link.textContent = address;
  link.href = `mailto:${address}`;
  link.setAttribute('aria-label', `Email ${address}`);
});

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => { });
    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith('b2b-industrial-')).map((key) => caches.delete(key))))
        .catch(() => { });
    }
  }, { once: true });
}
