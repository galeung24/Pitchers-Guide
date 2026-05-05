// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";

// export default function TrackmanHeatmapPage() {
//   const [file, setFile] = useState(null);
//   const [meta, setMeta] = useState(null);

//   const [pitcher, setPitcher] = useState("");
//   const [pitchType, setPitchType] = useState("");
//   const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

//   const [count, setCount] = useState("");
//   const [batterSide, setBatterSide] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   const [imgUrl, setImgUrl] = useState(null);
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const pitchTypeOptions = useMemo(() => {
//     if (!meta) return [];
//     return pitchTypeSource === "auto"
//       ? meta.auto_pitch_types
//       : meta.tagged_pitch_types;
//   }, [meta, pitchTypeSource]);

//   async function handleFile(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     setFile(f);
//     setMeta(null);
//     setImgUrl(null);
//     setReport(null);
//     setError(null);

//     const form = new FormData();
//     form.append("file", f);

//     const res = await fetch(`${API_BASE}/metadata`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     setMeta(data);
//   }

//   async function generate() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);

//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);

//     const res = await fetch(`${API_BASE}/heatmap/upload`, {
//       method: "POST",
//       body: form,
//     });

//     const contentType = res.headers.get("content-type") || "";

//     if (contentType.includes("application/json")) {
//       const data = await res.json();
//       setError(data.error || "Unknown error");
//       setLoading(false);
//       return;
//     }

//     const blob = await res.blob();
//     const url = URL.createObjectURL(blob);
//     setImgUrl(url);
//     setLoading(false);
//   }

//   async function generateReport() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);

//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);

//     const res = await fetch(`${API_BASE}/scouting-report/ai`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating AI report");
//       setLoading(false);
//       return;
//     }

//     setReport(data.report || "No report generated.");
//     setLoading(false);
//   }

//   return (
//     <div className="page">
//       <div className="app-shell">
//         <nav className="top-nav">
//           <Link to="/" className="nav-link">
//             Home
//           </Link>
//           <Link to="/heatmaps" className="nav-link active">
//             Heatmaps
//           </Link>
//           <Link to="/stuffplus" className="nav-link">
//             Stuff+
//           </Link>
//         </nav>

//         <header className="hero">
//           <h1 className="hero-title">Trackman Pitch Analytics</h1>
//           <p className="hero-subtitle">
//             Upload Trackman CSV data to generate pitch heatmaps and AI scouting reports.
//           </p>
//         </header>

//         <main className="grid-layout">
//           <section className="panel controls-panel">
//             <h2>Controls</h2>

//             <label>Upload CSV</label>
//             <input type="file" accept=".csv" onChange={handleFile} className="input-control" />

//             {meta && (
//               <>
//                 <label>Pitcher</label>
//                 <select value={pitcher} onChange={(e) => setPitcher(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {meta.pitchers.map((p) => (
//                     <option key={p} value={p}>{p}</option>
//                   ))}
//                 </select>

//                 <label>Pitch Type Source</label>
//                 <select value={pitchTypeSource} onChange={(e) => setPitchTypeSource(e.target.value)} className="input-control">
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <label>Pitch Type</label>
//                 <select value={pitchType} onChange={(e) => setPitchType(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {pitchTypeOptions.map((pt) => (
//                     <option key={pt} value={pt}>{pt}</option>
//                   ))}
//                 </select>

//                 <label>Count</label>
//                 <select value={count} onChange={(e) => setCount(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {meta.counts.map((c) => (
//                     <option key={c} value={c}>{c}</option>
//                   ))}
//                 </select>

//                 <label>Hitter Side</label>
//                 <select value={batterSide} onChange={(e) => setBatterSide(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {meta.hitter_handedness.map((h) => (
//                     <option key={h} value={h}>{h}</option>
//                   ))}
//                 </select>

//                 <label>Date From</label>
//                 <select value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-control">
//                   <option value="">Start</option>
//                   {meta.date_options.map((d) => (
//                     <option key={d} value={d}>{d}</option>
//                   ))}
//                 </select>

//                 <label>Date To</label>
//                 <select value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-control">
//                   <option value="">End</option>
//                   {meta.date_options.map((d) => (
//                     <option key={d} value={d}>{d}</option>
//                   ))}
//                 </select>

//                 <div className="button-row">
//                   <button onClick={generate} className="btn btn-primary">
//                     {loading ? "Generating..." : "Generate Heatmap"}
//                   </button>
//                   <button onClick={generateReport} className="btn btn-secondary">
//                     {loading ? "Generating..." : "Generate AI Report"}
//                   </button>
//                 </div>
//               </>
//             )}

//             {error && <div className="error-message">{error}</div>}
//           </section>

//           <section className="panel results-panel">
//             <h2>Visualization</h2>

//             {loading && <p>Processing...</p>}

//             <div className="heatmap-report-layout">
//               <div className="heatmap-side">
//                 {imgUrl ? (
//                   <img src={imgUrl} alt="Heatmap" className="heatmap-image" />
//                 ) : (
//                   <div className="placeholder">Generate a heatmap to see results.</div>
//                 )}
//               </div>

//               {report && (
//                 <div className="report-box report-side">
//                   <h3>AI Scouting Report</h3>

//                   <div className="report-text">
//                     {report
//                       .replace(/\*\*/g, "")
//                       .split("\n")
//                       .filter((line) => line.trim() !== "")
//                       .map((line, i) => (
//                         <p key={i}>{line}</p>
//                       ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }
//--------------------

// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";

// function ReactStrikeZone({ points }) {
//   const width = 500;
//   const height = 600;

//   const xMin = -2;
//   const xMax = 2;
//   const yMin = 0;
//   const yMax = 4.5;

//   const scaleX = (x) => ((x - xMin) / (xMax - xMin)) * width;
//   const scaleY = (y) => height - ((y - yMin) / (yMax - yMin)) * height;

//   const zoneLeft = scaleX(-0.71);
//   const zoneRight = scaleX(0.71);
//   const zoneTop = scaleY(3.5);
//   const zoneBottom = scaleY(1.5);

//   return (
//     <svg className="react-heatmap" viewBox={`0 0 ${width} ${height}`}>
//       <rect width={width} height={height} rx="16" className="chart-bg" />

//       <rect
//         x={zoneLeft}
//         y={zoneTop}
//         width={zoneRight - zoneLeft}
//         height={zoneBottom - zoneTop}
//         className="strike-zone"
//       />

//       {[1, 2].map((i) => {
//         const x = zoneLeft + ((zoneRight - zoneLeft) / 3) * i;
//         const y = zoneTop + ((zoneBottom - zoneTop) / 3) * i;

//         return (
//           <g key={i}>
//             <line x1={x} y1={zoneTop} x2={x} y2={zoneBottom} className="zone-grid" />
//             <line x1={zoneLeft} y1={y} x2={zoneRight} y2={y} className="zone-grid" />
//           </g>
//         );
//       })}

//       {points.map((p, i) => {
//         const ev = p.ExitSpeed || 70;
//         const r = Math.max(5, Math.min(14, (ev - 60) / 3));

//         return (
//           <circle
//             key={i}
//             cx={scaleX(p.PlateLocSide)}
//             cy={scaleY(p.PlateLocHeight)}
//             r={r}
//             className="pitch-dot"
//           />
//         );
//       })}
//     </svg>
//   );
// }

// export default function TrackmanHeatmapPage() {
//   const [file, setFile] = useState(null);
//   const [meta, setMeta] = useState(null);

//   const [pitcher, setPitcher] = useState("");
//   const [pitchType, setPitchType] = useState("");
//   const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

//   const [count, setCount] = useState("");
//   const [batterSide, setBatterSide] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   const [points, setPoints] = useState(null);
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const pitchTypeOptions = useMemo(() => {
//     if (!meta) return [];
//     return pitchTypeSource === "auto"
//       ? meta.auto_pitch_types
//       : meta.tagged_pitch_types;
//   }, [meta, pitchTypeSource]);

//   async function handleFile(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     setFile(f);
//     setMeta(null);
//     setPoints(null);
//     setReport(null);
//     setError(null);

//     const form = new FormData();
//     form.append("file", f);

//     const res = await fetch(`${API_BASE}/metadata`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     setMeta(data);
//   }

//   async function generate() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);

//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);

//     const res = await fetch(`${API_BASE}/heatmap/data`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();

//     if (!res.ok || data.error) {
//       setError(data.error || data.detail || "Error generating heatmap");
//       setLoading(false);
//       return;
//     }

//     setPoints(data.points || []);
//     setLoading(false);
//   }

//   async function generateReport() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);

//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);

//     const res = await fetch(`${API_BASE}/scouting-report/ai`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating AI report");
//       setLoading(false);
//       return;
//     }

//     setReport(data.report || "No report generated.");
//     setLoading(false);
//   }

//   return (
//     <div className="page">
//       <div className="app-shell">
//         <nav className="top-nav">
//           <Link to="/" className="nav-link">
//             Home
//           </Link>
//           <Link to="/heatmaps" className="nav-link active">
//             Heatmaps
//           </Link>
//           <Link to="/stuffplus" className="nav-link">
//             Stuff+
//           </Link>
//         </nav>

//         <header className="hero">
//           <h1 className="hero-title">Trackman Pitch Analytics</h1>
//           <p className="hero-subtitle">
//             Upload Trackman CSV data to generate pitch heatmaps and AI scouting reports.
//           </p>
//         </header>

//         <main className="grid-layout">
//           <section className="panel controls-panel">
//             <h2>Controls</h2>

//             <label>Upload CSV</label>
//             <input type="file" accept=".csv" onChange={handleFile} className="input-control" />

//             {meta && (
//               <>
//                 <label>Pitcher</label>
//                 <select value={pitcher} onChange={(e) => setPitcher(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {meta.pitchers.map((p) => (
//                     <option key={p} value={p}>{p}</option>
//                   ))}
//                 </select>

//                 <label>Pitch Type Source</label>
//                 <select value={pitchTypeSource} onChange={(e) => setPitchTypeSource(e.target.value)} className="input-control">
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <label>Pitch Type</label>
//                 <select value={pitchType} onChange={(e) => setPitchType(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {pitchTypeOptions.map((pt) => (
//                     <option key={pt} value={pt}>{pt}</option>
//                   ))}
//                 </select>

//                 <label>Count</label>
//                 <select value={count} onChange={(e) => setCount(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {meta.counts.map((c) => (
//                     <option key={c} value={c}>{c}</option>
//                   ))}
//                 </select>

//                 <label>Hitter Side</label>
//                 <select value={batterSide} onChange={(e) => setBatterSide(e.target.value)} className="input-control">
//                   <option value="">All</option>
//                   {meta.hitter_handedness.map((h) => (
//                     <option key={h} value={h}>{h}</option>
//                   ))}
//                 </select>

//                 <label>Date From</label>
//                 <select value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-control">
//                   <option value="">Start</option>
//                   {meta.date_options.map((d) => (
//                     <option key={d} value={d}>{d}</option>
//                   ))}
//                 </select>

//                 <label>Date To</label>
//                 <select value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-control">
//                   <option value="">End</option>
//                   {meta.date_options.map((d) => (
//                     <option key={d} value={d}>{d}</option>
//                   ))}
//                 </select>

//                 <div className="button-row">
//                   <button onClick={generate} className="btn btn-primary">
//                     {loading ? "Generating..." : "Generate Heatmap"}
//                   </button>
//                   <button onClick={generateReport} className="btn btn-secondary">
//                     {loading ? "Generating..." : "Generate AI Report"}
//                   </button>
//                 </div>
//               </>
//             )}

//             {error && <div className="error-message">{error}</div>}
//           </section>

//           <section className="panel results-panel">
//             <h2>Visualization</h2>

//             {loading && <p>Processing...</p>}

//             <div className="heatmap-report-layout">
//               <div className="heatmap-side">
//                 {points ? (
//                   <ReactStrikeZone points={points} />
//                 ) : (
//                   <div className="placeholder">Generate a heatmap to see results.</div>
//                 )}
//               </div>

//               {report && (
//                 <div className="report-box report-side">
//                   <h3>AI Scouting Report</h3>

//                   <div className="report-text">
//                     {report
//                       .replace(/\*\*/g, "")
//                       .split("\n")
//                       .filter((line) => line.trim() !== "")
//                       .map((line, i) => (
//                         <p key={i}>{line}</p>
//                       ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }

// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";

// export default function TrackmanHeatmapPage() {
//   const [file, setFile] = useState(null);
//   const [meta, setMeta] = useState(null);

//   const [pitcher, setPitcher] = useState("");
//   const [pitchType, setPitchType] = useState("");
//   const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

//   const [count, setCount] = useState("");
//   const [batterSide, setBatterSide] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   const [imgUrl, setImgUrl] = useState(null);
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const pitchTypeOptions = useMemo(() => {
//     if (!meta) return [];
//     return pitchTypeSource === "auto"
//       ? meta.auto_pitch_types
//       : meta.tagged_pitch_types;
//   }, [meta, pitchTypeSource]);

//   async function handleFile(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     setFile(f);
//     setMeta(null);
//     setImgUrl(null);
//     setReport(null);
//     setError(null);

//     const form = new FormData();
//     form.append("file", f);

//     const res = await fetch(`${API_BASE}/metadata`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     setMeta(data);
//   }

//   async function generate() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);

//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);

//     const res = await fetch(`${API_BASE}/heatmap/upload`, {
//       method: "POST",
//       body: form,
//     });

//     const contentType = res.headers.get("content-type") || "";

//     if (contentType.includes("application/json")) {
//       const data = await res.json();
//       setError(data.error || "Unknown error");
//       setLoading(false);
//       return;
//     }

//     const blob = await res.blob();
//     const url = URL.createObjectURL(blob);
//     setImgUrl(url);
//     setLoading(false);
//   }

//   async function generateReport() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);

//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);

//     const res = await fetch(`${API_BASE}/scouting-report/ai`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating AI report");
//       setLoading(false);
//       return;
//     }

//     setReport(data.report || "No report generated.");
//     setLoading(false);
//   }

//   return (
//     <div className="page">
//       <div className="app-shell">
//         <nav className="top-nav">
//           <Link to="/" className="nav-link">Home</Link>
//           <Link to="/heatmaps" className="nav-link active">Heatmaps</Link>
//           <Link to="/stuffplus" className="nav-link">Stuff+</Link>
//         </nav>

//         <header className="hero">
//           <h1 className="hero-title">Trackman Pitch Analytics</h1>
//           <p className="hero-subtitle">
//             Upload Trackman CSV data to generate pitch heatmaps and AI scouting reports.
//           </p>
//         </header>

//         <main className="grid-layout">
//           <section className="panel controls-panel">
//             <h2>Controls</h2>

//             <input type="file" accept=".csv" onChange={handleFile} className="input-control" />

//             {meta && (
//               <>
//                 <select value={pitcher} onChange={(e) => setPitcher(e.target.value)} className="input-control">
//                   <option value="">All Pitchers</option>
//                   {meta.pitchers.map((p) => <option key={p}>{p}</option>)}
//                 </select>

//                 <select value={pitchTypeSource} onChange={(e) => setPitchTypeSource(e.target.value)} className="input-control">
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <select value={pitchType} onChange={(e) => setPitchType(e.target.value)} className="input-control">
//                   <option value="">All Pitch Types</option>
//                   {pitchTypeOptions.map((pt) => <option key={pt}>{pt}</option>)}
//                 </select>

//                 <button onClick={generate} className="btn btn-primary">
//                   {loading ? "Generating..." : "Generate Heatmap"}
//                 </button>

//                 <button onClick={generateReport} className="btn btn-secondary">
//                   Generate AI Report
//                 </button>
//               </>
//             )}
//           </section>

//           <section className="panel results-panel">
//             <h2>Visualization</h2>

//             {imgUrl ? (
//               <img src={imgUrl} alt="Heatmap" className="heatmap-image" />
//             ) : (
//               <div className="placeholder">Generate a heatmap to see results.</div>
//             )}

//             {report && (
//               <div className="report-box">
//                 <h3>AI Scouting Report</h3>
//                 <div className="report-text">
//                   {report.replace(/\*\*/g, "")}
//                 </div>
//               </div>
//             )}
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function TrackmanHeatmapPage() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);

  const [pitcher, setPitcher] = useState("");
  const [pitchType, setPitchType] = useState("");
  const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

  const [count, setCount] = useState("");
  const [batterSide, setBatterSide] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [imgUrl, setImgUrl] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pitchTypeOptions = useMemo(() => {
    if (!meta) return [];
    return pitchTypeSource === "auto"
      ? meta.auto_pitch_types || []
      : meta.tagged_pitch_types || [];
  }, [meta, pitchTypeSource]);

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setMeta(null);
    setImgUrl(null);
    setReport(null);
    setError(null);

    setPitcher("");
    setPitchType("");
    setPitchTypeSource("tagged");
    setCount("");
    setBatterSide("");
    setDateFrom("");
    setDateTo("");

    const form = new FormData();
    form.append("file", f);

    const res = await fetch(`${API_BASE}/metadata`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setMeta(data);
  }

  function appendFilters(form) {
    if (pitcher) form.append("pitcher", pitcher);
    if (pitchType) form.append("pitch_type", pitchType);
    form.append("pitch_type_source", pitchTypeSource);

    if (count) form.append("count", count);
    if (batterSide) form.append("batter_side", batterSide);
    if (dateFrom) form.append("date_from", dateFrom);
    if (dateTo) form.append("date_to", dateTo);
  }

  async function generate() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setReport(null);

    const form = new FormData();
    form.append("file", file);
    appendFilters(form);

    const res = await fetch(`${API_BASE}/heatmap/upload`, {
      method: "POST",
      body: form,
    });

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      setError(data.error || data.detail || "Unknown error");
      setLoading(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setImgUrl(url);
    setLoading(false);
  }

  async function generateReport() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setReport(null);

    const form = new FormData();
    form.append("file", file);
    appendFilters(form);

    const res = await fetch(`${API_BASE}/scouting-report/ai`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || data.error || "Error generating AI report");
      setLoading(false);
      return;
    }

    setReport(data.report || "No report generated.");
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="app-shell">
        <nav className="top-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/heatmaps" className="nav-link active">
            Heatmaps
          </Link>
          <Link to="/stuffplus" className="nav-link">
            Stuff+
          </Link>
        </nav>

        <header className="hero">
          <h1 className="hero-title">Trackman Pitch Analytics</h1>
          <p className="hero-subtitle">
            Upload Trackman CSV data to generate pitch heatmaps and AI scouting reports.
          </p>
        </header>

        <main className="grid-layout">
          <section className="panel controls-panel">
            <h2>Controls</h2>

            <label>Upload CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="input-control"
            />

            {meta && (
              <>
                <label>Pitcher</label>
                <select
                  value={pitcher}
                  onChange={(e) => setPitcher(e.target.value)}
                  className="input-control"
                >
                  <option value="">All Pitchers</option>
                  {(meta.pitchers || []).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <label>Pitch Type Source</label>
                <select
                  value={pitchTypeSource}
                  onChange={(e) => {
                    setPitchTypeSource(e.target.value);
                    setPitchType("");
                  }}
                  className="input-control"
                >
                  <option value="tagged">Tagged</option>
                  <option value="auto">Auto</option>
                </select>

                <label>Pitch Type</label>
                <select
                  value={pitchType}
                  onChange={(e) => setPitchType(e.target.value)}
                  className="input-control"
                >
                  <option value="">All Pitch Types</option>
                  {pitchTypeOptions.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>

                <label>Count</label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="input-control"
                >
                  <option value="">All Counts</option>
                  {(meta.counts || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <label>Hitter Side</label>
                <select
                  value={batterSide}
                  onChange={(e) => setBatterSide(e.target.value)}
                  className="input-control"
                >
                  <option value="">All Hitters</option>
                  {(meta.hitter_handedness || []).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                <label>Date From</label>
                <select
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-control"
                >
                  <option value="">Start Date</option>
                  {(meta.date_options || []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <label>Date To</label>
                <select
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-control"
                >
                  <option value="">End Date</option>
                  {(meta.date_options || []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <div className="button-row">
                  <button onClick={generate} className="btn btn-primary">
                    {loading ? "Generating..." : "Generate Heatmap"}
                  </button>

                  <button onClick={generateReport} className="btn btn-secondary">
                    {loading ? "Generating..." : "Generate AI Report"}
                  </button>
                </div>
              </>
            )}

            {error && <div className="error-message">{error}</div>}
          </section>

          <section className="panel results-panel">
            <h2>Visualization</h2>

            {loading && <p className="status-text">Processing Trackman data...</p>}

            <div className="heatmap-report-layout">
              <div className="heatmap-side">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt="Trackman heatmap"
                    className="heatmap-image"
                  />
                ) : (
                  <div className="placeholder">
                    Generate a heatmap to see results.
                  </div>
                )}
              </div>

              {report && (
                <div className="report-box report-side">
                  <h3>AI Scouting Report</h3>

                  <div className="report-text">
                    {report
                      .replace(/\*\*/g, "")
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}