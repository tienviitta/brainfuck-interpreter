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

`npm run dev` runs `wasm-build` automatically via the `predev` hook, so a fresh clone works without an extra build step.

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Build WASM (if needed) and start the Vite dev server |
| `npm run wasm-build` | Compile `core-wasm` to `src/pkg/` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint JS/JSX with Oxlint |
| `cargo run` | Run the CLI Hello World program |

## Project layout

```
src/main.rs          CLI interpreter (Hello World via brainfuck-core)
brainfuck-core/      Shared Brainfuck VM (used by CLI and WASM)
core-wasm/           WASM bindings (wasm-bindgen)
src/App.jsx          React visualizer UI
src/pkg/             Generated WASM bindings (gitignored; built by wasm-pack)
```

## Default program

The web app ships with the classic Brainfuck Hello World program — the same string as `brainfuck_core::HELLO_WORLD` in `brainfuck-core/`. It prints `Hello World!` and terminates cleanly.

## Program input

Use the **Program Input** field in the UI to supply characters consumed by `,` instructions.

## Notes

- WASM artifacts in `src/pkg/` are generated and not committed. They are rebuilt by `predev`, `build`, and `wasm-build`.
- Run `cargo test -p brainfuck-core` for VM unit tests.
- See `research.md` for architecture details and `BF.md` for Rust debugging in VS Code.
