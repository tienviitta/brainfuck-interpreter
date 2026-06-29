use wasm_bindgen::prelude::*;
use brainfuck_core::{BrainfuckVm, StepOutcome, TAPE_LEN};

#[wasm_bindgen]
pub struct BrainfuckEngine {
    vm: BrainfuckVm,
}

#[wasm_bindgen]
impl BrainfuckEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(program_text: &str) -> Self {
        Self {
            vm: BrainfuckVm::new(program_text),
        }
    }

    pub fn set_input(&mut self, input: &str) {
        self.vm.set_input(input);
    }

    pub fn step(&mut self) -> bool {
        matches!(self.vm.step(), StepOutcome::Continued)
    }

    pub fn limit_reached(&self) -> bool {
        self.vm.limit_reached()
    }

    pub fn is_finished(&self) -> bool {
        self.vm.is_finished()
    }

    pub fn get_dp(&self) -> usize {
        self.vm.dp()
    }

    pub fn get_pc(&self) -> usize {
        self.vm.pc()
    }

    pub fn get_output(&self) -> String {
        self.vm.output().to_string()
    }

    pub fn get_program(&self) -> String {
        self.vm.program().to_string()
    }

    pub fn get_program_len(&self) -> usize {
        self.vm.program_len()
    }

    pub fn get_opcode_at(&self, index: usize) -> u8 {
        self.vm.opcode_at(index).unwrap_or(0)
    }

    pub fn has_opcode_at(&self, index: usize) -> bool {
        self.vm.opcode_at(index).is_some()
    }

    pub fn get_current_opcode(&self) -> u8 {
        self.vm.current_opcode().unwrap_or(0)
    }

    pub fn has_current_opcode(&self) -> bool {
        self.vm.current_opcode().is_some()
    }

    pub fn get_tape_cell(&self, index: usize) -> u8 {
        self.vm.tape_cell(index)
    }

    pub fn get_tape_len(&self) -> usize {
        TAPE_LEN
    }
}
