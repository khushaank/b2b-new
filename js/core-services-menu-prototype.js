const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const serviceBar = document.querySelector('.service-bar');
const siteRootUrl = new URL('../', document.currentScript?.src || window.location.href);
const companyLinks = [
  ['Testimonials', 'testimonials'],
  ['Careers', 'careers'],
];
const globalNav = document.querySelector('.global-nav');
companyLinks.forEach(([label, path]) => {
  if (globalNav && ![...globalNav.querySelectorAll('a')].some((link) => link.textContent.trim() === label)) {
    const link = document.createElement('a');
    link.href = new URL(path, siteRootUrl).pathname;
    link.textContent = label;
    globalNav.insertBefore(link, globalNav.querySelector('a[href*="contact"]') || null);
  }
  const companyFooter = [...document.querySelectorAll('.footer-links')]
    .find((section) => section.querySelector('b')?.textContent.trim() === 'Company');
  if (companyFooter && ![...companyFooter.querySelectorAll('a')].some((link) => link.textContent.trim() === label)) {
    const link = document.createElement('a');
    link.href = new URL(path, siteRootUrl).pathname;
    link.textContent = label;
    companyFooter.append(link);
  }
});

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
    const serviceCategories = [
      ['Audits & Compliance', 'audits', [
        ['Sustainability & ESG Audits', 'services/audits-sustainability'], ['Chartered Engineering Services', 'services/chartered-engineering'], ['Statutory Compliances & Approvals', 'services/compliances'], ['Comprehensive Energy Audit', 'services/comprehensive-energy-audit'], ['Industrial Cyber Security (OT)', 'services/cyber-audits'], ['Earthing & Grounding Audit', 'services/earthing-audit'], ['Electrical Compliance', 'services/electrical-compliance'], ['Electrical Safety Audit', 'services/electrical-safety'], ['Electrical Safety Audit (ESA)', 'services/electrical-safety-audit'], ['Fire Compliance & Audit', 'services/fire-compliance'], ['Life Safety Audits', 'services/fire-life-safety'], ['Fire Load Study', 'services/fire-load-study'], ['Fire NOC Support', 'services/fire-noc'], ['Lift NOC & Approvals', 'services/lift-noc'], ['Factory License & Municipal Approvals', 'services/mcd-noc'], ['NABL Testing & Noise Monitoring', 'services/nabl-testing'], ['Power Quality & Harmonic Audit', 'services/power-quality-audit'], ['Water Audit', 'services/water-audit'], ['Workplace Well-Being Audit', 'services/well-being-audit'],
      ]],
      ['Safety & Risk', 'safety', [
        ['Behavioural Based Safety', 'services/behavioural-safety'], ['Behavioural Safety Training', 'services/behavioural-safety-training'], ['Disaster Management Plans', 'services/disaster-management'], ['Mock Drills & Simulations', 'services/drills-simulation'], ['E-HAZOP Study', 'services/e-hazop'], ['Emergency Preparedness Plan', 'services/emergency-preparedness'], ['Workplace Ergonomics', 'services/ergonomics'], ['First Aid & Medical Facilities', 'services/first-aid-facilities'], ['HIRA - Risk Assessment', 'services/hira'], ['Incident & Near-Miss Reporting', 'services/incident-reporting'], ['Occupational Health Risk Assessment', 'services/occupational-health'], ['Permit-to-Work Systems Audit', 'services/permit-to-work'], ['POSH Training & Compliance', 'services/posh-training'], ['Process Safety Management', 'services/process-safety'], ['Risk Management Services', 'services/risk-management'], ['Tool Box Talks', 'services/tbt'],
      ]],
      ['Electrical & Energy', 'electrical', [
        ['Arc Flash Study', 'services/arc-flash-study'], ['Cable Laying & Termination', 'services/cable-laying'], ['Cable Management Systems', 'services/cable-tray'], ['Earthing & Lightning Protection', 'services/earthing-projects'], ['Electrical Projects', 'services/electrical-projects'], ['Electrical Goods Supply', 'services/electrical-sales'], ['Infrared Thermography', 'services/electrical-thermography'], ['Energy Audit', 'services/energy-audits'], ['Energy Saving Projects', 'services/energy-saving-projects'], ['EV Charging Solutions', 'services/ev-charging'], ['Gas & Diesel Generator Sets', 'services/gas-dg'], ['Harmonic Analysis & Mitigation', 'services/harmonic-analysis'], ['Lightning Protection System', 'services/lightning-protection'], ['Distribution Panel Projects', 'services/panel-projects'], ['Power Quality Analysis', 'services/power-quality-analysis'], ['Renewable Energy Solutions', 'services/renewable-energy'], ['Solar Projects - EPC Services', 'services/solar-projects'], ['Steam System Analysis', 'services/steam-analysis'], ['Thermography & Infrared Scanning', 'services/thermography'], ['Transformer Dehydration', 'services/transformer-dehydration'],
      ]],
      ['HVAC & Environment', 'hvac', [
        ['Air Balancing & IAQ', 'services/air-balancing'], ['Boiler Efficiency Testing', 'services/boiler-efficiency'], ['Carbon Footprint Study', 'services/carbon-footprint'], ['Compressed Air Leakage Testing', 'services/compressed-air-testing'], ['New CPCB IV+ DG Sets', 'services/cpcb-dgs'], ['Robotic Duct Cleaning', 'services/duct-cleaning'], ['Emission Control Systems', 'services/emission-control'], ['Environment Compliances', 'services/environment-compliances'], ['E-Waste Solutions', 'services/e-waste-solutions'], ['HVAC Design to Execution', 'services/hvac-design'], ['HVAC Installation & Commissioning', 'services/hvac-installation'], ['HVAC Projects', 'services/hvac-projects'], ['OCEMS Projects', 'services/ocems'], ['RECD & DFK Kits', 'services/recd-kit'], ['Stack & Duct Cleaning', 'services/stack-cleaning'], ['Stack Emission Testing', 'services/stack-emission'], ['Industrial Ventilation Projects', 'services/ventilation-projects'], ['Waste Management Solutions', 'services/waste-management'],
      ]],
      ['Lighting', 'lighting', [
        ['Industrial Lighting Solutions', 'services/industrial-lighting'], ['Lighting Projects', 'services/lighting-projects'], ['Office Lighting Solutions', 'services/office-lighting'], ['Outdoor Lighting', 'services/outdoor-lighting'], ['Poles & Designer Lights', 'services/poles-designer-lights'], ['Smart Lighting Solutions', 'services/smart-lighting'], ['Solar Lighting Solutions', 'services/solar-lighting'], ['Wall Mount & Step Lights', 'services/wall-mount-lighting'],
      ]],
      ['Design & Projects', 'design', [
        ['Execution Support', 'services/execution-recommendations'], ['Featured Products', 'services/featured-products'], ['Fire Detection Systems', 'services/fire-detection'], ['Fire Rated Doors', 'services/fire-doors'], ['Fire Extinguishers', 'services/fire-extinguishers'], ['Fire Protection Projects', 'services/fire-projects'], ['FM 200 & Kitchen Suppression', 'services/fm200'], ['Interior Design Projects', 'services/interior-design'], ['Project Management', 'services/project-management'], ['Public Address Systems', 'services/public-address'], ['Repair & Maintenance Services', 'services/repair-maintenance'],
      ]],
    ];
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

    const cascadeMenu = document.createElement('div');
    cascadeMenu.className = 'services-cascade';
    megaMenu.removeAttribute('id');
    cascadeMenu.id = 'services-mega-menu';
    cascadeMenu.setAttribute('aria-label', 'Services menu');
    cascadeMenu.innerHTML = `<div class="services-cascade-categories">${serviceCategories.map(([name, id], index) => `<button type="button" class="services-category${index ? '' : ' is-active'}" aria-current="${index === 0 ? 'true' : 'false'}" data-category="${id}">${name}<span aria-hidden="true">›</span></button>`).join('')}</div><div class="services-cascade-panel"></div>`;
    megaMenu.insertAdjacentElement('afterend', cascadeMenu);

    const categoryButtons = [...cascadeMenu.querySelectorAll('.services-category')];
    const categoryPanel = cascadeMenu.querySelector('.services-cascade-panel');
    const showCategory = (id) => {
      const category = serviceCategories.find(([, categoryId]) => categoryId === id);
      if (!category) return;
      const [name, categoryId, services] = category;
      categoryButtons.forEach((button) => {
        const active = button.dataset.category === categoryId;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-current', String(active));
      });
      categoryPanel.innerHTML = `<span class="services-cascade-kicker">${name}</span><div class="services-cascade-links">${services.map(([label, path]) => `<a href="${prefix}${path}">${label}<span aria-hidden="true">→</span></a>`).join('')}</div><a class="services-cascade-all" href="${prefix}service#${categoryId}">View all ${name} services <span aria-hidden="true">→</span></a>`;
    };
    categoryButtons.forEach((button) => {
      button.addEventListener('mouseenter', () => showCategory(button.dataset.category));
      button.addEventListener('focus', () => showCategory(button.dataset.category));
      button.addEventListener('click', () => showCategory(button.dataset.category));
    });
    showCategory('audits');

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
  if (!form.querySelector('input[name="consent"]')) {
    const consent = document.createElement('label');
    consent.className = 'form-consent';
    consent.innerHTML = '<input type="checkbox" name="consent" value="Agreed" required> <span>I agree that B2B Industrial Solutions may contact me regarding this enquiry.</span>';
    const actions = form.querySelector('.step-form-actions');
    if (actions) actions.before(consent);
    else form.querySelector('button[type="submit"], input[type="submit"]')?.before(consent);
  }
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
