# B2B Industrial Solutions — Premium Website

Complete static website for B2B Industrial Solutions, with a shared responsive design system across the homepage, company pages, service catalogue, 92 service pages, case studies, insights, locations, tools, policies, and system/error states.

## Page groups

- `index.html` — premium homepage
- `services/` — service detail pages
- `blog/` — insights index and articles
- `locations/` — location landing pages
- `tools/` — engineering calculators
- `case-studies/` — project outcome stories
- Root pages — About, Clients, Contact, FAQ, Services, policies, and system pages

## Design system

- `css/core.css` — global tokens, header, navigation, and footer
- `css/content.css` — shared interior-page typography and components
- `css/home.css` — homepage
- `css/services.css` — service detail pages
- `css/blogs.css` — insights
- `css/locations.css` — location pages
- `css/tools.css` — engineering tools
- `css/case-studies.css` — case studies
- `css/core-pages.css` — company, catalogue, policy, and system pages
- `css/responsive.css` — shared responsive rules

## Assets

- `assets/images/home/` — homepage imagery
- `assets/images/services/` — service-category imagery
- `assets/images/case-studies/` — case-study graphics
- `assets/images/client-logo/` — client marks
- `assets/images/editorial/` — optimized WebP editorial imagery used across content pages
- `assets/images/pwa/` — installable-app icons
- `assets/js/search-data.min.js` — whole-site command palette index, loaded on demand

## Preview and validate

```powershell
node scripts/preview-server.mjs
node scripts/check-site.mjs
node scripts/check-service-worker.mjs
node scripts/enhance-seo.mjs
node scripts/generate-discovery.mjs
python scripts/optimize_images.py --help
```

The preview runs at `http://127.0.0.1:4173`. The checker validates heading structure, duplicate IDs, and local links/assets across the full site.

`enhance-seo.mjs` refreshes canonical URLs, social metadata, structured data, image hints, the XML sitemap, robots rules, and the load-synced preloader across every HTML page. It runs automatically after a rebuild.

`generate-discovery.mjs` refreshes RSS, the image sitemap, OpenSearch, AI-readable `llms.txt`, Dublin Core metadata, and the schema catalogue. `sw.js`, `site.webmanifest`, and `offline.html` provide installable and offline behavior. The preloader follows the real page `load` event and does not impose an artificial minimum delay.

## Rebuild

Run from the parent repository when the original site content changes:

```powershell
node premium-homepage\build-site.mjs
```
