# B2B Industrial Solutions

This website runs as static HTML, CSS, and JavaScript. Production hosting does not require Node.js, npm, a database, or a JavaScript framework.

## Local maintenance

The files in `scripts/` are optional maintenance tools for checking links, refreshing SEO metadata and discovery files, optimizing images, and running a local preview. They are not downloaded by website visitors and are not part of the production runtime.

Run the repeatable SEO and discovery workflow after changing pages:

```powershell
node scripts/generate-discovery.mjs
node scripts/check-site.mjs
```

`node_modules/` is ignored and is not needed for the website itself. Only install local development dependencies if a maintenance command explicitly needs them.
