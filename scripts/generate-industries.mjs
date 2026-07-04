import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'industries');
mkdirSync(output, { recursive: true });

const sectors = [
  {
    slug: 'manufacturing',
    title: 'Industrial Audit Services for Manufacturing Plants in India',
    description: 'Energy, electrical safety, fire, HSE and environmental audits for manufacturing plants, with practical engineering support from assessment to implementation.',
    badge: 'Manufacturing plants',
    intro: 'Manufacturing facilities need more than a generic checklist. Production loads, utility systems, hazardous processes, maintenance windows and statutory duties must be assessed together so recommendations are safe, measurable and realistic to execute.',
    image: 'audits-electrical.webp',
    imageAlt: 'Engineer conducting an electrical and energy audit in a manufacturing plant',
    priorities: [
      ['Energy performance', 'Map electricity, fuel, steam, compressed air, pumping, cooling and production loads against output. The audit identifies avoidable base load, distribution losses, poor controls and equipment operating outside its efficient range.'],
      ['Electrical risk', 'Review single-line diagrams, protection settings, earthing, panels, cable loading, harmonics and thermal anomalies. Findings are ranked by consequence and urgency rather than delivered as an undifferentiated defect list.'],
      ['Fire and process safety', 'Examine ignition sources, fire load, detection and suppression, emergency access, permit systems, chemical handling and the interaction between process hazards and life-safety controls.'],
      ['Environmental compliance', 'Assess emissions, effluent, waste handling, consent conditions, monitoring records and operational controls so gaps can be converted into accountable corrective actions.'],
    ],
    systems: ['Transformers, switchgear, panels and earthing', 'Motors, drives, pumps, fans and compressors', 'Boilers, furnaces, steam and condensate systems', 'HVAC, process cooling and ventilation', 'Fire detection, suppression and emergency systems', 'Stacks, DG sets, emissions and waste streams'],
    workflow: [
      ['1. Scope and data review', 'We align the audit boundary with production areas, utilities, shifts and available bills, drawings, logs and statutory records.'],
      ['2. Site measurements', 'Engineers inspect operating conditions and use appropriate instruments for electrical, thermal, combustion, airflow, lux, power-quality and environmental measurements.'],
      ['3. Risk and savings analysis', 'Each observation is supported by evidence, consequence, corrective action, responsibility and—where relevant—estimated cost, savings and payback.'],
      ['4. Closure support', 'The final review helps plant teams sequence quick wins, shutdown work, capital projects and verification so the report becomes an implementation plan.'],
    ],
    links: [
      ['Energy audit services', '../services/comprehensive-energy-audit.html'],
      ['Electrical safety audit', '../services/electrical-safety-audit.html'],
      ['Fire and life-safety audit', '../services/fire-life-safety.html'],
      ['Environmental compliance', '../services/environment-compliances.html'],
      ['Manufacturing energy-audit guide', '../blog/annual-energy-audit-manufacturing.html'],
      ['Cement plant case study', '../case-studies/cement-plant-energy-audit.html'],
    ],
  },
  {
    slug: 'commercial-buildings',
    title: 'Energy, Fire & Electrical Audits for Commercial Buildings',
    description: 'Integrated energy, HVAC, indoor-air-quality, electrical and fire-safety audits for offices, malls, hotels and commercial campuses across India.',
    badge: 'Commercial buildings',
    intro: 'A commercial building must balance occupant comfort, uptime, energy cost and life safety every day. An integrated audit reveals how schedules, controls, maintenance, tenant loads and central utilities interact—often exposing improvements that isolated equipment checks miss.',
    image: 'hvac-projects.webp',
    imageAlt: 'Engineer reviewing HVAC and building systems in a commercial facility',
    priorities: [
      ['HVAC and indoor air quality', 'Review chillers, cooling towers, pumps, AHUs, ventilation, filtration, air balance, controls and operating schedules. Measurements connect comfort complaints and IAQ risk with actual equipment performance.'],
      ['Electrical reliability', 'Assess incoming supply, transformers, DG backup, UPS systems, panels, earthing, protection coordination, power quality and thermography for safer continuous operation.'],
      ['Fire and life safety', 'Verify means of egress, compartmentation, fire doors, detection, alarm, hydrant and sprinkler readiness, emergency lighting, signage and drill arrangements across occupied and back-of-house areas.'],
      ['Energy and ESG data', 'Build an auditable baseline for electricity, fuel, water and emissions, normalize performance for occupancy and weather, and identify projects that support operating budgets and sustainability reporting.'],
    ],
    systems: ['Chillers, cooling towers, pumps and AHUs', 'Fresh-air, exhaust, filtration and air balance', 'Transformers, DG sets, UPS and distribution panels', 'Lighting, controls, lifts and tenant loads', 'Fire alarm, hydrant, sprinkler and egress systems', 'Water use, waste handling and carbon data'],
    workflow: [
      ['1. Occupancy-led planning', 'The scope reflects operating hours, tenant areas, critical rooms, seasonal loads and access restrictions so investigation causes minimal disruption.'],
      ['2. Trend and field measurement', 'Bills and BMS trends are checked against power, temperature, humidity, airflow, lux, thermal and equipment-level observations.'],
      ['3. Coordinated recommendations', 'Actions are grouped into controls and scheduling, maintenance corrections, risk closures and capital upgrades with a clear implementation order.'],
      ['4. Performance verification', 'Savings and comfort improvements can be checked against agreed baselines, while safety actions are tracked through evidence-based closure.'],
    ],
    links: [
      ['HVAC audit and projects', '../services/hvac-projects.html'],
      ['Air balancing services', '../services/air-balancing.html'],
      ['Electrical safety audit', '../services/electrical-safety-audit.html'],
      ['Fire and life-safety audit', '../services/fire-life-safety.html'],
      ['Carbon-footprint assessment', '../services/carbon-footprint.html'],
      ['HVAC maintenance guide', '../blog/hvac-maintenance-best-practices.html'],
    ],
  },
  {
    slug: 'data-centres',
    title: 'Energy & Electrical Safety Audits for Data Centres in India',
    description: 'Data-centre energy, power-quality, electrical safety, cooling and fire-risk audits designed around uptime, redundancy and controlled implementation.',
    badge: 'Data centres',
    intro: 'Data-centre audits must improve efficiency and reduce risk without weakening resilience. The assessment therefore considers the full operating chain—from incoming power and standby systems to cooling, airflow, detection and response—alongside redundancy, maintenance states and change control.',
    image: 'engineering-knowledge.webp',
    imageAlt: 'Engineering team reviewing electrical and cooling performance for critical infrastructure',
    priorities: [
      ['Power chain resilience', 'Review transformers, HT/LT switchgear, UPS systems, batteries, PDUs, earthing, protection, loading and standby generation across normal, maintenance and contingency configurations.'],
      ['Power quality and thermography', 'Measure harmonics, imbalance, voltage events, power factor and thermal condition at agreed points. Findings distinguish developing defects from loading or design conditions that require deeper engineering review.'],
      ['Cooling and airflow', 'Assess cooling-unit performance, containment, rack inlet conditions, bypass and recirculation, setpoints, humidity, airflow and controls to find efficiency opportunities within safe environmental limits.'],
      ['Fire and operational controls', 'Examine early detection, alarm interfaces, suppression readiness, compartmentation, cable and battery hazards, emergency procedures and the permit and escalation controls surrounding critical work.'],
    ],
    systems: ['HT/LT distribution and protection', 'UPS, batteries, PDUs and standby generation', 'Earthing, harmonics and power quality', 'CRAC/CRAH units, chillers and containment', 'Detection, clean-agent suppression and compartmentation', 'BMS/DCIM trends, alarms and operating procedures'],
    workflow: [
      ['1. Risk-controlled scope', 'Stakeholders agree boundaries, redundancy states, restricted assets, switching constraints, method statements and escalation routes before fieldwork begins.'],
      ['2. Non-intrusive assessment', 'Records, trends and visual checks are combined with approved measurements while respecting access, ESD, security and live-system procedures.'],
      ['3. Criticality-based reporting', 'Recommendations identify the affected system, failure consequence, supporting evidence, safe next action and any prerequisite engineering study or shutdown.'],
      ['4. Governed implementation', 'Corrective work is sequenced through change control, vendor coordination, testing and rollback planning, with verification evidence retained for assurance.'],
    ],
    links: [
      ['Power-quality audit', '../services/power-quality-audit.html'],
      ['Electrical thermography', '../services/electrical-thermography.html'],
      ['Electrical safety audit', '../services/electrical-safety-audit.html'],
      ['HVAC design services', '../services/hvac-design.html'],
      ['Fire detection systems', '../services/fire-detection.html'],
      ['Battery storage guide', '../blog/battery-energy-storage-factory-backup.html'],
    ],
  },
];

const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const cards = (items) => items.map(([heading, body]) => `<article><h3>${esc(heading)}</h3><p>${esc(body)}</p></article>`).join('');
const footer = `<footer id="footer"><div class="shell footer-top"><div class="footer-brand"><img src="../assets/images/logo.webp" alt="B2B Industrial Solutions"><p>Audits, compliance and turnkey engineering solutions for safer, efficient and future-ready industrial operations.</p><a class="footer-cta" href="../contact.html">Discuss your requirement <span>›</span></a></div><div class="footer-links"><b>Audits &amp; compliance</b><a href="../services/energy-audits.html">Energy audits</a><a href="../services/electrical-safety-audit.html">Electrical safety</a><a href="../services/fire-life-safety.html">Fire &amp; HSE audits</a><a href="../services/compliances.html">Statutory compliance</a></div><div class="footer-links"><b>Engineering projects</b><a href="../services/hvac-projects.html">HVAC &amp; duct cleaning</a><a href="../services/emission-control.html">Emission control</a><a href="../services/electrical-projects.html">Electrical projects</a><a href="../services/fire-projects.html">Fire projects</a></div><div class="footer-links"><b>Company</b><a href="../about.html">About us</a><a href="../blog/">Insights</a><a href="../service.html">All services</a><a href="../faq.html">FAQs</a></div><div class="footer-links footer-contact"><b>Contact</b><a href="tel:+919899702065">+91 98997 02065</a><a href="mailto:info@b2bindustrial.in">info@b2bindustrial.in</a><p>Head office: Khandsa Road<br>Gurugram, Haryana 122001<br>Pan-India project delivery</p></div></div><div class="shell footer-bottom"><span>© <span data-current-year></span> B2B Industrial Solutions</span><div><a href="../privacy.html">Privacy</a><a href="../terms.html">Terms</a><a href="#top">Back to top ↑</a></div></div></footer>`;
const header = (label) => `<a class="skip-link" href="#main">Skip to content</a><header class="site-header" id="top"><div class="global-bar"><div class="shell global-bar-inner"><a class="brand" href="../index.html" aria-label="B2B Industrial Solutions home"><img src="../assets/images/logo.webp" alt="B2B Industrial Solutions"></a><nav class="global-nav" aria-label="Company navigation"><a href="../about.html">About</a><a href="./">Industries</a><a href="../case-studies/cement-plant-energy-audit.html">Case studies</a><a href="../blog/">Insights</a><a href="../contact.html">Contact</a></nav><div class="header-contact"><span>Pan-India service</span><a href="tel:+919899702065" class="global-phone">+91 98997 02065</a></div></div></div><div class="service-bar"><div class="shell nav-wrap"><button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button><nav class="main-nav" aria-label="Primary services"><a href="../services/energy-audits.html">Audits</a><a href="../services/compliances.html">Compliance</a><a href="../services/hvac-projects.html">HVAC &amp; IAQ</a><a href="../services/fire-life-safety.html">Fire &amp; HSE</a><a href="../service.html">All services</a></nav><a class="button nav-cta" href="../contact.html">Request a site visit</a></div></div></header><div class="page-context"><div class="shell"><span>Industries</span><b>${esc(label)}</b><a href="../contact.html">Discuss a project</a></div></div>`;

function sectorPage(sector) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="${esc(sector.description)}"><title>${esc(sector.title)}</title><link rel="stylesheet" href="../css/core.min.css"><link rel="stylesheet" href="../css/content.min.css"><link rel="stylesheet" href="../css/blogs.min.css"><link rel="stylesheet" href="../css/responsive.min.css"></head><body class="interior-page blogs-page">${header(sector.badge)}<main id="main" class="legacy-content"><section class="blog-post-hero"><div class="container"><span class="blog-category-badge">${esc(sector.badge)}</span><h1>${esc(sector.title)}</h1><p class="blog-hero-desc">${esc(sector.intro)}</p></div></section><nav class="blog-breadcrumb-bar" aria-label="Breadcrumb"><div class="container"><ol class="breadcrumb-list"><li><a href="../index.html">Home</a></li><li class="sep">/</li><li><a href="./">Industries</a></li><li class="sep">/</li><li>${esc(sector.badge)}</li></ol></div></nav><section class="blog-content-section"><div class="container"><article class="blog-article-wrapper"><figure class="page-editorial-visual"><img src="../assets/images/editorial/${sector.image}" alt="${esc(sector.imageAlt)}" width="1600" height="900"></figure><h2>Audit priorities for ${esc(sector.badge.toLowerCase())}</h2><div class="service-benefits-grid">${cards(sector.priorities)}</div><h2>Systems included in a coordinated review</h2><p>The final scope is agreed for each facility, but a coordinated assessment commonly covers the following systems and their interfaces:</p><ul>${sector.systems.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><h2>From site survey to measurable closure</h2>${sector.workflow.map(([heading, body]) => `<h3>${esc(heading)}</h3><p>${esc(body)}</p>`).join('')}<p class="article-highlight">The useful output is not simply a compliance score. It is a prioritized, evidence-backed action register that operations, EHS, maintenance and management can own together.</p><h2>Relevant services and practical guidance</h2><ul>${sector.links.map(([label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul><h2>Plan a site-specific audit</h2><p>Share the facility type, location, approximate area or connected load, operating pattern and the audit objective. We will help define a proportionate scope, required records, site time and deliverables before work begins.</p><div class="blog-cta-banner"><h3>Build the right audit scope for your facility</h3><p>Discuss risks, utilities, compliance priorities and implementation requirements with our engineering team.</p><a href="../contact.html" class="btn-primary">Request a consultation</a></div></article></div></section></main>${footer}<script src="../js/core.min.js" defer></script></body></html>`;
}

const indexCards = sectors.map((sector) => `<article><h2><a href="./${sector.slug}.html">${esc(sector.badge)}</a></h2><p>${esc(sector.description)}</p><a href="./${sector.slug}.html">Explore ${esc(sector.badge.toLowerCase())} services →</a></article>`).join('');
const index = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Sector-specific industrial audits, compliance and engineering services for manufacturing plants, commercial buildings and data centres across India."><title>Industries We Serve | Industrial Audits & Engineering</title><link rel="stylesheet" href="../css/core.min.css"><link rel="stylesheet" href="../css/content.min.css"><link rel="stylesheet" href="../css/blogs.min.css"><link rel="stylesheet" href="../css/responsive.min.css"></head><body class="interior-page blogs-page">${header('Industries we serve')}<main id="main" class="legacy-content"><section class="blog-post-hero"><div class="container"><span class="blog-category-badge">Sector expertise</span><h1>Industrial audit and engineering services by sector</h1><p class="blog-hero-desc">The same checklist does not fit every facility. Explore audit priorities, systems, deliverables and implementation paths designed around the risks and operating realities of each sector.</p></div></section><section class="blog-content-section"><div class="container"><article class="blog-article-wrapper"><figure class="page-editorial-visual"><img src="../assets/images/editorial/engineering-knowledge.webp" alt="Industrial engineers planning a sector-specific audit" width="1600" height="900"></figure><h2>Choose your facility type</h2><div class="service-benefits-grid">${indexCards}</div><h2>One integrated view of risk, cost and compliance</h2><p>Energy, electrical, fire, HSE, HVAC and environmental performance are connected. A change that saves energy can affect ventilation or resilience; an electrical correction may need a shutdown; a compliance gap may require both documentation and physical work. Our approach brings these dependencies into one practical plan.</p><h2>Pan-India assessment and execution support</h2><p>Our registered office is in Gurugram and projects are delivered across India. Engagements can cover a single facility or a coordinated multi-site programme with standard methods, consolidated reporting and local site schedules.</p><p>Not sure which service matches the requirement? Review <a href="../service.html">all industrial services</a>, browse our <a href="../locations/">service locations</a>, or share the site objective directly with the engineering team.</p><div class="blog-cta-banner"><h3>Tell us about your facility</h3><p>We will help translate the operating need into a clear audit or engineering scope.</p><a href="../contact.html" class="btn-primary">Discuss your requirement</a></div></article></div></section></main>${footer}<script src="../js/core.min.js" defer></script></body></html>`;

writeFileSync(join(output, 'index.html'), index, 'utf8');
for (const sector of sectors) writeFileSync(join(output, `${sector.slug}.html`), sectorPage(sector), 'utf8');
console.log(`Generated ${sectors.length + 1} industry pages.`);
