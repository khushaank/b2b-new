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

## Preview and validate

```powershell
node tools/preview-server.mjs
node tools/check-site.mjs
```

The preview runs at `http://127.0.0.1:4173`. The checker validates heading structure, duplicate IDs, and local links/assets across the full site.

## Rebuild

Run from the parent repository when the original site content changes:

```powershell
node premium-homepage\build-site.mjs
```
