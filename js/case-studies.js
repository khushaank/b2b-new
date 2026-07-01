document.querySelectorAll('.metric-card strong, .result-card strong').forEach((metric) => metric.setAttribute('aria-label', metric.textContent.trim()));
