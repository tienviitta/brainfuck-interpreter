use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BrainfuckEngine {
    tape: Vec<u8>,
    dp: usize,
    pc: usize,
    program: Vec<u8>,
    bracket_map: Vec<usize>,
    output: String,
}

#[wasm_bindgen]
impl BrainfuckEngine {
    // Constructor exposed to JavaScript: `const engine = new BrainfuckEngine("+++")` [1]
    #[wasm_bindgen(constructor)]
    pub fn new(program_text: &str) -> Self {
        // FIX: Filter out non-Brainfuck commands (including newlines and spaces!)
        let program: Vec<u8> = program_text
            .as_bytes()
            .iter()
            .copied()
            .filter(|&byte| {
                byte == b'>'
                    || byte == b'<'
                    || byte == b'+'
                    || byte == b'-'
                    || byte == b'.'
                    || byte == b','
                    || byte == b'['
                    || byte == b']'
            })
            .collect();

        let bracket_map = Self::build_bracket_map(&program);

        Self {
            tape: vec![0u8; 30000],
            dp: 0,
            pc: 0,
            program,
            bracket_map,
            output: String::new(),
        }
    }

    // Your clean, original O(1) bracket map pre-computation logic
    fn build_bracket_map(program: &[u8]) -> Vec<usize> {
        let len = program.len();
        let mut map = vec![0usize; len];
        let mut stack: Vec<usize> = Vec::new();

        for i in 0..len {
            match program[i] {
                b'[' => {
                    stack.push(i);
                }
                b']' => {
                    if let Some(open) = stack.pop() {
                        map[open] = i;
                        map[i] = open;
                    }
                }
                _ => {}
            }
        }
        map
    }

    // Runs exactly ONE instruction per call.
    // Returns `true` if there are more steps remaining, or `false` if finished. [1]
    pub fn step(&mut self) -> bool {
        if self.pc >= self.program.len() {
            return false;
        }

        match self.program[self.pc] {
            b'>' => self.dp = (self.dp + 1) % self.tape.len(),
            b'<' => {
                if self.dp == 0 {
                    self.dp = self.tape.len() - 1;
                } else {
                    self.dp -= 1;
                }
            }
            b'+' => self.tape[self.dp] = self.tape[self.dp].wrapping_add(1),
            b'-' => self.tape[self.dp] = self.tape[self.dp].wrapping_sub(1),
            b'.' => {
                let character = self.tape[self.dp] as char;
                self.output.push(character);
            }
            b'[' => {
                if self.tape[self.dp] == 0 {
                    self.pc = self.bracket_map[self.pc];
                }
            }
            b']' => {
                if self.tape[self.dp] != 0 {
                    self.pc = self.bracket_map[self.pc];
                }
            }
            _ => {}
        }

        self.pc += 1;
        true
    }

    // =========================================================================
    // Getters allowing the React UI to inspect and draw the live hardware state
    // =========================================================================

    pub fn get_dp(&self) -> usize {
        self.dp
    }

    pub fn get_pc(&self) -> usize {
        self.pc
    }

    pub fn get_output(&self) -> String {
        self.output.clone()
    }

    pub fn get_tape_cell(&self, index: usize) -> u8 {
        self.tape.get(index).copied().unwrap_or(0)
    }
}
