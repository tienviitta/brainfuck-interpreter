import { useState, useEffect, useRef, useCallback } from "react";
import init, { BrainfuckEngine } from "./pkg/core_wasm.js";

const TAPE_LEN = 30000;
const VISIBLE_CELLS = 32;
const MAX_RUN_STEPS = 1_000_000;

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const engineRef = useRef(null);
  const codeRef = useRef("");
  const inputRef = useRef("");
  const isFirstReadyRef = useRef(false);
  const stepCountRef = useRef(0);

  const [code, setCode] = useState(
    "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.",
  );
  const [programInput, setProgramInput] = useState("");
  const [dp, setDp] = useState(0);
  const [pc, setPc] = useState(0);
  const [output, setOutput] = useState("");
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
      setDp(currentDp);
      setPc(engine.get_pc());
      setOutput(engine.get_output());
      setLimitHit(engine.limit_reached());
      syncTapeWindow(engine, offset);
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

  if (!isReady)
    return <div className="text-white p-8">Loading WebAssembly Engine...</div>;

  const tapeEnd = Math.min(tapeOffset + VISIBLE_CELLS, TAPE_LEN) - 1;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 p-4">
      {/* Header & Controls */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-cyan-400">
            🧠 Brain Fog Visualizer
          </h1>
          <span className="text-gray-500 text-sm">
            Instruction Pointer (PC): {pc}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded font-bold text-white transition-all ${isRunning ? "bg-yellow-600 hover:bg-yellow-500" : "bg-green-600 hover:bg-green-500"}`}
          >
            {isRunning ? "⏸ Pause" : "▶ Run"}
          </button>
          <button
            onClick={handleStep}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded font-bold transition-all"
          >
            ⏭ Step
          </button>
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold transition-all"
          >
            ⏹ Reset
          </button>
        </div>
        {limitHit && (
          <p className="mt-3 text-amber-400 text-sm">
            Execution stopped: output or step limit reached.
          </p>
        )}
      </div>

      {/* Memory Tape View */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm text-gray-400 uppercase tracking-widest">
            Memory Tape
          </h2>
          <span className="text-xs text-gray-500">
            Cells {tapeOffset} – {tapeEnd}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
          {tapeWindow.map((cell) => (
            <div
              key={cell.index}
              className={`flex flex-col min-w-[3rem] shrink-0 items-center border-2 rounded transition-all duration-100 ${cell.index === dp ? "border-cyan-400 bg-cyan-900/30 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-105" : "border-gray-700 bg-gray-800"}`}
            >
              <span className="text-xs text-gray-500 pt-1">{cell.index}</span>
              <span
                className={`text-lg font-bold ${cell.index === dp ? "text-cyan-300" : "text-gray-200"}`}
              >
                {cell.value}
              </span>
              <span className="text-xs text-green-400 pb-1 h-5">
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
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span className="text-cyan-400">⬆ DATA POINTER at cell {dp}</span>
          <span>{TAPE_LEN - VISIBLE_CELLS}</span>
        </div>
      </div>

      {/* Code and Console Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm text-gray-400 mb-2 uppercase tracking-widest">
              Code Editor
            </h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-40 bg-black text-gray-300 p-3 rounded font-mono text-lg resize-none border border-gray-800 focus:outline-none focus:border-cyan-500"
              spellCheck="false"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm text-gray-400 mb-2 uppercase tracking-widest">
              Program Input (,)
            </h2>
            <input
              type="text"
              value={programInput}
              onChange={(e) => setProgramInput(e.target.value)}
              className="w-full bg-black text-gray-300 p-3 rounded font-mono border border-gray-800 focus:outline-none focus:border-cyan-500"
              placeholder="Characters read by , instructions"
              spellCheck="false"
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex flex-col">
          <h2 className="text-sm text-gray-400 mb-2 uppercase tracking-widest">
            Standard Output
          </h2>
          <div className="bg-black border border-gray-800 rounded p-3 h-48 overflow-y-auto text-green-500 font-mono text-lg whitespace-pre-wrap break-all">
            {output}
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
