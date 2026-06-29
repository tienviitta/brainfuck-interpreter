# Learning Rust by Stepping Through Brainfuck

*How a tiny esoteric language became a WASM visual debugger — and what it taught me about Rust along the way.*

---

If you want to learn Rust, you do not need to start with async web servers or blockchain nodes. Sometimes the best teacher is the smallest possible program.

That is how I ended up building **Brain Fog Visualizer**: a step-by-step Brainfuck debugger that runs in the browser, backed by Rust compiled to WebAssembly. It started as a CLI exercise and grew into a small multi-crate workspace — and along the way it surfaced almost every Rust concept a beginner needs to internalize.

**Live demo:** https://brainfuck-interpreter-amber.vercel.app

---

## Why Brainfuck?

Brainfuck is an esoteric language with eight commands: `><+-.,[]`. It has a tape of byte cells, a data pointer, and a program counter. That is it.

For a Rust learner, that minimalism is a feature. You are not fighting frameworks or syntax sugar. You are implementing a virtual machine: parsing, control flow, state, and I/O. The problem is small enough to finish in a weekend, but rich enough to force real design decisions.

I began with [Learn Rust Basics By Building a Brainfuck Interpreter](https://blog.sheerluck.dev/posts/learn-rust-basics-by-building-a-brainfuck-interpreter/) by Mrsheerluck — part of the excellent [learning-rust](https://blog.sheerluck.dev/series/learning-rust/) series. That tutorial walks through Cargo, pattern matching, and a classic `while` loop that runs a program to completion. Solid foundation. I wanted to go further.

---

## From CLI to shared library

The tutorial's CLI runner is about sixty lines: hardcode a Hello World program, call `run_to_completion()`, print stdout. Done.

My first refactor was extracting the VM into **`brainfuck-core`**, a shared crate used by both the CLI and the browser target. That single move taught more Rust than the interpreter itself:

- **Modules and workspaces** — a root `Cargo.toml` with members `brainfuck-core`, `core-wasm`, and the CLI binary
- **Public API design** — what to expose (`parse_program`, `build_bracket_map`, `BrainfuckVm`) and what to keep internal
- **Enums for control flow** — `StepOutcome::{Continued, Finished, OutputLimitReached}` instead of scattering boolean flags
- **Safe indexing** — `tape.get(index).copied().unwrap_or(0)` rather than panicking on out-of-bounds access
- **Unit tests** — `cargo test -p brainfuck-core` covers parsing, bracket maps, I/O, and golden output for Hello World

The CLI binary shrank to three lines:

```rust
let mut vm = brainfuck_core::BrainfuckVm::new(brainfuck_core::HELLO_WORLD);
vm.run_to_completion();
print!("{}", vm.output());
```

One VM, two consumers. That is the pattern you will use in real Rust projects.

---

## The stepping API: designing for the browser

A CLI runs to completion. A visual debugger runs **one instruction at a time**.

That meant rethinking the execution loop. Instead of a `while` that never yields, `BrainfuckVm::step()` executes exactly one opcode and returns an outcome. The UI calls `step()` on every button click — or on a timer when "Run" is active.

The WASM bridge in **`core-wasm`** is a thin `wasm-bindgen` wrapper:

```rust
#[wasm_bindgen]
pub struct BrainfuckEngine {
    vm: BrainfuckVm,
}

impl BrainfuckEngine {
    pub fn step(&mut self) -> bool { /* ... */ }
    pub fn get_dp(&self) -> usize { /* ... */ }
    pub fn get_tape_cell(&self, index: usize) -> u8 { /* ... */ }
    // ...
}
```

This is where Rust's ownership model meets JavaScript's garbage collection. `BrainfuckEngine` is a Rust struct allocated on the WASM heap; `wasm-bindgen` generates the glue code that lets React construct, mutate, and eventually free it. Getting that lifecycle right — especially under React StrictMode — was its own lesson in debugging cross-language boundaries.

---

## What the visualizer shows

The web app is the main deliverable. It renders the VM state that Rust keeps hidden in a normal program:

- **Program counter (PC)** and **data pointer (DP)** in a status bar
- An **execution view** — a sliding window over the filtered opcode stream, with the current instruction highlighted
- A **memory tape** — 32 visible cells from a 30,000-cell array, with ASCII labels and a horizontal slider
- **Program input** for the `,` opcode and a **stdout panel** for `.`

The default demo is not naive `+++…` strings. It uses nested `[>…<-]` loops to set cell values efficiently, then reads two characters from the input field (default `BF`) and prints `Hello BF World!`. Change the input, change the greeting.

**[INSERT bf.png HERE — upload from repo root]**

*Figure 1: Brain Fog Visualizer running in the browser. The Rust VM executes one Brainfuck instruction per step; React renders tape, PC, DP, and stdout in real time.*

---

## Rust concepts this project covers

- **Ownership & borrowing** — `BrainfuckVm` holds `Vec<u8>` tape and `String` output; getters return copies or slices
- **Pattern matching** — opcode dispatch in `step()` via `match` on `program[pc]`
- **Error handling without exceptions** — `Option` for out-of-range tape reads; `StepOutcome` enum for execution state
- **Wrapping arithmetic** — `wrapping_add` / `wrapping_sub` on tape cells (Brainfuck semantics)
- **Precomputation** — O(n) bracket-map build for O(1) `[` / `]` jumps
- **Cargo workspaces** — shared `brainfuck-core` consumed by CLI and `core-wasm`
- **FFI via WASM** — `wasm-bindgen` exposes a Rust API to JavaScript
- **Testing** — unit tests in the core crate; golden-output assertions for Hello World

You will not find async, traits, or macros here — and that is intentional. This project is a foundation layer. Once you understand how a `BrainfuckVm` owns its state and exposes a stepping API, adding async I/O or trait-based backends is a natural next step.

---

## Build pipeline: Rust in the browser

The toolchain is straightforward:

1. **`wasm-pack build`** compiles `core-wasm` to `src/pkg/` (JS glue + `.wasm` binary)
2. **Vite** bundles the React app and WASM asset
3. **`npm run dev`** runs a `predev` hook that rebuilds WASM automatically

Deploying to Vercel does not include Rust in the build environment, so the repo commits the generated `src/pkg/` artifacts and uses `npm run build:web` for production. After changing Rust, run `npm run wasm-build` and commit the updated bindings.

---

## Lessons that stuck

**Share logic early.** Duplicating the VM in CLI and WASM led to semantic drift (different tape-wrapping behavior, different bracket-error policies). One `brainfuck-core` crate eliminated that.

**Design APIs for your slowest consumer.** The browser needs one step per frame; the CLI needs `run_to_completion()`. Both call the same `step()` internally.

**Test the core, not the glue.** Eleven unit tests in `brainfuck-core` catch regressions without spinning up a browser.

**Cross-language lifecycle is subtle.** React effects, WASM `free()`, and StrictMode double-mounting can produce `memory access out of bounds` errors that look like Rust bugs but are really JavaScript timing issues. Fixing those taught me as much as writing the VM.

---

## Try it yourself

- **Play with the demo:** https://brainfuck-interpreter-amber.vercel.app
- **Source:** https://github.com/tienviitta/brainfuck-interpreter
- **Start here if you are new to Rust:** [Mrsheerluck's Brainfuck tutorial](https://blog.sheerluck.dev/posts/learn-rust-basics-by-building-a-brainfuck-interpreter/)

Clone, run `npm install && npm run dev`, and step through a program instruction by instruction. There is no better way to see what your Rust code is actually doing.

---

## What is next

The roadmap includes adjustable run speed, example program presets, keyboard shortcuts, and CI that runs `cargo test` alongside the Vite build. The core is solid; the polish is incremental.

If you are learning Rust and looking for a project that is small, completable, and genuinely extensible — Brainfuck is underrated. Eight commands, one tape, and a path from `cargo run` to WASM in the browser.

---

*MIT licensed. Built while learning Rust — bugs, refactors, and WASM lifecycle lessons included.*
