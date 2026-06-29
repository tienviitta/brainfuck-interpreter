import { useState, useEffect, useRef, useCallback } from "react";
import init, { BrainfuckEngine } from "./pkg/core_wasm.js";
import { HELLO_BF_WORLD, OPCODE_LABELS } from "./programs.js";

const TAPE_LEN = 30000;
const VISIBLE_CELLS = 32;
const MAX_RUN_STEPS = 1_000_000;

function opcodeLabel(opcode) {
  if (!opcode) return "END";
  return OPCODE_LABELS[opcode] ?? opcode;
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const engineRef = useRef(null);
  const codeRef = useRef("");
  const inputRef = useRef("");
  const isFirstReadyRef = useRef(false);
  const stepCountRef = useRef(0);
  const opcodeRefs = useRef([]);

  const [code, setCode] = useState(HELLO_BF_WORLD);
  const [programInput, setProgramInput] = useState("BF");
  const [dp, setDp] = useState(0);
  const [pc, setPc] = useState(0);
  const [output, setOutput] = useState("");
  const [filteredProgram, setFilteredProgram] = useState("");
  const [currentOpcode, setCurrentOpcode] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [tapeWindow, setTapeWindow] = useState([]);
  const [tapeOffset, setTapeOffset] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  codeRef.current = code;
  inputRef.current = programInput;

  const syncTapeWindow = useCallback((engine, offset) => {
    const endIdx = Math.min(offset + VISIBLE_CELLS, TAPE_LEN);
    const newTape = [];
    for (let i = offset; i < endIdx; i++) {
      newTape.push({
        index: i,
        value: engine.get_tape_cell(i),
      });
    }
    setTapeWindow(newTape);
  }, []);

  const syncUi = useCallback(
    (offset = tapeOffset) => {
      const engine = engineRef.current;
      if (!engine) return;

      const currentDp = engine.get_dp();
      const currentPc = engine.get_pc();
      const finished = engine.is_finished();
      const opcode = engine.has_current_opcode()
        ? String.fromCharCode(engine.get_current_opcode())
        : "";

      setDp(currentDp);
      setPc(currentPc);
      setOutput(engine.get_output());
      setFilteredProgram(engine.get_program());
      setCurrentOpcode(opcode);
      setIsFinished(finished);
      setLimitHit(engine.limit_reached());
      syncTapeWindow(engine, offset);

      requestAnimationFrame(() => {
        opcodeRefs.current[currentPc]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      });
    },
    [tapeOffset, syncTapeWindow],
  );

  const replaceEngine = useCallback(
    (programText) => {
      setIsRunning(false);
      stepCountRef.current = 0;
      setLimitHit(false);
      setTapeOffset(0);

      const old = engineRef.current;
      engineRef.current = new BrainfuckEngine(programText);
      engineRef.current.set_input(inputRef.current);
      if (old) old.free();

      syncUi(0);
    },
    [syncUi],
  );

  const handleReset = useCallback(() => {
    if (!isReady) return;
    replaceEngine(codeRef.current);
  }, [isReady, replaceEngine]);

  const handleStep = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const hasMoreSteps = engine.step();
    stepCountRef.current += 1;

    const currentDp = engine.get_dp();
    let nextOffset = tapeOffset;
    if (currentDp < tapeOffset || currentDp >= tapeOffset + VISIBLE_CELLS) {
      nextOffset = Math.min(
        Math.max(0, currentDp - Math.floor(VISIBLE_CELLS / 4)),
        TAPE_LEN - VISIBLE_CELLS,
      );
      setTapeOffset(nextOffset);
    }

    syncUi(nextOffset);

    if (
      !hasMoreSteps ||
      engine.limit_reached() ||
      stepCountRef.current >= MAX_RUN_STEPS
    ) {
      setIsRunning(false);
      if (engine.limit_reached() || stepCountRef.current >= MAX_RUN_STEPS) {
        setLimitHit(true);
      }
    }
  }, [syncUi, tapeOffset]);

  const handleStepRef = useRef(handleStep);
  handleStepRef.current = handleStep;

  useEffect(() => {
    let cancelled = false;
    isFirstReadyRef.current = false;
    setIsReady(false);

    init().then(() => {
      if (!cancelled) setIsReady(true);
    });

    return () => {
      cancelled = true;
      const engine = engineRef.current;
      engineRef.current = null;
      engine?.free();
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!isFirstReadyRef.current) {
      isFirstReadyRef.current = true;
      replaceEngine(codeRef.current);
      return;
    }

    const id = setTimeout(() => replaceEngine(codeRef.current), 300);
    return () => clearTimeout(id);
  }, [code, isReady, replaceEngine]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => handleStepRef.current(), 5);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !isReady) return;
    engine.set_input(programInput);
  }, [programInput, isReady]);

  const handleTapeOffsetChange = (offset) => {
    const clamped = Math.max(0, Math.min(offset, TAPE_LEN - VISIBLE_CELLS));
    setTapeOffset(clamped);
    syncUi(clamped);
  };

  if (!isReady) {
    return (
      <div className="ui-body text-white p-8 uppercase tracking-widest">
        Loading WebAssembly Engine...
      </div>
    );
  }

  const tapeEnd = Math.min(tapeOffset + VISIBLE_CELLS, TAPE_LEN) - 1;
  const runState = isRunning ? "RUNNING" : isFinished ? "HALTED" : "READY";

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h1 className="ui-label text-xl text-cyan-400">
            Brain Fog Visualizer
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={isFinished && !isRunning}
              className={`ui-label px-4 py-2 rounded text-white transition-all disabled:opacity-50 ${isRunning ? "bg-yellow-600 hover:bg-yellow-500" : "bg-green-600 hover:bg-green-500"}`}
            >
              {isRunning ? "Pause" : "Run"}
            </button>
            <button
              onClick={handleStep}
              disabled={isRunning || isFinished}
              className="ui-label bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded transition-all"
            >
              Step
            </button>
            <button
              onClick={handleReset}
              className="ui-label bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/50 border border-gray-800 rounded-lg p-4">
          <div className="text-center">
            <div className="ui-label text-xs text-gray-500 mb-1">PC</div>
            <div className="ui-value text-3xl text-cyan-400">{pc}</div>
          </div>
          <div className="text-center">
            <div className="ui-label text-xs text-gray-500 mb-1">DP</div>
            <div className="ui-value text-3xl text-cyan-400">{dp}</div>
          </div>
          <div className="text-center">
            <div className="ui-label text-xs text-gray-500 mb-1">Command</div>
            <div className="ui-value text-3xl text-yellow-300">
              {currentOpcode || "—"}
            </div>
            <div className="ui-label text-[10px] text-gray-500 mt-1">
              {opcodeLabel(currentOpcode)}
            </div>
          </div>
          <div className="text-center">
            <div className="ui-label text-xs text-gray-500 mb-1">State</div>
            <div
              className={`ui-value text-xl mt-1 ${isRunning ? "text-green-400" : isFinished ? "text-gray-400" : "text-cyan-300"}`}
            >
              {runState}
            </div>
          </div>
        </div>

        {limitHit && (
          <p className="ui-label mt-3 text-amber-400 text-xs">
            Execution Stopped: Output Or Step Limit Reached
          </p>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <h2 className="ui-label text-sm text-gray-400 mb-2">Execution View</h2>
        <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar bg-black/40 border border-gray-800 rounded p-2">
          {filteredProgram.split("").map((char, index) => (
            <span
              key={index}
              ref={(el) => {
                opcodeRefs.current[index] = el;
              }}
              className={`ui-value shrink-0 w-8 h-10 flex items-center justify-center rounded border text-lg ${
                index === pc && !isFinished
                  ? "border-yellow-300 bg-yellow-900/40 text-yellow-200 scale-110"
                  : index < pc
                    ? "border-gray-700 bg-gray-800/50 text-gray-500"
                    : "border-gray-700 bg-gray-800 text-gray-300"
              }`}
              title={`${index}: ${opcodeLabel(char)}`}
            >
              {char}
            </span>
          ))}
          {isFinished && (
            <span className="ui-label shrink-0 px-2 text-gray-500 self-center">
              END
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="ui-label text-sm text-gray-400">Memory Tape</h2>
          <span className="ui-label text-xs text-gray-500">
            Cells {tapeOffset} – {tapeEnd}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
          {tapeWindow.map((cell) => (
            <div
              key={cell.index}
              className={`flex flex-col min-w-[3rem] shrink-0 items-center border-2 rounded transition-all duration-100 ${cell.index === dp ? "border-cyan-400 bg-cyan-900/30 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-105" : "border-gray-700 bg-gray-800"}`}
            >
              <span className="ui-label text-[10px] text-gray-500 pt-1">
                {cell.index}
              </span>
              <span
                className={`ui-value text-lg ${cell.index === dp ? "text-cyan-300" : "text-gray-200"}`}
              >
                {cell.value}
              </span>
              <span className="ui-value text-xs text-green-400 pb-1 h-5">
                {cell.value > 31 && cell.value < 127
                  ? String.fromCharCode(cell.value)
                  : ""}
              </span>
            </div>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={TAPE_LEN - VISIBLE_CELLS}
          value={tapeOffset}
          onChange={(e) => handleTapeOffsetChange(Number(e.target.value))}
          className="w-full mt-3 accent-cyan-400"
          aria-label="Tape viewport offset"
        />
        <div className="flex justify-between ui-label text-xs text-gray-500 mt-1">
          <span>0</span>
          <span className="text-cyan-400">Data Pointer: {dp}</span>
          <span>{TAPE_LEN - VISIBLE_CELLS}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="ui-label text-sm text-gray-400 mb-2">Code Editor</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="ui-body w-full h-40 bg-black text-gray-300 p-3 rounded text-sm resize-none border border-gray-800 focus:outline-none focus:border-cyan-500"
              spellCheck="false"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="ui-label text-sm text-gray-400 mb-2">
              Program Input (,)
            </h2>
            <input
              type="text"
              value={programInput}
              onChange={(e) => setProgramInput(e.target.value)}
              className="ui-body w-full bg-black text-gray-300 p-3 rounded border border-gray-800 focus:outline-none focus:border-cyan-500"
              placeholder="Characters Read By Comma Instructions"
              spellCheck="false"
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex flex-col">
          <h2 className="ui-label text-sm text-gray-400 mb-2">
            Standard Output
          </h2>
          <div className="ui-body bg-black border border-gray-800 rounded p-3 h-48 overflow-y-auto text-green-500 text-sm whitespace-pre-wrap break-all">
            {output}
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
