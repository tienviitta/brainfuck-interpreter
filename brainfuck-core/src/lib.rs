pub const TAPE_LEN: usize = 30_000;
pub const MAX_OUTPUT_LEN: usize = 1_000_000;

const BF_OPS: [u8; 8] = [b'>', b'<', b'+', b'-', b'.', b',', b'[', b']'];

/// Strip comments and whitespace; keep only Brainfuck commands.
pub fn parse_program(text: &str) -> Vec<u8> {
    text.bytes()
        .filter(|byte| BF_OPS.contains(byte))
        .collect()
}

/// Pre-compute O(1) bracket jumps. Unmatched brackets are ignored (no panic).
pub fn build_bracket_map(program: &[u8]) -> Vec<usize> {
    let len = program.len();
    let mut map = vec![0usize; len];
    let mut stack = Vec::new();

    for i in 0..len {
        match program[i] {
            b'[' => stack.push(i),
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StepOutcome {
    Continued,
    Finished,
    OutputLimitReached,
}

pub struct BrainfuckVm {
    tape: Vec<u8>,
    dp: usize,
    pc: usize,
    program: Vec<u8>,
    bracket_map: Vec<usize>,
    output: String,
    input: Vec<u8>,
    input_pos: usize,
    limit_reached: bool,
}

impl BrainfuckVm {
    pub fn new(program_text: &str) -> Self {
        let program = parse_program(program_text);
        let bracket_map = build_bracket_map(&program);

        Self {
            tape: vec![0u8; TAPE_LEN],
            dp: 0,
            pc: 0,
            program,
            bracket_map,
            output: String::new(),
            input: Vec::new(),
            input_pos: 0,
            limit_reached: false,
        }
    }

    pub fn set_input(&mut self, text: &str) {
        self.input = text.bytes().collect();
        self.input_pos = 0;
    }

    pub fn step(&mut self) -> StepOutcome {
        if self.pc >= self.program.len() {
            return StepOutcome::Finished;
        }

        if self.limit_reached {
            return StepOutcome::OutputLimitReached;
        }

        match self.program[self.pc] {
            b'>' => self.dp = (self.dp + 1) % TAPE_LEN,
            b'<' => {
                self.dp = if self.dp == 0 {
                    TAPE_LEN - 1
                } else {
                    self.dp - 1
                };
            }
            b'+' => self.tape[self.dp] = self.tape[self.dp].wrapping_add(1),
            b'-' => self.tape[self.dp] = self.tape[self.dp].wrapping_sub(1),
            b'.' => {
                if self.output.len() >= MAX_OUTPUT_LEN {
                    self.limit_reached = true;
                    return StepOutcome::OutputLimitReached;
                }
                self.output.push(self.tape[self.dp] as char);
            }
            b',' => {
                let byte = self.input.get(self.input_pos).copied().unwrap_or(0);
                self.tape[self.dp] = byte;
                if self.input_pos < self.input.len() {
                    self.input_pos += 1;
                }
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

        if self.pc >= self.program.len() {
            StepOutcome::Finished
        } else {
            StepOutcome::Continued
        }
    }

    pub fn run_to_completion(&mut self) {
        while matches!(self.step(), StepOutcome::Continued) {}
    }

    pub fn dp(&self) -> usize {
        self.dp
    }

    pub fn pc(&self) -> usize {
        self.pc
    }

    pub fn output(&self) -> &str {
        &self.output
    }

    pub fn tape_cell(&self, index: usize) -> u8 {
        self.tape.get(index).copied().unwrap_or(0)
    }

    pub fn program_len(&self) -> usize {
        self.program.len()
    }

    pub fn limit_reached(&self) -> bool {
        self.limit_reached
    }

    pub fn is_finished(&self) -> bool {
        self.pc >= self.program.len()
    }

    pub fn program(&self) -> &str {
        // Filtered program bytes are always ASCII Brainfuck operators.
        std::str::from_utf8(&self.program).expect("program bytes are ASCII")
    }

    pub fn opcode_at(&self, index: usize) -> Option<u8> {
        self.program.get(index).copied()
    }

    pub fn current_opcode(&self) -> Option<u8> {
        self.opcode_at(self.pc)
    }
}

pub const HELLO_WORLD: &str =
    "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

/// Prints `Hello {input} World!` — expects two input characters (default `BF`).
pub const HELLO_BF_WORLD: &str = "\
>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>++++++++++++++++++++++++++++++++.,.,.\
>++++++++++++++++++++++++++++++++.\
>+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.\
>+++++++++++++++++++++++++++++++++.\
>++++++++++.";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_program_filters_noise() {
        let parsed = parse_program("++ \n+");
        assert_eq!(parsed, b"+++");
    }

    #[test]
    fn bracket_map_pairs_loops() {
        let program = parse_program("+[+]");
        let map = build_bracket_map(&program);
        assert_eq!(map[1], 3);
        assert_eq!(map[3], 1);
    }

    #[test]
    fn hello_bf_world_output() {
        let mut vm = BrainfuckVm::new(HELLO_BF_WORLD);
        vm.set_input("BF");
        vm.run_to_completion();
        assert_eq!(vm.output(), "Hello BF World!\n");
    }

    #[test]
    fn current_opcode_tracks_pc() {
        let mut vm = BrainfuckVm::new("+.");
        assert_eq!(vm.current_opcode(), Some(b'+'));
        vm.step();
        assert_eq!(vm.current_opcode(), Some(b'.'));
        vm.step();
        assert_eq!(vm.current_opcode(), None);
    }

    #[test]
    fn opcode_at_index() {
        let vm = BrainfuckVm::new("+-");
        assert_eq!(vm.opcode_at(0), Some(b'+'));
        assert_eq!(vm.opcode_at(1), Some(b'-'));
        assert_eq!(vm.opcode_at(2), None);
    }

    #[test]
    fn hello_world_output() {
        let mut vm = BrainfuckVm::new(HELLO_WORLD);
        vm.run_to_completion();
        assert_eq!(vm.output(), "Hello World!\n");
        assert!(vm.is_finished());
        assert_eq!(vm.pc(), vm.program_len());
    }

    #[test]
    fn input_is_consumed() {
        let mut vm = BrainfuckVm::new(",.");
        vm.set_input("Z");
        vm.run_to_completion();
        assert_eq!(vm.output(), "Z");
    }

    #[test]
    fn input_past_end_reads_zero() {
        let mut vm = BrainfuckVm::new(",.");
        vm.run_to_completion();
        assert_eq!(vm.output(), "\0");
    }

    #[test]
    fn tape_cell_out_of_range_returns_zero() {
        let vm = BrainfuckVm::new("");
        assert_eq!(vm.tape_cell(TAPE_LEN), 0);
    }

    #[test]
    fn step_until_finished() {
        let mut vm = BrainfuckVm::new("+++");
        assert_eq!(vm.step(), StepOutcome::Continued);
        assert_eq!(vm.step(), StepOutcome::Continued);
        assert_eq!(vm.step(), StepOutcome::Finished);
        assert_eq!(vm.step(), StepOutcome::Finished);
    }
}
