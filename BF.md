# brainfuck-interpreter

## Debugging in VS Code (Rust + CodeLLDB)

This project is configured for reliable Rust variable inspection (including `Vec` and `HashMap`) while debugging.

### Launch configurations

The debug profiles are in `.vscode/launch.json`:

- `Debug brainfuck-interpreter`
- `Debug brainfuck-interpreter (Max debug info)`

The max-debug profile sets:

- `RUSTFLAGS=-C debuginfo=2 -C opt-level=0 -C codegen-units=1`
- `sourceLanguages: ["rust"]`

### Cargo debug-friendly profile

`Cargo.toml` includes:

```toml
[profile.dev]
opt-level = 0
debug = 2
codegen-units = 1
```

These settings reduce optimization and increase debug symbol quality, which improves visibility of local variables and container internals.

### How to use

1. Open **Run and Debug** in VS Code.
2. Select `Debug brainfuck-interpreter (Max debug info)`.
3. Set breakpoints and start debugging.
4. Inspect values in **Variables** and **Watch**.

### Troubleshooting checks (Variables empty or incomplete)

Run these checks in order:

1. Check the selected launch profile is **Debug brainfuck-interpreter (Max debug info)**.
2. Check `.vscode/launch.json` contains:
	- `sourceLanguages: ["rust"]`
	- `RUSTFLAGS=-C debuginfo=2 -C opt-level=0 -C codegen-units=1`
3. Check `Cargo.toml` contains this dev profile:
	- `[profile.dev]`
	- `opt-level = 0`
	- `debug = 2`
	- `codegen-units = 1`
4. Check you are breaking after variable initialization (not before assignment).
5. Rebuild from clean to remove stale artifacts:
	- `cargo clean && cargo build`
6. Check required extensions are installed and enabled:
	- `vadimcn.vscode-lldb`
	- `rust-lang.rust-analyzer`
7. If `HashMap` display still looks odd, add watch expressions like:
	- `scores.len()`
	- `scores.get("alice")`
	- `numbers.len()`
	- `numbers[0]`

### References

- CodeLLDB manual: https://github.com/vadimcn/codelldb/blob/master/MANUAL.md
- VS Code launch config docs: https://code.visualstudio.com/docs/debugtest/debugging-configuration
- Cargo profiles: https://doc.rust-lang.org/cargo/reference/profiles.html
- Rust codegen options: https://doc.rust-lang.org/rustc/codegen-options/index.html
