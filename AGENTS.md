# template-website — instructions for LLMs

A template for multi-page websites/SPAs built with **TypeScript, native Web Components (shadow DOM), plain HTML/CSS, and Vite**. No UI framework. Package manager: **pnpm** (Node >= 24). Copy the template, rename, and build the app in `src/`.

The reusable code lives in two git submodules under `library/`. **Read their guides before writing code that uses them:**

- [library/lib-fe/AGENTS.md](library/lib-fe/AGENTS.md): front-end library (Navigator/router and dialogs, State, Translator, shared styles, components, HTTP/DPoP, DOM helpers).
- [library/lib/AGENTS.md](library/lib/AGENTS.md): environment-neutral utilities (Logger, string/date helpers, uuid, shared auth/user types).

Do not edit the submodules to serve this app (they are separate repositories shared by other projects); put app-specific code in `src/`. Change a submodule only when the task is explicitly about the library, and then commit it in its own repository.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | typecheck, then the Vite dev server (port 5173, exposed to the local network) |
| `pnpm typecheck` | `tsc --noEmit` (strict) |
| `pnpm test` | typecheck, then `vitest --run` (jsdom) |
| `pnpm build` | production build to `dist/` |
| `pnpm preview` | build, then preview |

Always finish a change by running `pnpm test`. Tests are named `*.test.ts` and sit next to the code they test. `library` is aliased in both `vite.config.ts` and `vitest.config.ts` (and `tsconfig.json` `paths`); keep the three in sync if the alias ever changes.

## Layout

```
index.html            main SPA entry (nav, <main id="app">, footer)
contact.html          separate static page: its own entry in vite.config.ts, with src/contact.ts
src/main.ts           app bootstrap: register components, create State + Navigator
src/data/routes.ts    routes + aliases
src/data/config.ts    domainRoot (canonical URLs)
src/util/constants.ts AppName and other app constants
src/styles/style.css  global styles and theme variables (imports the library reset)
src/components/<tag>/ one folder per web component: script.ts, doc.html, styles.css
public/               files served as-is (e.g. test-document.json, icons, favicon)
library/lib-fe, library/lib    submodules (see above)
```

## How the app works

1. `index.html` provides the shell (`nav`, `<main id="app">`, `footer`). The body starts with class `app-loading`, and `main.ts` removes it once ready, so there is no flash of unstyled content.
2. `src/main.ts` imports every component script (importing is what registers the custom element), creates `State.getInstance(AppName)`, then `Navigator.getInstance(domainRoot, '#app', routes, aliases)`.
3. The Navigator maps the URL path to a route, creates the route's custom element inside `#app`, and updates the title, description, canonical link and structured data.
4. Components talk to each other through **State observables** and **bubbling, composed custom events** (never by reaching into each other), and to the server through `util/Requests`.

Routes are the single source of truth for pages and their SEO metadata. See the `Route` type and Navigator section of the lib-fe guide for params (`product/:id`), nested pages, `resolve`, `navData`, and dialogs.

## Adding a page (checklist)

1. Copy `library/lib-fe/components/--- template (app)/` to `src/components/<tag-name>/` (tag must contain a hyphen). Rename `componentName` and the class; remove `declareSubContainer` if the page has no sub-pages (the template version throws).
2. Replace `State.getInstance("...")` with `State.getInstance(AppName)` (import from `src/util/constants`).
3. Write the markup in `doc.html`, the styles in `styles.css`, the behaviour in `script.ts`.
4. Import it in `src/main.ts`.
5. Add the route in `src/data/routes.ts` (`content` is the tag name; give a real `title`, `description`, and `pathType`).
6. Add the navigation link in `index.html` and, in `main.ts`, wire it to `Navigator.followLink(...)` inside `customElements.whenDefined(...)`. Keep the real `href` on the `<a>` so the link works without JS and for crawlers.
7. If the page needs data, load it in `connectedCallback`; if the data turns out not to exist, call `Navigator.notFound()`; if you learn a better title, call `Navigator.setMetadata(...)`.
8. Run `pnpm test`.

A separate static page (like `contact.html`) is a new HTML file plus an entry under `build.rollupOptions.input` in `vite.config.ts`, and it should import `./styles/style.css` through its own small script.

## Component rules

All the conventions are in the lib-fe guide ("Writing a new component"); the essentials:

- Shadow DOM, one shared `CSSStyleSheet` per component made from `resetStyles` + the app's `style.css` (if it needs the theme) + the component's `styles.css`, all imported with `?inline`. Markup in `doc.html` imported with `?raw`.
- No DOM work in the constructor. One-time setup in `connectedCallback` guarded by `this.initialised`. Clean up global things (State subscriptions, Translator registrations, `window`/`document` listeners) in `disconnectedCallback`.
- Inputs are attributes (declare `observedAttributes`, convert in getters; JSON for objects). Pages must react to `nav-data` changes in `attributeChangedCallback` because the Navigator updates them in place.
- Look elements up through the shadow root, never through `document`.
- Never write user-supplied or fetched text with `innerHTML`; use `textContent`/`innerText` or build elements. (`innerHTML` is acceptable only for bundled, trusted markup such as icons.)

## Styling

- Theme through CSS custom properties on `:root` in `src/styles/style.css` (e.g. `--colour-*`, `--font-sans`). Custom properties and `color` inherit into shadow roots; other global selectors do not, so style components inside their own `styles.css`.
- Support light and dark via `prefers-color-scheme`.
- Use `:host` for the element itself; prefer `rem`/`dvh`/grid/flex, and make layouts responsive.
- Shared or app-wide overrides of library components: `registerStyles(name, css)` and the `styles="name"` attribute, not edits to the library.

## State, i18n and data

- App state goes in `State` observables (named without dots; `localStorage: true` for what must survive a reload). Subscribe in `connectedCallback`, unsubscribe in `disconnectedCallback`. Treat values as immutable copies; write back with `updateObservable`.
- Observable names and other shared strings are constants in `src/util/constants.ts`, not scattered literals.
- User-visible text should be translatable: give the elements ids, define `translations` keyed by those ids, and use the `i18n` attribute and `Translator` (see lib-fe guide). Set `<html lang>` accordingly.
- HTTP: `requestGet` / `requestPost` from lib-fe. Use `withAuth = true` only for endpoints that require the DPoP-bound token. Handle rejected promises (non-2xx throws) and show the failure in the UI.
- Static data and sample documents live in `public/` and are fetched by URL.

## SEO and accessibility

- Every route has a unique `title` and `description`; set `domainRoot` in `src/data/config.ts` to the real production origin (it forms the canonical URLs).
- Use semantic elements (`nav`, `main`, `article`, `button` for actions, `a` with `href` for navigation), labels for inputs, `alt` text, `aria-label` for icon-only controls, and keep focus handling sane in dialogs (the Navigator uses native `<dialog>`).
- Production hosting must serve `index.html` for unknown paths (SPA fallback) so deep links work, and must serve `contact.html` and other static entries directly.

## Code style

- TypeScript `strict`; avoid `any` (the library uses it for observable values only), annotate public method signatures, and use `import type` / plain imports as the existing files do.
- Use the Logger (`Logger.getInstance()`), not `console.log`. Set the level in `main.ts` (`debug` while developing; leave `error` in production).
- Small, single-purpose files and functions. Match the surrounding formatting (2-space indent, double quotes in component scripts, trailing semicolons).
- Do not add dependencies without a reason: the project deliberately has only Vite, TypeScript, Vitest, jsdom and lodash. `pnpm-workspace.yaml` enforces a release-age delay and blocks exotic or downgraded packages; do not weaken those settings.
- Do not commit `dist/` or `node_modules/`.

## Pitfalls

- A component that is not imported in `main.ts` is never registered, so its route renders an empty unknown element.
- A route's `content` must exactly match the component's tag name.
- Copying a component template without renaming the tag causes a `customElements.define` collision (an error at load).
- The `library/` folders are submodules: after cloning, run `git submodule update --init --recursive`; a change inside them is committed and pushed in the submodule first, then the pointer is updated in this repository.
- The existing `page-1`, `page-2`, and the `mk-editor` route are demos of the library (State, window size, observables, the markdown editor); replace or remove them when starting a real app, together with the matching links in `index.html` and `main.ts`.
