import { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState("DEG"); // DEG or RAD
  const [isSecond, setIsSecond] = useState(false); // 2nd functions toggle

  // ---------- Core helpers ----------

  const handleClick = (value) => {
    setInput((prev) => prev + value);
  }

  const clearInput = () => {
    setInput("");
  }

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  }

  const toggleSign = () => {
    setInput((prev) => {
      if (!prev) return prev;
      if (prev.startsWith("-")) return prev.slice(1);
      return "-" + prev;
    });
}

  const factorial = (n) => {
    n = Number(n);
    if (!Number.isFinite(n) ||  n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  const sinFn = (x) => {
  return angleMode === "DEG"
    ? Math.sin((x * Math.PI) / 180)
    : Math.sin(x);
};

const cosFn = (x) => {
  return angleMode === "DEG"
    ? Math.cos((x * Math.PI) / 180)
    : Math.cos(x);
};

const tanFn = (x) => {
  return angleMode === "DEG"
    ? Math.tan((x * Math.PI) / 180)
    : Math.tan(x);
};

const asinFn = (x) => {
  return angleMode === "DEG"
    ? (Math.asin(x) * 180) / Math.PI
    : Math.asin(x);
};

const acosFn = (x) => {
  return angleMode === "DEG"
    ? (Math.acos(x) * 180) / Math.PI
    : Math.acos(x);
};

const atanFn = (x) => {
  return angleMode === "DEG"
    ? (Math.atan(x) * 180) / Math.PI
    : Math.atan(x);
};

  // ---------- Memory functions ----------
  const memoryClear = () => {
    setMemory(0);
  };

  const memoryAdd = () => {
    setMemory((prev) => prev + Number(input) || 0);
  };

  const memorySubtract = () => {
    setMemory((prev) => prev - Number(input) || 0);
  };

  const memoryRecall = () => {
    setInput((prev) => prev + memory.toString());
  };

  // ---------- Angle + 2nd toggle ----------

  const toggleAngleMode = () => {
    setAngleMode((prev) => (prev === "DEG" ? "RAD" : "DEG"));
  };

  const toggleSecond = () => {
    setIsSecond((prev) => !prev);
  };

  // ---------- Percent ----------
  const handlePercent = () => {
    if (!input) return;
    const value = Number(input);
    if (isNaN(value)) return;
    setInput((value / 100).toString());
  }

  // ---------- Expression preprocessing ----------

  const preprocessExpression = (expr) => {
    let e = expr;

    // Replace Unicode division/multiply if you ever use them 
    e = e.replace(/÷/g, "/").replace(/×/g, "*");

    // Pi and e (use word boundary for e to avoid 'exp')
    e = e.replace(/π/g, "Math.PI");
    e = e.replace(/\be\b/g, "Math.E");

    // Trig and inverse trig - wrapper functions
    e = e.replace(/sin\(/g, "sinFn(");
    e = e.replace(/cos\(/g, "cosFn(");
    e = e.replace(/tan\(/g, "tanFn(");

    e = e.replace(/asin\(/g, "asinFn(");
    e = e.replace(/acos\(/g, "acosFn(");
    e = e.replace(/atan\(/g, "atanFn(");

    // Hyperbolic
    e = e.replace(/sinh\(/g, "Math.sinh(");
    e = e.replace(/cosh\(/g, "Math.cosh(");
    e = e.replace(/tanh\(/g, "Math.tanh(");

    // Log
    e = e.replace(/ln\(/g, "Math.log(");
    e = e.replace(/log\(/g, "Math.log10(");

    // Square root symbol
    e = e.replace(/√\(/g, "Math.sqrt(");

    // Factorial: simple number! support
    e = e.replace(/(\d+)!/g, "factorial($1)");

    // EE notation: aEEb = a * 10**b
    e = e.replace(
      /(\d+(?:\.\d+)?)EE(-?\d+(?:\.\d+)?)/g,
      "($1*10**$2)"
    );

    return e;
  };

  const calculate = () => {
    if (!input) return;

    try {
      const expr = preprocessExpression(input);

      // Use Function instead of eval, and inject only what we need
      const fn = new Function(
        "sinFn",
        "cosFn",
        "tanFn",
        "asinFn",
        "acosFn",
        "atanFn",
        "factorial",
        "Math",
        `"use strict"; return (${expr});`
      );

      const result = fn(
        sinFn,
        cosFn,
        tanFn,
        asinFn,
        acosFn,
        atanFn,
        factorial,
        Math
      );

      if (result === undefined || result === null || Number.isNaN(result)) {
        setInput("Error");
      } else {
        setInput(result.toString());
      }
    } catch (err) {
      console.error(err);
      setInput("Error");
    }
  };

  // ---------- Rand ----------

  const handleRandom = () => {
    const rand = Math.random().toString();
    setInput((prev) => prev + rand);
  };

  
  return (
    <>
      <div className='calculator-container'>
      <input className='calculator-display' type='text' value={input} readOnly />

      <div className='grid'>
        <button onClick={() => handleClick('(')}>(</button>
        <button onClick={() => handleClick(')')}>)</button>
        <button onClick={memoryClear}>MC</button>
        <button onClick={memoryAdd}>M+</button>
        <button onClick={memorySubtract}>M-</button>
        <button onClick={memoryRecall}>MR</button>

        <button onClick={toggleSecond}>
            {isSecond ? "2ⁿᵈ (ON)" : "2ⁿᵈ"}
        </button>
        <button onClick={() => handleClick('**2')}>x²</button>
        <button onClick={() => handleClick('**3')}>x³</button>
        <button onClick={() => handleClick('**')}>xʸ</button>
        <button onClick={() => handleClick('Math.exp(')}>eˣ</button>
        <button onClick={() => handleClick('10**')}>10ˣ</button>

        
          <button
            onClick={() => {
              if (!input) return;
              setInput(`1/(${input})`);
            }}
          >
            1/x
          </button>
        <button onClick={() => handleClick("√(")}>√x</button>
          {/* For simplicity, skip ∛ and ∜ special symbols */}
          <button
            onClick={() => {
              if (!input) return;
              setInput(`Math.cbrt(${input})`);
            }}
          >
            ∛x
          </button>
          <button
            onClick={() => {
              if (!input) return;
              setInput(`Math.pow(${input},1/4)`);
            }}
          >
            ∜x
          </button>
          <button onClick={() => handleClick("ln(")}>ln</button>
          <button onClick={() => handleClick("log(")}>log₁₀</button>

        <button onClick={() => handleClick('!')}>x!</button>
        <button
            onClick={() =>
              handleClick(isSecond ? "asin(" : "sin(")
            }
          >
            {isSecond ? "sin⁻¹" : "sin"}
          </button>
          <button
            onClick={() =>
              handleClick(isSecond ? "acos(" : "cos(")
            }
          >
            {isSecond ? "cos⁻¹" : "cos"}
          </button>
          <button
            onClick={() =>
              handleClick(isSecond ? "atan(" : "tan(")
            }
          >
            {isSecond ? "tan⁻¹" : "tan"}
          </button>
          <button onClick={() => handleClick("e")}>e</button>
          <button onClick={() => handleClick("EE")}>EE</button>

        <button onClick={handleRandom}>Rand</button>
        <button onClick={() => handleClick("sinh(")}>sinh</button>
        <button onClick={() => handleClick("cosh(")}>cosh</button>
        <button onClick={() => handleClick("tanh(")}>tanh</button>
        <button onClick={() => handleClick("π")}>π</button>
        <button onClick={toggleAngleMode}>{angleMode}</button>
      </div>
      <div className='calculator-grid'>
        <button onClick={clearInput} className='clear'>C</button>
        <button onClick={handleBackspace} className='backspace'>←</button>
        <button onClick={() => handleClick('%')}>%</button>
        <button onClick={() => handleClick('/')} className='operator'>÷</button>

        <button onClick={() => handleClick('7')}>7</button>
        <button onClick={() => handleClick('8')}>8</button>
        <button onClick={() => handleClick('9')}>9</button>
        <button onClick={() => handleClick('*')} className='operator'>*</button>

        <button onClick={() => handleClick('4')}>4</button>
        <button onClick={() => handleClick('5')}>5</button>
        <button onClick={() => handleClick('6')}>6</button>
        <button onClick={() => handleClick('-')} className='operator'>-</button>

        <button onClick={() => handleClick('1')}>1</button>
        <button onClick={() => handleClick('2')}>2</button>
        <button onClick={() => handleClick('3')}>3</button>
        <button onClick={() => handleClick('+')} className='operator'>+</button>

        <button onClick={toggleSign} className='toggle-sign'>+/-</button>
        <button onClick={() => handleClick('0')}>0</button>
        <button onClick={() => handleClick('.')}>.</button>
        <button onClick={calculate} className='equal'>=</button>
        </div>  
    </div>
    </>
  )
};

export default App;