fn main() {
    let mut vm = brainfuck_core::BrainfuckVm::new(brainfuck_core::HELLO_WORLD);
    vm.run_to_completion();
    print!("{}", vm.output());
}
