# Brain Fog Visualizer

A Brainfuck visual debugger: step through programs and watch the memory tape, instruction pointer, and stdout update in real time. The execution engine is Rust compiled to WebAssembly; a small CLI runner lives in the same workspace.

## Prerequisites

- [Rust](https://rustup.rs/) (2024 edition for the workspace root crate)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`
- [Node.js](https://nodejs.org/) 18+

## Quick start

```bash
npm install
npm run dev
```

`npm run dev` runs `wasm-build` automatically via the `predev` hook.

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Build WASM and start the Vite dev server |
| `npm run wasm-build` | Compile `core-wasm` to `src/pkg/` |
| `npm run build` | Full build (WASM + Vite) → `dist/` |
| `npm run build:web` | Vite-only build (uses committed `src/pkg/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint JS/JSX with Oxlint |
| `cargo test -p brainfuck-core` | VM unit tests |
| `cargo run` | CLI Hello World |

## Default program

The web app runs **Hello BF World**: it reads two characters from **Program Input** (default `BF`) and prints `Hello BF World!`. Change the input field to personalize the greeting.

## Deploy (Vercel recommended)

This project is a static Vite SPA with a bundled `.wasm` file. **Vercel** is the better fit here: zero-config Vite support, fast global CDN, and simple GitHub integration. Netlify works equally well; `netlify.toml` is included.

### Why Vercel over Netlify?

| | Vercel | Netlify |
|---|--------|---------|
| Vite detection | Excellent (native) | Good |
| WASM MIME types | Handled automatically | Needs `netlify.toml` headers (included) |
| Free tier | Generous for static sites | Generous for static sites |
| Setup | Import repo → deploy | Import repo → deploy |

Both platforms lack Rust/wasm-pack in their default build image. This repo **commits `src/pkg/`** so deploy builds only run `npm run build:web` (no Rust toolchain required).

### Vercel

1. Import the GitHub repo at [vercel.com](https://vercel.com)
2. Framework preset: **Vite** (or use the included `vercel.json`)
3. Build command: `npm run build:web`
4. Output directory: `dist`
5. Deploy

Or with the CLI: `npx vercel --prod`

### Netlify

1. Import the repo at [netlify.com](https://netlify.com)
2. `netlify.toml` sets build command and WASM headers automatically
3. Deploy

### After changing Rust code

```bash
npm run wasm-build   # regenerate src/pkg/
git add src/pkg/
npm run build        # verify locally
```

## Project layout

```
src/main.rs          CLI interpreter
brainfuck-core/      Shared Brainfuck VM + tests
core-wasm/           WASM bindings (wasm-bindgen)
src/App.jsx          React visualizer UI
src/pkg/             WASM bindings (committed for deploy)
```

## Notes

- Run `cargo test -p brainfuck-core` for VM unit tests.
- See `research.md` for architecture details and `BF.md` for Rust debugging in VS Code.

## License

MIT — see [LICENSE](LICENSE).
