/* tslint:disable */
/* eslint-disable */

export class BrainfuckEngine {
    free(): void;
    [Symbol.dispose](): void;
    get_current_opcode(): number;
    get_dp(): number;
    get_opcode_at(index: number): number;
    get_output(): string;
    get_pc(): number;
    get_program(): string;
    get_program_len(): number;
    get_tape_cell(index: number): number;
    get_tape_len(): number;
    has_current_opcode(): boolean;
    has_opcode_at(index: number): boolean;
    is_finished(): boolean;
    limit_reached(): boolean;
    constructor(program_text: string);
    set_input(input: string): void;
    step(): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_brainfuckengine_free: (a: number, b: number) => void;
    readonly brainfuckengine_get_current_opcode: (a: number) => number;
    readonly brainfuckengine_get_dp: (a: number) => number;
    readonly brainfuckengine_get_opcode_at: (a: number, b: number) => number;
    readonly brainfuckengine_get_output: (a: number) => [number, number];
    readonly brainfuckengine_get_pc: (a: number) => number;
    readonly brainfuckengine_get_program: (a: number) => [number, number];
    readonly brainfuckengine_get_program_len: (a: number) => number;
    readonly brainfuckengine_get_tape_cell: (a: number, b: number) => number;
    readonly brainfuckengine_get_tape_len: (a: number) => number;
    readonly brainfuckengine_has_current_opcode: (a: number) => number;
    readonly brainfuckengine_has_opcode_at: (a: number, b: number) => number;
    readonly brainfuckengine_is_finished: (a: number) => number;
    readonly brainfuckengine_limit_reached: (a: number) => number;
    readonly brainfuckengine_new: (a: number, b: number) => number;
    readonly brainfuckengine_set_input: (a: number, b: number, c: number) => void;
    readonly brainfuckengine_step: (a: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
