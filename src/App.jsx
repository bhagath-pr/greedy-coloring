import { useState, useEffect, useRef } from "react";

const COLORS = [
  { name: "Color 1", bg: "#c0392b", text: "#fff", light: "#f5e6e1", dark: "#4a1a10" },
{ name: "Color 2", bg: "#2a5f8f", text: "#fff", light: "#e1ecf5", dark: "#0f2a40" },
{ name: "Color 3", bg: "#2d7a4f", text: "#fff", light: "#e1f5eb", dark: "#0f3320" },
{ name: "Color 4", bg: "#b07d2d", text: "#fff", light: "#f5ece1", dark: "#3d2a0a" },
{ name: "Color 5", bg: "#7b3fa0", text: "#fff", light: "#ede1f5", dark: "#2e1040" },
];

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

function useOrientation() {
  const [state, setState] = useState(() => ({
    isLandscape: window.innerWidth > window.innerHeight,
    isMobile: window.innerWidth < 768,
  }));
  useEffect(() => {
    function update() {
      setState({
        isLandscape: window.innerWidth > window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return state;
}

function getTheme(dark) {
  if (dark) return {
    pageBg: "#9a4731",
    headerBg: "#7a3521",
    headerBorder: "#5a2510",
    panelBg: "#7a3521",
    panelBorder: "#5a2510",
    cardBg: "#6a2d1a",
    cardBorder: "#8a4530",
    reasoningBg: "#5a2510",
    reasoningBorder: "#8a4530",
    text: "#fdf0eb",
    textMuted: "#d4a898",
    textFaint: "#b08070",
    svgBg: "#3d1a0d",
    svgBorder: "#6a3020",
    vertexDefault: "#5a2510",
    vertexDefaultStroke: "#8a4530",
    divider: "#8a4530",
    logBorder: "#8a4530",
    accentText: "#ffb899",
    headerSubtext: "#f5c4b0",
  };
  return {
    pageBg: "#faf8f5",
    headerBg: "#9a4731",
    headerBorder: "#7a3521",
    panelBg: "#f2ede7",
    panelBorder: "#ddd6cc",
    cardBg: "#ffffff",
    cardBorder: "#e0d8ce",
    reasoningBg: "#fff8f5",
    reasoningBorder: "#e8c4b0",
    text: "#1a1a1a",
    textMuted: "#666",
    textFaint: "#999",
    svgBg: "#ffffff",
    svgBorder: "#e0dbd4",
    vertexDefault: "#f0ede8",
    vertexDefaultStroke: "#bbb",
    divider: "#e0d8ce",
    logBorder: "#f0ece6",
    accentText: "#9a4731",
    headerSubtext: "#f5c4b0",
  };
}

export default function GreedyColoring() {
  const adj = useRef(buildAdjacency()).current;
  const [step, setStep] = useState(-1);
  const [coloring, setColoring] = useState({});
  const [hoveredVertex, setHoveredVertex] = useState(null);
  const [lastAssigned, setLastAssigned] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [dark, setDark] = useState(false);
  const { isLandscape, isMobile } = useOrientation();
  const T = getTheme(dark);

  const isDone = step >= VERTICES.length - 1;

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
    return adj[VERTICES[next].id].includes(vId) && coloring[vId] !== undefined;
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

  // ── Rotate overlay (mobile + portrait only) ──
  if (isMobile && !isLandscape) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: dark ? "#9a4731" : "#faf8f5",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
        color: dark ? "#fdf0eb" : "#1a1a1a",
        textAlign: "center", padding: 32, gap: 22,
        transition: "background 0.3s",
      }}>
      <svg width="68" height="68" viewBox="0 0 72 72" fill="none">
      <style>{`
        @keyframes rp {
          0%,100% { transform: rotate(0deg); }
          40%,60% { transform: rotate(90deg); }
        }
        .rg { transform-origin: 36px 36px; animation: rp 2.4s ease-in-out infinite; }
        `}</style>
        <g className="rg">
        <rect x="22" y="10" width="28" height="52" rx="5"
        fill="none" stroke="#9a4731" strokeWidth="3"/>
        <circle cx="36" cy="55" r="3" fill="#9a4731"/>
        <rect x="30" y="13" width="12" height="2" rx="1" fill="#9a4731"/>
        </g>
        <path d="M8 44 Q4 36 8 28" stroke={dark ? "#f5c4b0" : "#9a4731"}
        strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M5.5 28.5 L8.5 27 L10 30"
        stroke={dark ? "#f5c4b0" : "#9a4731"}
        strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div style={{ fontSize: 20, fontWeight: "bold", color: "#9a4731" }}>
        Rotate your device
        </div>
        <div style={{ fontSize: 14, color: dark ? "#d4a898" : "#666", maxWidth: 260, lineHeight: 1.75 }}>
        This demo is best viewed in <b>landscape mode</b>.
        Please rotate your phone sideways to continue.
        </div>
        <button onClick={() => setDark(d => !d)} style={{
          background: "transparent",
          border: "1.5px solid #9a4731",
          borderRadius: 20, padding: "7px 20px",
          fontSize: 13, color: "#9a4731",
          fontFamily: "inherit", cursor: "pointer",
        }}>
        {dark ? "☀ Light mode" : "☾ Dark mode"}
        </button>
        </div>
    );
  }

  // ── Main app ──
  return (
    <div style={{
      fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
      background: T.pageBg,
      minHeight: "100vh",
      color: T.text,
      transition: "background 0.3s, color 0.3s",
    }}>
    {/* Header */}
    <div style={{
      background: T.headerBg,
      padding: "15px 24px",
      borderBottom: `3px solid ${T.headerBorder}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
    <div>
    <div style={{ fontSize: 10, letterSpacing: "0.18em", color: T.headerSubtext, textTransform: "uppercase", marginBottom: 3 }}>
    Graph Theory · Interactive Demo
    </div>
    <div style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
    Greedy Coloring Algorithm
    </div>
    </div>
    <button
    onClick={() => setDark(d => !d)}
    style={{
      background: "rgba(255,255,255,0.15)",
          border: "1.5px solid rgba(255,255,255,0.4)",
          borderRadius: 20, padding: "6px 16px",
          color: "#fff", fontSize: 13,
          fontFamily: "inherit", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          whiteSpace: "nowrap",
          transition: "background 0.2s",
    }}
    >
    {dark ? "☀ Light" : "☾ Dark"}
    </button>
    </div>

    <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>

    {/* Graph panel */}
    <div style={{ flex: "1 1 0", padding: "18px 12px 18px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontSize: 10, color: T.textFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
    Graph G — 7 vertices, 12 edges
    </div>

    <svg width="100%" viewBox="0 0 660 460" style={{
      maxWidth: 480, border: `1px solid ${T.svgBorder}`,
      borderRadius: 8, background: T.svgBg, transition: "background 0.3s",
    }}>
    {EDGES.map(([a, b], i) => {
      const va = VERTICES[a], vb = VERTICES[b];
      const hi = nextVtx && (
        (va.id === nextVtx.id && coloring[vb.id] !== undefined) ||
        (vb.id === nextVtx.id && coloring[va.id] !== undefined)
      );
      return (
        <line key={i} x1={va.x} y1={va.y} x2={vb.x} y2={vb.y}
        stroke={hi ? "#c0392b" : (dark ? "#6a4030" : "#ccc")}
        strokeWidth={hi ? 2.5 : 1.5} opacity={hi ? 1 : 0.7}
        />
      );
    })}
    {VERTICES.map((v) => {
      const vc = getVertexColor(v.id);
      const isNext = isNextVertex(v.id);
      const isNeighbor = isActiveNeighbor(v.id);
      const isJustColored = lastAssigned !== null && VERTICES[lastAssigned]?.id === v.id;
      let fill = T.vertexDefault, stroke = T.vertexDefaultStroke, sw = 1.5, r = 22;
      if (vc) { fill = vc.bg; stroke = vc.bg; sw = 2; }
      if (isNext) { stroke = "#c0392b"; sw = 3; fill = vc ? vc.bg : (dark ? "#5a2010" : "#fff8f5"); r = 24; }
      if (isNeighbor) { sw = 2.5; stroke = dark ? "#ffb899" : "#555"; }
      return (
        <g key={v.id}
        onMouseEnter={() => setHoveredVertex(v.id)}
        onMouseLeave={() => setHoveredVertex(null)}
        style={{ cursor: "default" }}
        >
        {isNext && <circle cx={v.x} cy={v.y} r={r + 8} fill="none" stroke="#c0392b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}/>}
        {isJustColored && animating && <circle cx={v.x} cy={v.y} r={r + 14} fill="none" stroke={vc?.bg || "#c0392b"} strokeWidth={2} opacity={0.3}/>}
        <circle cx={v.x} cy={v.y} r={r} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <text x={v.x} y={v.y + 1} textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontFamily="Palatino, Georgia, serif" fontStyle="italic"
        fill={vc ? "#fff" : isNext ? "#c0392b" : (dark ? "#e0b0a0" : "#444")}
        fontWeight={isNext ? "bold" : "normal"}>
        {v.label}
        </text>
        </g>
      );
    })}
    </svg>

    {colorsUsed.length > 0 && (
      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {colorsUsed.map(ci => (
        <div key={ci} style={{
          display: "flex", alignItems: "center", gap: 5,
          background: dark ? COLORS[ci].dark : COLORS[ci].light,
          border: `1px solid ${COLORS[ci].bg}`,
          borderRadius: 20, padding: "3px 10px",
          fontSize: 11, color: dark ? "#fff" : COLORS[ci].bg, fontWeight: "bold",
        }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[ci].bg }}/>
        {COLORS[ci].name}
        </div>
      ))}
      </div>
    )}
    </div>

    {/* Side panel */}
    <div style={{
      width: 272, background: T.panelBg,
      borderLeft: `1px solid ${T.panelBorder}`,
      padding: "18px 16px",
      display: "flex", flexDirection: "column", gap: 13,
      transition: "background 0.3s",
    }}>
    {/* Status */}
    <div>
    <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textFaint, marginBottom: 6 }}>Status</div>
    <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "11px 13px", fontSize: 13, transition: "background 0.3s" }}>
    {step === -1 && <span style={{ color: T.textMuted }}>Press <b>Start</b> to begin coloring v₁.</span>}
    {step >= 0 && !isDone && (
      <>
      <div style={{ marginBottom: 5 }}>
      <span style={{ color: T.accentText, fontWeight: "bold" }}>{VERTICES[step].label}</span>{" "}colored with{" "}
      <span style={{ background: COLORS[coloring[VERTICES[step].id]]?.bg, color: "#fff", borderRadius: 4, padding: "1px 7px", fontSize: 12 }}>
      {COLORS[coloring[VERTICES[step].id]]?.name}
      </span>
      </div>
      <div style={{ color: T.textMuted, fontSize: 12 }}>
      Next: <span style={{ fontStyle: "italic", fontWeight: "bold", color: T.accentText }}>{VERTICES[step + 1]?.label}</span>
      </div>
      </>
    )}
    {isDone && (
      <div style={{ color: "#2d7a4f", fontWeight: "bold" }}>
      ✓ All vertices colored!<br/>
      <span style={{ fontWeight: "normal", fontSize: 12, color: T.textMuted }}>{colorsUsed.length} color{colorsUsed.length > 1 ? "s" : ""} used.</span>
      </div>
    )}
    </div>
    </div>

    {/* Reasoning */}
    {!isDone && step >= 0 && nextVtx && (
      <div>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textFaint, marginBottom: 6 }}>Next Step Reasoning</div>
      <div style={{ background: T.reasoningBg, border: `1px solid ${T.reasoningBorder}`, borderRadius: 6, padding: "11px 13px", fontSize: 12, lineHeight: 1.7, transition: "background 0.3s" }}>
      <div><b style={{ color: T.accentText }}>{nextVtx.label}</b>'s colored neighbors:</div>
      {adj[nextVtx.id].filter(n => coloring[n] !== undefined).length === 0
        ? <div style={{ color: T.textFaint, fontStyle: "italic" }}>None yet — assign Color 1</div>
        : adj[nextVtx.id].filter(n => coloring[n] !== undefined).map(n => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontStyle: "italic" }}>{VERTICES[n].label}</span>
          <span style={{ fontSize: 10, color: T.textFaint }}>→</span>
          <span style={{ background: COLORS[coloring[n]]?.bg, color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>
          {COLORS[coloring[n]]?.name}
          </span>
          </div>
        ))
      }
      <div style={{ marginTop: 7, paddingTop: 7, borderTop: `1px solid ${T.reasoningBorder}` }}>
      Blocked:{" "}
      {neighborColorsOfNext.length === 0
        ? <span style={{ color: T.textFaint }}>none</span>
        : neighborColorsOfNext.map(ci => (
          <span key={ci} style={{ background: COLORS[ci]?.bg, color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 11, marginRight: 3 }}>
          {COLORS[ci]?.name}
          </span>
        ))
      }
      </div>
      <div style={{ marginTop: 5, fontWeight: "bold", color: T.accentText }}>
      Will assign: {COLORS[nextColor]?.name}
      </div>
      </div>
      </div>
    )}

    {/* Step log */}
    <div style={{ flex: 1 }}>
    <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textFaint, marginBottom: 6 }}>Step Log</div>
    <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "7px 10px", maxHeight: 175, overflowY: "auto", fontSize: 12, lineHeight: 1.8, transition: "background 0.3s" }}>
    {step === -1 && <div style={{ color: T.textFaint, fontStyle: "italic" }}>No steps yet.</div>}
    {VERTICES.slice(0, step + 1).map((v, i) => (
      <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 7, borderBottom: i < step ? `1px solid ${T.logBorder}` : "none", paddingBottom: 3, marginBottom: 3 }}>
      <span style={{ color: T.textFaint, minWidth: 16 }}>{i + 1}.</span>
      <span style={{ fontStyle: "italic", minWidth: 22 }}>{v.label}</span>
      <span style={{ fontSize: 10, color: T.textFaint }}>→</span>
      <span style={{ background: COLORS[coloring[v.id]]?.bg, color: "#fff", borderRadius: 4, padding: "1px 7px", fontSize: 11 }}>
      {COLORS[coloring[v.id]]?.name}
      </span>
      </div>
    ))}
    </div>
    </div>

    {/* Stats */}
    {step >= 0 && (
      <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "9px 13px", display: "flex", justifyContent: "space-between", fontSize: 12, transition: "background 0.3s" }}>
      <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: "bold", color: T.accentText }}>{step + 1}</div>
      <div style={{ color: T.textFaint, fontSize: 11 }}>colored</div>
      </div>
      <div style={{ width: 1, background: T.divider }}/>
      <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: "bold", color: "#2a5f8f" }}>{colorsUsed.length}</div>
      <div style={{ color: T.textFaint, fontSize: 11 }}>colors</div>
      </div>
      <div style={{ width: 1, background: T.divider }}/>
      <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: "bold", color: "#2d7a4f" }}>{VERTICES.length - step - 1}</div>
      <div style={{ color: T.textFaint, fontSize: 11 }}>remaining</div>
      </div>
      </div>
    )}

    {/* Buttons */}
    <div style={{ display: "flex", gap: 9 }}>
    <button onClick={handleNext} disabled={isDone} style={{
      flex: 2,
      background: isDone ? (dark ? "#5a3020" : "#ddd") : "#9a4731",
          color: isDone ? (dark ? "#7a5040" : "#999") : "#fff",
          border: "none", borderRadius: 6, padding: "11px 0", fontSize: 14,
          fontFamily: "inherit", fontWeight: "bold",
          cursor: isDone ? "not-allowed" : "pointer",
          letterSpacing: "0.03em", transition: "background 0.2s",
    }}>
    {step === -1 ? "Start" : isDone ? "Done ✓" : "Next Step →"}
    </button>
    <button onClick={handleReset} style={{
      flex: 1, background: "transparent",
      color: dark ? "#ffb899" : "#9a4731",
      border: `1.5px solid ${dark ? "#ffb899" : "#9a4731"}`,
      borderRadius: 6, padding: "11px 0", fontSize: 13,
      fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.03em",
    }}>
    Reset
    </button>
    </div>

    <div style={{ fontSize: 10, color: T.textFaint, lineHeight: 1.6, borderTop: `1px solid ${T.divider}`, paddingTop: 10 }}>
    Greedy guarantees a valid coloring in O(V+E) time. Colors used ≤ 1 + d<sub>max</sub>. Result depends on vertex ordering.
    </div>
    </div>
    </div>
    </div>
  );
}
