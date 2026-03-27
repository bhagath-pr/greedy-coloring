import { useState, useEffect, useRef } from "react";

const COLORS = [
  { name: "Color 1", bg: "#9a4731", text: "#fff", light: "#f5e6e1" },
{ name: "Color 2", bg: "#2a5f8f", text: "#fff", light: "#e1ecf5" },
{ name: "Color 3", bg: "#2d7a4f", text: "#fff", light: "#e1f5eb" },
{ name: "Color 4", bg: "#7a4f2d", text: "#fff", light: "#f5ece1" },
{ name: "Color 5", bg: "#5a2d7a", text: "#fff", light: "#ede1f5" },
];

// Graph definition: 7 vertices, interesting enough structure
const VERTICES = [
  { id: 0, label: "v₁", x: 340, y: 60 },
{ id: 1, label: "v₂", x: 520, y: 160 },
{ id: 2, label: "v₃", x: 480, y: 340 },
{ id: 3, label: "v₄", x: 280, y: 390 },
{ id: 4, label: "v₅", x: 140, y: 260 },
{ id: 5, label: "v₆", x: 180, y: 110 },
{ id: 6, label: "v₇", x: 340, y: 220 },
];

const EDGES = [
  [0, 1], [0, 5], [0, 6],
[1, 2], [1, 6],
[2, 3], [2, 6],
[3, 4], [3, 6],
[4, 5], [4, 6],
[5, 6],
];

function buildAdjacency() {
  const adj = {};
  VERTICES.forEach(v => { adj[v.id] = []; });
  EDGES.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  return adj;
}

function greedyStep(coloring, adj, stepIndex) {
  if (stepIndex >= VERTICES.length) return coloring;
  const vId = VERTICES[stepIndex].id;
  const neighborColors = new Set(
    adj[vId].map(n => coloring[n]).filter(c => c !== undefined)
  );
  let assigned = 0;
  while (neighborColors.has(assigned)) assigned++;
  return { ...coloring, [vId]: assigned };
}

export default function GreedyColoring() {
  const adj = useRef(buildAdjacency()).current;
  const [step, setStep] = useState(-1);
  const [coloring, setColoring] = useState({});
  const [hoveredVertex, setHoveredVertex] = useState(null);
  const [lastAssigned, setLastAssigned] = useState(null);
  const [animating, setAnimating] = useState(false);

  const isDone = step >= VERTICES.length - 1;
  const currentVertex = step >= 0 ? VERTICES[step] : null;

  function handleNext() {
    if (isDone || animating) return;
    const nextStep = step + 1;
    const newColoring = greedyStep(coloring, adj, nextStep);
    setAnimating(true);
    setLastAssigned(nextStep);
    setStep(nextStep);
    setColoring(newColoring);
    setTimeout(() => setAnimating(false), 500);
  }

  function handleReset() {
    setStep(-1);
    setColoring({});
    setLastAssigned(null);
    setAnimating(false);
  }

  function getVertexColor(vId) {
    if (coloring[vId] === undefined) return null;
    return COLORS[coloring[vId]];
  }

  function isActiveNeighbor(vId) {
    if (step < 0 || isDone) return false;
    const next = step + 1;
    if (next >= VERTICES.length) return false;
    const nextId = VERTICES[next].id;
    return adj[nextId].includes(vId) && coloring[vId] !== undefined;
  }

  function isNextVertex(vId) {
    if (isDone) return false;
    const next = step + 1;
    if (next >= VERTICES.length) return false;
    return VERTICES[next].id === vId;
  }

  const nextVtx = step + 1 < VERTICES.length ? VERTICES[step + 1] : null;
  const neighborColorsOfNext = nextVtx
  ? [...new Set(adj[nextVtx.id].map(n => coloring[n]).filter(c => c !== undefined))]
  : [];
  let nextColor = 0;
  while (neighborColorsOfNext.includes(nextColor)) nextColor++;

  const colorsUsed = [...new Set(Object.values(coloring))];

  return (
    <div style={{
      fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
      background: "#faf8f5",
      minHeight: "100vh",
      padding: "0",
      color: "#1a1a1a",
    }}>
    {/* Header */}
    <div style={{
      background: "#9a4731",
      padding: "20px 32px 16px",
      borderBottom: "3px solid #7a3521",
    }}>
    <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#f5c4b0", textTransform: "uppercase", marginBottom: 4 }}>
    Graph Theory · Interactive Demo
    </div>
    <div style={{ fontSize: 22, fontWeight: "bold", color: "#fff", letterSpacing: "0.01em" }}>
    Greedy Coloring Algorithm
    </div>
    </div>

    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 80px)" }}>

    {/* Left panel: graph */}
    <div style={{ flex: "1 1 0", padding: "24px 16px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
    Graph G — 7 vertices, 12 edges
    </div>

    <svg width="100%" viewBox="0 0 660 460" style={{ maxWidth: 480, border: "1px solid #e0dbd4", borderRadius: 8, background: "#fff" }}>
    {/* Edges */}
    {EDGES.map(([a, b], i) => {
      const va = VERTICES[a], vb = VERTICES[b];
      const isHighlighted = nextVtx && (
        (va.id === nextVtx.id && coloring[vb.id] !== undefined) ||
        (vb.id === nextVtx.id && coloring[va.id] !== undefined)
      );
      return (
        <line key={i}
        x1={va.x} y1={va.y} x2={vb.x} y2={vb.y}
        stroke={isHighlighted ? "#9a4731" : "#ccc"}
        strokeWidth={isHighlighted ? 2.5 : 1.5}
        strokeDasharray={isHighlighted ? "none" : "none"}
        opacity={isHighlighted ? 1 : 0.7}
        />
      );
    })}

    {/* Vertices */}
    {VERTICES.map((v) => {
      const vc = getVertexColor(v.id);
      const isNext = isNextVertex(v.id);
      const isNeighbor = isActiveNeighbor(v.id);
      const isJustColored = lastAssigned !== null && VERTICES[lastAssigned]?.id === v.id;

      let fill = "#f0ede8";
      let stroke = "#bbb";
      let strokeWidth = 1.5;
      let r = 22;

      if (vc) {
        fill = vc.bg;
        stroke = vc.bg;
        strokeWidth = 2;
      }
      if (isNext) {
        stroke = "#9a4731";
        strokeWidth = 3;
        fill = vc ? vc.bg : "#fff8f5";
        r = 24;
      }
      if (isNeighbor) {
        strokeWidth = 2.5;
        stroke = "#555";
      }

      return (
        <g key={v.id}
        onMouseEnter={() => setHoveredVertex(v.id)}
        onMouseLeave={() => setHoveredVertex(null)}
        style={{ cursor: "default" }}
        >
        {isNext && (
          <circle cx={v.x} cy={v.y} r={r + 8}
          fill="none" stroke="#9a4731" strokeWidth={1}
          strokeDasharray="4 3" opacity={0.5}
          />
        )}
        {isJustColored && animating && (
          <circle cx={v.x} cy={v.y} r={r + 14}
          fill="none" stroke={vc?.bg || "#9a4731"}
          strokeWidth={2} opacity={0.3}
          />
        )}
        <circle
        cx={v.x} cy={v.y} r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        />
        <text
        x={v.x} y={v.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontFamily="Palatino, Georgia, serif"
        fontStyle="italic"
        fill={vc ? "#fff" : isNext ? "#9a4731" : "#444"}
        fontWeight={isNext ? "bold" : "normal"}
        >
        {v.label}
        </text>
        </g>
      );
    })}
    </svg>

    {/* Color legend */}
    {colorsUsed.length > 0 && (
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      {colorsUsed.map(ci => (
        <div key={ci} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: COLORS[ci].light, border: `1px solid ${COLORS[ci].bg}`,
          borderRadius: 20, padding: "4px 12px",
          fontSize: 12, color: COLORS[ci].bg, fontWeight: "bold"
        }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[ci].bg }} />
        {COLORS[ci].name}
        </div>
      ))}
      </div>
    )}
    </div>

    {/* Right panel: step log + controls */}
    <div style={{
      width: 280, background: "#f2ede7",
      borderLeft: "1px solid #ddd6cc",
      padding: "24px 20px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>

    {/* Status */}
    <div>
    <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
    Status
    </div>
    <div style={{
      background: "#fff", border: "1px solid #e0d8ce",
      borderRadius: 6, padding: "12px 14px", fontSize: 13,
    }}>
    {step === -1 && (
      <span style={{ color: "#888" }}>Press <b>Next Step</b> to begin coloring v₁.</span>
    )}
    {step >= 0 && !isDone && (
      <>
      <div style={{ marginBottom: 6 }}>
      <span style={{ color: "#9a4731", fontWeight: "bold" }}>
      {VERTICES[step].label}
      </span> just colored with{" "}
      <span style={{
        background: COLORS[coloring[VERTICES[step].id]]?.bg,
        color: "#fff", borderRadius: 4,
        padding: "1px 7px", fontSize: 12
      }}>
      {COLORS[coloring[VERTICES[step].id]]?.name}
      </span>
      </div>
      <div style={{ color: "#666", fontSize: 12 }}>
      Next: assign color to{" "}
      <span style={{ fontStyle: "italic", fontWeight: "bold", color: "#9a4731" }}>
      {VERTICES[step + 1]?.label}
      </span>
      </div>
      </>
    )}
    {isDone && (
      <div style={{ color: "#2d7a4f", fontWeight: "bold" }}>
      ✓ All vertices colored!<br />
      <span style={{ fontWeight: "normal", fontSize: 12, color: "#555" }}>
      {colorsUsed.length} color{colorsUsed.length > 1 ? "s" : ""} used.
      </span>
      </div>
    )}
    </div>
    </div>

    {/* Next step reasoning */}
    {!isDone && step >= 0 && nextVtx && (
      <div>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
      Next Step Reasoning
      </div>
      <div style={{
        background: "#fff8f5", border: "1px solid #e8c4b0",
        borderRadius: 6, padding: "12px 14px", fontSize: 12, lineHeight: 1.7
      }}>
      <div><b style={{ color: "#9a4731" }}>{nextVtx.label}</b>'s colored neighbors:</div>
      {adj[nextVtx.id].filter(n => coloring[n] !== undefined).length === 0
        ? <div style={{ color: "#888", fontStyle: "italic" }}>None yet — assign Color 1</div>
        : adj[nextVtx.id].filter(n => coloring[n] !== undefined).map(n => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ fontStyle: "italic" }}>{VERTICES[n].label}</span>
          <span style={{ fontSize: 10 }}>→</span>
          <span style={{
            background: COLORS[coloring[n]]?.bg,
            color: "#fff", borderRadius: 4,
            padding: "1px 7px", fontSize: 11
          }}>
          {COLORS[coloring[n]]?.name}
          </span>
          </div>
        ))
      }
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0d8cc" }}>
      Colors blocked:{" "}
      {neighborColorsOfNext.length === 0
        ? <span style={{ color: "#888" }}>none</span>
        : neighborColorsOfNext.map(ci => (
          <span key={ci} style={{
            background: COLORS[ci]?.bg, color: "#fff",
            borderRadius: 4, padding: "1px 6px",
            fontSize: 11, marginRight: 4
          }}>
          {COLORS[ci]?.name}
          </span>
        ))
      }
      </div>
      <div style={{ marginTop: 6, fontWeight: "bold", color: "#9a4731" }}>
      Will assign: {COLORS[nextColor]?.name}
      </div>
      </div>
      </div>
    )}

    {/* Step log */}
    <div style={{ flex: 1 }}>
    <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
    Step Log
    </div>
    <div style={{
      background: "#fff", border: "1px solid #e0d8ce",
      borderRadius: 6, padding: "8px 10px",
      maxHeight: 200, overflowY: "auto",
      fontSize: 12, lineHeight: 1.8
    }}>
    {step === -1 && <div style={{ color: "#bbb", fontStyle: "italic" }}>No steps yet.</div>}
    {VERTICES.slice(0, step + 1).map((v, i) => (
      <div key={v.id} style={{
        display: "flex", alignItems: "center", gap: 8,
        borderBottom: i < step ? "1px solid #f0ece6" : "none",
        paddingBottom: 4, marginBottom: 4
      }}>
      <span style={{ color: "#aaa", minWidth: 18 }}>{i + 1}.</span>
      <span style={{ fontStyle: "italic", minWidth: 22 }}>{v.label}</span>
      <span style={{ fontSize: 10, color: "#999" }}>→</span>
      <span style={{
        background: COLORS[coloring[v.id]]?.bg,
        color: "#fff", borderRadius: 4,
        padding: "1px 8px", fontSize: 11
      }}>
      {COLORS[coloring[v.id]]?.name}
      </span>
      </div>
    ))}
    </div>
    </div>

    {/* Stats */}
    {step >= 0 && (
      <div style={{
        background: "#fff", border: "1px solid #e0d8ce",
        borderRadius: 6, padding: "10px 14px",
        display: "flex", justifyContent: "space-between",
        fontSize: 12
      }}>
      <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: "bold", color: "#9a4731" }}>{step + 1}</div>
      <div style={{ color: "#999" }}>vertices colored</div>
      </div>
      <div style={{ width: 1, background: "#e0d8ce" }} />
      <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: "bold", color: "#2a5f8f" }}>{colorsUsed.length}</div>
      <div style={{ color: "#999" }}>colors used</div>
      </div>
      <div style={{ width: 1, background: "#e0d8ce" }} />
      <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: "bold", color: "#2d7a4f" }}>{VERTICES.length - step - 1}</div>
      <div style={{ color: "#999" }}>remaining</div>
      </div>
      </div>
    )}

    {/* Buttons */}
    <div style={{ display: "flex", gap: 10 }}>
    <button
    onClick={handleNext}
    disabled={isDone}
    style={{
      flex: 2,
      background: isDone ? "#ddd" : "#9a4731",
      color: isDone ? "#999" : "#fff",
      border: "none", borderRadius: 6,
      padding: "12px 0", fontSize: 14,
      fontFamily: "inherit", fontWeight: "bold",
      cursor: isDone ? "not-allowed" : "pointer",
      letterSpacing: "0.03em",
      transition: "background 0.2s",
    }}
    >
    {step === -1 ? "Start" : isDone ? "Done" : "Next Step →"}
    </button>
    <button
    onClick={handleReset}
    style={{
      flex: 1,
      background: "transparent",
      color: "#9a4731",
      border: "1.5px solid #9a4731",
      borderRadius: 6,
      padding: "12px 0", fontSize: 13,
      fontFamily: "inherit",
      cursor: "pointer",
      letterSpacing: "0.03em",
    }}
    >
    Reset
    </button>
    </div>

    {/* Guarantee note */}
    <div style={{
      fontSize: 11, color: "#aaa", lineHeight: 1.6,
      borderTop: "1px solid #e0d8ce", paddingTop: 12
    }}>
    Greedy guarantees a valid coloring in O(V+E) time. Colors used ≤ 1 + d<sub>max</sub>. Result depends on vertex ordering.
    </div>
    </div>
    </div>
    </div>
  );
}
