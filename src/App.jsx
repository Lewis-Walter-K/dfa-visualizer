import React, { useState, useEffect } from 'react';
import GraphVisualizer from './components/GraphVisualizer';
import './App.css';

const TEMPLATES = {
  "2-state": {
      states: "q0, q1", alpha: "0, 1", start: "q0", accept: "q1", str: "10110",
      trans: {"q0-0":"q0", "q0-1":"q1", "q1-0":"q0", "q1-1":"q1"}
  },
  "3-state": {
      states: "q0, q1, q2", alpha: "0, 1", start: "q0", accept: "q2", str: "0101",
      trans: {"q0-0":"q1", "q0-1":"q0", "q1-0":"q1", "q1-1":"q2", "q2-0":"q2", "q2-1":"q2"}
  },
  "4-state": {
      states: "q0, q1, q2, q3", alpha: "0, 1", start: "q0", accept: "q3", str: "1101",
      trans: {"q0-0":"q0", "q0-1":"q1", "q1-0":"q2", "q1-1":"q1", "q2-0":"q0", "q2-1":"q3", "q3-0":"q3", "q3-1":"q3"}
  },
  "5-state": {
      states: "q0, q1, q2, q3, q4", alpha: "0, 1", start: "q0", accept: "q4", str: "11100",
      trans: {"q0-0":"q1", "q0-1":"q0", "q1-0":"q2", "q1-1":"q1", "q2-0":"q3", "q2-1":"q2", "q3-0":"q4", "q3-1":"q3", "q4-0":"q4", "q4-1":"q4"}
  }
};

function App() {
  const [statesInput, setStatesInput] = useState("q0, q1, q2");
  const [alphabetInput, setAlphabetInput] = useState("0, 1");
  const [startState, setStartState] = useState("q0");
  const [acceptStatesInput, setAcceptStatesInput] = useState("q1");
  const [transitionsMap, setTransitionsMap] = useState({
    "q0-0": "q0", "q0-1": "q1",
    "q1-0": "q2", "q1-1": "q0",
    "q2-0": "q1", "q2-1": "q2"
  });

  const [testString, setTestString] = useState("10110");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentState, setCurrentState] = useState(null);
  const [activeTransitionId, setActiveTransitionId] = useState(null);
  const [status, setStatus] = useState("WAITING"); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [layoutTrigger, setLayoutTrigger] = useState(1);

  const states = statesInput.split(',').map(s => s.trim()).filter(Boolean);
  const alphabet = alphabetInput.split(',').map(s => s.trim()).filter(Boolean);
  const acceptStates = acceptStatesInput.split(',').map(s => s.trim()).filter(Boolean);
  
  // THE FIX: Strict filtering prevents "ghost" edges from deleted alphabets/states
  const parsedTransitions = Object.entries(transitionsMap).map(([key, to]) => {
    const [from, symbol] = key.split('-');
    return { id: `edge-${from}-${symbol}-${to.trim()}`, from, symbol, to: to.trim() };
  }).filter(t => {
    return t.to !== "" && 
           states.includes(t.from) &&   // Must be a valid Start node
           states.includes(t.to) &&     // Must be a valid Target node
           alphabet.includes(t.symbol); // Must be a valid Alphabet symbol
  });

  const handleTransitionChange = (from, symbol, toValue) => {
    setTransitionsMap(prev => ({ ...prev, [`${from}-${symbol}`]: toValue }));
  };

  const loadTemplate = (e) => {
    const key = e.target.value;
    if (!key) return;
    const tmpl = TEMPLATES[key];
    setStatesInput(tmpl.states);
    setAlphabetInput(tmpl.alpha);
    setStartState(tmpl.start);
    setAcceptStatesInput(tmpl.accept);
    setTestString(tmpl.str);
    setTransitionsMap(tmpl.trans);
    
    setLayoutTrigger(prev => prev + 1);
    resetSimulation();
  };

  const resetSimulation = () => {
    setCurrentIndex(0);
    setCurrentState(startState);
    setActiveTransitionId(null);
    setStatus("WAITING");
    setIsPlaying(false);
  };

  const startSimulation = () => {
    setCurrentIndex(0);
    setCurrentState(startState);
    setActiveTransitionId(null);
    setStatus("RUNNING");
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isPlaying && status === "RUNNING") {
      timer = setTimeout(() => handleStepForward(), 1000); 
    } else if (status !== "RUNNING") {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, status, currentIndex, currentState]);

  const handleStepForward = () => {
    if (currentIndex >= testString.length) {
      if (acceptStates.includes(currentState)) setStatus("ACCEPTED");
      else setStatus("REJECTED");
      setActiveTransitionId(null);
      return;
    }

    const currentSymbol = testString[currentIndex];
    const targetState = transitionsMap[`${currentState}-${currentSymbol}`];

    if (targetState && states.includes(targetState.trim())) {
      setActiveTransitionId(`edge-${currentState}-${currentSymbol}-${targetState.trim()}`);
      setCurrentState(targetState.trim());
      setCurrentIndex(prev => prev + 1);
    } else {
      setStatus("REJECTED"); 
      setActiveTransitionId(null);
      setIsPlaying(false);
    }
  };

  const getStatusColor = () => {
    if (status === "ACCEPTED") return "bg-green-500";
    if (status === "REJECTED") return "bg-red-600";
    if (status === "RUNNING") return "bg-yellow-500";
    return "bg-gray-300";
  };

  const remainingString = testString.substring(currentIndex);

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1 className="header-title">Automaton Visualizer Engine</h1>
      </header>

      <div className="main-layout">
        
        {/* Left Panel: Controls */}
        <div className="panel-controls">
          <h2 className="section-title">Automaton Definition</h2>
          
          <select onChange={loadTemplate} className="form-input bg-blue-50 text-blue-900 font-bold mb-2 cursor-pointer outline-none">
            <option value="">-- Load Example Template Guide --</option>
            <option value="2-state">Example: 2 States</option>
            <option value="3-state">Example: 3 States</option>
            <option value="4-state">Example: 4 States</option>
            <option value="5-state">Example: 5 States</option>
          </select>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="form-label">States (Q)</label>
              <input type="text" value={statesInput} onChange={(e) => setStatesInput(e.target.value)} className="form-input" />
            </div>
            <div className="w-1/2">
              <label className="form-label">Alphabet (Σ)</label>
              <input type="text" value={alphabetInput} onChange={(e) => setAlphabetInput(e.target.value)} className="form-input" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="form-label">Start State (q0)</label>
              <input type="text" value={startState} onChange={(e) => setStartState(e.target.value)} className="form-input" />
            </div>
            <div className="w-1/2">
              <label className="form-label">Accept States (F)</label>
              <input type="text" value={acceptStatesInput} onChange={(e) => setAcceptStatesInput(e.target.value)} className="form-input" />
            </div>
          </div>

          <hr className="my-2 border-gray-200" />

          <div>
            <label className="form-label">Transition Function (δ)</label>
            <div className="overflow-x-auto rounded border border-gray-300">
              <table className="transition-table w-full">
                <thead>
                  <tr>
                    <th className="bg-gray-100 border p-2 text-sm">State</th>
                    {alphabet.map(sym => <th key={`head-${sym}`} className="bg-gray-100 border p-2 text-sm">Symbol '{sym}'</th>)}
                  </tr>
                </thead>
                <tbody>
                  {states.map(state => (
                    <tr key={`row-${state}`}>
                      <td className="font-bold bg-gray-50 border p-1 text-center">{state}</td>
                      {alphabet.map(sym => (
                        <td key={`cell-${state}-${sym}`} className="border p-1">
                          <input 
                            type="text" 
                            className="w-full text-center p-1 outline-none font-mono text-blue-600 font-bold focus:bg-blue-50"
                            value={transitionsMap[`${state}-${sym}`] || ""}
                            onChange={(e) => handleTransitionChange(state, sym, e.target.value)}
                            placeholder="-"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-2 border-gray-200" />

          <div>
            <label className="form-label">Input String (w)</label>
            <input type="text" value={testString} onChange={(e) => setTestString(e.target.value)} className="form-input font-mono text-2xl tracking-widest text-center" />
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={startSimulation} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 shadow">Start / Reset Execution</button>
            <button onClick={() => setLayoutTrigger(prev => prev + 1)} className="flex-1 border-2 border-indigo-500 text-indigo-600 bg-white py-2 rounded font-bold hover:bg-indigo-50 shadow">Auto-Arrange Chart</button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <button onClick={handleStepForward} disabled={status !== "RUNNING" || isPlaying} className="btn-secondary">Step Forward</button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              disabled={status !== "RUNNING"} 
              className={`btn-play ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isPlaying ? "Pause Auto-Run" : "▶ Auto-Run"}
            </button>
          </div>
        </div>

        {/* Center Panel: Graph */}
        <div className="panel-graph">
          <h2 className="section-title">Automaton Graph</h2>
          <div className="flex-1 min-h-0">
            <GraphVisualizer 
              states={states} 
              transitions={parsedTransitions} 
              startState={startState} 
              acceptStates={acceptStates} 
              currentState={currentState}
              activeTransitionId={activeTransitionId}
              layoutTrigger={layoutTrigger}
            />
          </div>
        </div>

        {/* Right Panel: Scoreboard */}
        <div className="panel-scoreboard">
          <div>
            <h2 className="section-title">Execution Tracking</h2>
            
            <div className="mb-8 mt-8">
              <p className="status-label text-center">Active Node</p>
              <div className="status-value">{currentState || "-"}</div>
            </div>
            
            <div className="mb-6">
              <p className="status-label text-center">Tape Head</p>
              <div className="remaining-string-box">
                {status === "RUNNING" && remainingString.length > 0 ? (
                  <><span className="highlight-char">{remainingString[0]}</span>{remainingString.substring(1)}</>
                ) : remainingString.length === 0 && status === "RUNNING" ? "ε" : "-"}
              </div>
            </div>
          </div>
          
          <div className={`result-board ${getStatusColor()}`}>
            {status}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;