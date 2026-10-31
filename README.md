# Transformer 3D Explainer

An interactive 3D visual explainer of the Transformer architecture. Orbit a floating encoder–decoder model, click any block, and follow the data step by step as the prompt **"The coffee is"** becomes the prediction **"hot"**.

### ▶ [Open the Live Demo](https://ammarfitwalla.github.io/transformer-3D-explainer/)

Built with Three.js and vanilla JavaScript. No build step, no framework, no dependencies to install.

![Three.js](https://img.shields.io/badge/Three.js-r128-black)
![Vanilla JS](https://img.shields.io/badge/JavaScript-vanilla-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

<!-- Add a screenshot: commit an image to docs/preview.png and uncomment the line below. -->
<!-- ![Transformer 3D Explainer preview](docs/preview.png) -->

## Features

- **3D encoder–decoder model** with color-coded blocks, residual skip connections, and an animated encoder→decoder attention bridge.
- **21-step guided tour** covering inputs, embeddings, positional encoding, attention, feed-forward layers, cross-attention, linear, and softmax.
- **Live data transformation** panel showing the concrete `In → Action → Out` for every step (e.g. `"coffee" #402 → [0.95 Drink, 0.85 Warm]`).
- **Clickable labels** projected over the WebGL scene, plus raycast selection directly on 3D blocks.
- **Animated data carrier** — three glowing token orbs travel from block to block as you advance.
- **Camera presets** for 3D, flat diagram front, and side view (to see the skip-connection loops).
- **Light "coffee-house" palette** with a clean, beginner-friendly explanation card.

## Quick start

No Python, Node.js, package manager, or build step is required — this is a static site.

**[Open the live demo](https://ammarfitwalla.github.io/transformer-3D-explainer/)** or open `index.html` directly in any modern browser with WebGL support. That's it.

> An internet connection is required: Three.js is loaded from a CDN. The Tailwind stylesheet is precompiled and served locally.

## Controls

| Action | Input |
| --- | --- |
| Orbit the scene | Left-drag |
| Pan (desktop) | Shift-drag or right-drag |
| Pan (touch) | Two-finger drag |
| Zoom (desktop) | Scroll wheel, or the `+` / `−` buttons |
| Zoom (touch) | Pinch with two fingers |
| Select a component | Click a floating tag or a 3D block |
| Start / pause the tour | ▶ Follow the Data |
| Step through components | ← Prev Component / Next Component → |
| Camera presets | 🧊 3D View · 📐 Diagram Front · ➰ Side (Skip Loops) |
| Auto-orbit | 🔄 Auto-Orbit |
| Toggle label density | 🏷️ All Tags / Minimal Tags |
| Hide/show the sample data flow | 🙈 Hide Sample / 👁 Show Sample |

## Project structure

```text
transformer_3d_explainer/
├── index.html          # App layout: nav bar, 3D viewport, label layer, info card, code modal
├── LICENSE             # MIT license
├── README.md
├── tailwind.config.js  # Tailwind content scan config (build-time only)
├── css/
│   ├── tailwind.input.css  # Tailwind source directives (build-time only)
│   ├── tailwind.css        # Precompiled utility stylesheet (committed, served to the browser)
│   └── styles.css          # Theme variables, 3D tags, data callout, glass info card
└── js/
    ├── data.js         # The 21 components: positions, shapes, colors, copy, data-flow examples
    ├── scene3d.js      # Three.js scene, camera rig, pipes, pulses, data carrier, tag projection
    └── app.js          # Controller: button wiring, info card rendering, guided tour
```

Scripts are classic (non-module) scripts and must load in order: `data.js` → `scene3d.js` → `app.js`.

## How it works

1. **`data.js`** exposes `window.TransformerArchData`: a `tourOrder` array and a `components` map. Each component defines its label, 3D position `[x, y, z]`, size `[w, h, d]`, shape, colors, explanation text, and a `dataFlow` example.
2. **`scene3d.js`** builds the scene from that data: boxes and diamonds, transparent encoder/decoder shells, Catmull-Rom pipes with traveling pulse spheres, and an HTML tag overlay. Every frame it projects 3D points through the camera to position the labels.
3. **`app.js`** handles selection. When a component is selected, the scene animates the token carrier, the info card is rewritten from the component's copy, and the live data strip updates.

Spatial convention: the encoder tower sits at `x = -5.2`, the decoder at `x = +5.2`, and data flows upward from `y = -7.8` to `y = +9.5`.

## Customizing

- **Change wording or add a step:** edit `js/data.js`. Add an entry to `components` and include its ID in `tourOrder`.
- **Move or resize a block:** edit `pos` / `size` in `data.js`. Pipe paths are currently hardcoded in `buildConnectionsAndPulses()` in `js/scene3d.js`, so update those coordinates too.
- **Change colors:** CSS variables live in `css/styles.css`; 3D block colors use `colorHex` / `borderHex` in `data.js`.

### Rebuilding the stylesheet

`css/tailwind.css` is committed, so you only need this when you add or change Tailwind utility classes in `index.html` or `js/*.js`:

```bash
npx --yes tailwindcss@3.4.17 -c tailwind.config.js -i css/tailwind.input.css -o css/tailwind.css --minify
```

## Tech stack

- [Three.js](https://threejs.org/) r128 (CDN)
- [Tailwind CSS](https://tailwindcss.com/) 3.4.17 (precompiled to `css/tailwind.css`)
- Vanilla JavaScript and CSS — no bundler, no runtime dependencies

## Deploying to GitHub Pages

1. This repository already has `index.html` at the root — no extra folder nesting is needed.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then `main` and `/ (root)`.
4. Your site will be published at `https://<username>.github.io/<repo>/`.

> When deploying an update, bump the `?v=` query string on the local CSS/JS files in `index.html` (for example `?v=20261031b`) so browsers fetch the new files instead of reusing cached ones.

## Known limitations

- The in-app **📂 Code** modal is a stub: it shows a placeholder message because the embedded source bundle (`window.ModularSourcesB64`) is not included. Use the GitHub source view instead.
- Encoder and decoder tower shells are selectable only through their labels, not by clicking the translucent 3D box.
- Requires WebGL and network access to the Three.js CDN.

## License

Released under the [MIT License](LICENSE).

Copyright © 2026 Ammar Fitwalla
