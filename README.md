# Brain Fog Visualizer

A Brainfuck visual debugger built while learning Rust. Step through programs instruction-by-instruction and watch the memory tape, instruction pointer, and stdout update in real time.

**Live demo:** [brainfuck-interpreter-amber.vercel.app](https://brainfuck-interpreter-amber.vercel.app)

## Background

This project started from the excellent tutorial series [**Learn Rust Basics By Building a Brainfuck Interpreter**](https://blog.sheerluck.dev/posts/learn-rust-basics-by-building-a-brainfuck-interpreter/) by [Mrsheerluck](https://blog.sheerluck.dev/) (part of the [learning-rust](https://blog.sheerluck.dev/series/learning-rust/) series). That article walks through Cargo, control flow, and a classic CLI Brainfuck runner in Rust.

This repo extends that foundation into a small multi-target workspace:

| Layer | What it does |
|-------|----------------|
| **`brainfuck-core`** | Shared VM — parse, bracket map, step, I/O, tests |
| **`src/main.rs`** | CLI runner (`cargo run`) |
| **`core-wasm`** | `wasm-bindgen` bridge for the browser |
| **React + Vite UI** | Interactive visualizer with **step**, **run**, and **reset** |

The web app is the main deliverable; the CLI remains a minimal reference binary. See [`research.md`](research.md) for architecture notes and [`BF.md`](BF.md) for VS Code Rust debugging.

## Features

### Implemented

- **Step execution** — run exactly one Brainfuck instruction per click
- **Run / pause** — continuous execution with auto-step (fixed interval today)
- **Reset** — rebuild VM from current editor + input
- **Execution view** — filtered program strip with active PC highlighted; scrolls to current opcode
- **Status bar** — large **PC**, **DP**, current **command** (+ label, e.g. `PRINT`), and **state** (`READY` / `RUNNING` / `HALTED`)
- **Memory tape** — 32-cell viewport from index 0, horizontal slider across 30 000 cells, DP highlight + ASCII
- **Program input** — `,` reads from the **Program Input** field (default demo: `BF` → `Hello BF World!`)
- **Idiomatic demo program** — loop-based cell setup (`[>…<-]`), not naive `+++…` strings
- **Shared Rust core** — one VM for CLI and WASM; `cargo test -p brainfuck-core`
- **Output / step limits** — guards against runaway loops
- **Deploy-ready** — static Vite build + committed WASM bindings; [Vercel](https://vercel.com) config included

### Planned / ideas

| Feature | Description |
|---------|-------------|
| **Run delay slider** | User-adjustable interval (e.g. 1 ms–1000 ms) so Run is easy to follow |
| **Example programs** | Dropdown: Hello BF World, classic Hello World, echo (`,.`), cat |
| **Keyboard shortcuts** | `Space` step, `R` run/pause, `Esc` reset |
| **Speed presets** | Slow / normal / fast beside the slider |
| **Opcode cheat sheet** | Panel or hover help for each command |
| **Editor ↔ PC sync** | Highlight current instruction in the code editor (source map for comments/newlines) |
| **Step back** | Undo last step (requires execution history) |
| **Breakpoints** | Pause when PC hits a chosen instruction |
| **CI** | GitHub Actions: `cargo test`, `npm run lint`, `npm run build:web` |
| **Rebuild WASM in CI** | Drop committed `src/pkg/`; install Rust + wasm-pack on deploy |
| **CLI flags** | `cargo run -- --program '+++'` or read stdin |

Contributions and experiments welcome — MIT licensed.

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

The web app runs **Hello BF World**: it reads two characters from **Program Input** (default `BF`) and prints `Hello BF World!`. The Brainfuck code uses nested loops to set tape values — change the input field to personalize the greeting.

## Deploy (Vercel recommended)

Static Vite SPA with a bundled `.wasm` file. **Vercel** is recommended (native Vite support); **Netlify** works too (`netlify.toml` included).

Both platforms lack Rust/wasm-pack by default. This repo **commits `src/pkg/`** so deploy uses `npm run build:web` only.

1. Import [tienviitta/brainfuck-interpreter](https://github.com/tienviitta/brainfuck-interpreter) at [vercel.com](https://vercel.com)
2. Build command: `npm run build:web` · Output: `dist` (see `vercel.json`)
3. Deploy — or `npx vercel --prod`

After changing Rust:

```bash
npm run wasm-build
git add src/pkg/
```

## Project layout

```
src/main.rs          CLI interpreter
brainfuck-core/      Shared Brainfuck VM + tests
core-wasm/           WASM bindings (wasm-bindgen)
src/App.jsx          React visualizer UI
src/pkg/             WASM bindings (committed for deploy)
research.md          Deep-dive notes (architecture, bugs fixed, roadmap)
```

## References

- [Learn Rust Basics By Building a Brainfuck Interpreter](https://blog.sheerluck.dev/posts/learn-rust-basics-by-building-a-brainfuck-interpreter/) — tutorial that inspired the CLI starting point
- [learning-rust series](https://blog.sheerluck.dev/series/learning-rust/) — full Mrsheerluck Rust learning path
- [Brainfuck language](https://esolangs.org/wiki/Brainfuck) — language reference

## License

MIT — see [LICENSE](LICENSE).
