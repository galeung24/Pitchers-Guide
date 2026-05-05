

// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";

// export default function StuffPlusPage() {
//   const [file, setFile] = useState(null);
//   const [meta, setMeta] = useState(null);

//   const [pitcher, setPitcher] = useState("");
//   const [pitchType, setPitchType] = useState("");
//   const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

//   const [scoreRows, setScoreRows] = useState([]);
//   const [diagnosticRows, setDiagnosticRows] = useState([]);
//   const [scoreLoading, setScoreLoading] = useState(false);
//   const [diagLoading, setDiagLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const pitchTypeOptions = useMemo(() => {
//     if (!meta) return [];
//     return pitchTypeSource === "auto" ? meta.auto_pitch_types : meta.tagged_pitch_types;
//   }, [meta, pitchTypeSource]);

//   async function handleFile(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     setFile(f);
//     setMeta(null);
//     setScoreRows([]);
//     setDiagnosticRows([]);
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

//   function appendCommonFilters(form) {
//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);
//   }

//   async function generateStuffScore() {
//     if (!file) return;

//     setScoreLoading(true);
//     setError(null);
//     setScoreRows([]);

//     const form = new FormData();
//     form.append("file", file);
//     appendCommonFilters(form);
//     form.append("min_pitches", "10");

//     const res = await fetch(`${API_BASE}/stuffplus/score`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating Stuff+ score");
//       setScoreLoading(false);
//       return;
//     }

//     setScoreRows(Array.isArray(data.metric_percentiles) ? data.metric_percentiles : []);
//     setScoreLoading(false);
//   }

//   async function generateStuffDiagnostics() {
//     if (!file) return;

//     setDiagLoading(true);
//     setError(null);
//     setDiagnosticRows([]);

//     const form = new FormData();
//     form.append("file", file);
//     appendCommonFilters(form);
//     form.append("min_pitches", "10");
//     form.append("top_k", "3");

//     const res = await fetch(`${API_BASE}/stuffplus/diagnostics`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating Stuff+ diagnostics");
//       setDiagLoading(false);
//       return;
//     }

//     setDiagnosticRows(Array.isArray(data.diagnostics) ? data.diagnostics : []);
//     setDiagLoading(false);
//   }

//   function fmt(value, digits = 2) {
//     if (value === null || value === undefined || Number.isNaN(value)) return "—";
//     const n = Number(value);
//     if (!Number.isFinite(n)) return "—";
//     return n.toFixed(digits);
//   }

//   return (
//     <div className="page">
//       <div className="app-shell">
//         <nav className="top-nav">
//           <Link to="/" className="nav-link">Heatmaps</Link>
//           <Link to="/stuffplus" className="nav-link active">Stuff+</Link>
//         </nav>

//         <header className="hero">
//           <h1 className="hero-title">Stuff+ Model</h1>
//           <p className="hero-subtitle">
//             Upload Trackman CSV data to score pitches against the MLB baseline and view actionable diagnostics.
//           </p>
//         </header>

//         <main className="grid-layout">
//           <section className="panel controls-panel">
//             <h2>Controls</h2>

//             <label htmlFor="stuff-csv-upload">Upload CSV</label>
//             <input
//               id="stuff-csv-upload"
//               type="file"
//               accept=".csv"
//               onChange={handleFile}
//               className="input-control"
//             />

//             {meta && (
//               <>
//                 <label htmlFor="stuff-pitcher-select">Pitcher</label>
//                 <select
//                   id="stuff-pitcher-select"
//                   value={pitcher}
//                   onChange={(e) => setPitcher(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All</option>
//                   {meta.pitchers.map((p) => (
//                     <option key={p} value={p}>
//                       {p}
//                     </option>
//                   ))}
//                 </select>

//                 <label htmlFor="stuff-source-select">Pitch Type Source</label>
//                 <select
//                   id="stuff-source-select"
//                   value={pitchTypeSource}
//                   onChange={(e) => setPitchTypeSource(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <label htmlFor="stuff-pitch-type-select">Pitch Type</label>
//                 <select
//                   id="stuff-pitch-type-select"
//                   value={pitchType}
//                   onChange={(e) => setPitchType(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All</option>
//                   {pitchTypeOptions.map((pt) => (
//                     <option key={pt} value={pt}>
//                       {pt}
//                     </option>
//                   ))}
//                 </select>

//                 <div className="button-row">
//                   <button onClick={generateStuffScore} className="btn btn-primary">
//                     {scoreLoading ? "Loading Score..." : "Generate Stuff+ Score"}
//                   </button>
//                   <button onClick={generateStuffDiagnostics} className="btn btn-secondary">
//                     {diagLoading ? "Loading Diagnostics..." : "Generate Stuff+ Diagnostics"}
//                   </button>
//                 </div>
//               </>
//             )}

//             {error && <div className="error-message">{error}</div>}
//           </section>

//           <section className="panel results-panel">
//             <div className="results-head">
//               <h2>Stuff+ Results</h2>
//               <div className="chip-row">
//                 <span className="chip">Pitcher: {pitcher || "All"}</span>
//                 <span className="chip">Source: {pitchTypeSource}</span>
//                 <span className="chip">Pitch Type: {pitchType || "All"}</span>
//               </div>
//             </div>

//             {scoreRows.length > 0 && (
//               <div className="report-box">
//                 <h3>Score Summary</h3>
//                 <div className="table-wrap">
//                   <table className="metrics-table">
//                     <thead>
//                       <tr>
//                         <th>Pitcher</th>
//                         <th>Pitch Type</th>
//                         <th>Bucket</th>
//                         <th>Throws</th>
//                         <th>Pitches</th>
//                         <th>Velo Avg</th>
//                         <th>Velo %ile</th>
//                         <th>HB Avg</th>
//                         <th>HB %ile</th>
//                         <th>VB Avg</th>
//                         <th>VB %ile</th>
//                         <th>Release H Avg</th>
//                         <th>Release H %ile</th>
//                         <th>Ext Avg</th>
//                         <th>Ext %ile</th>
//                         <th>Stuff+ Avg</th>
//                         <th>Stuff+ %ile</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {scoreRows.map((row, idx) => (
//                         <tr key={`${row.Pitcher}-${row.pitch_type}-${idx}`}>
//                           <td>{row.Pitcher || "—"}</td>
//                           <td>{row.pitch_type || "—"}</td>
//                           <td>{row.pitch_bucket || "—"}</td>
//                           <td>{row.p_throws || "—"}</td>
//                           <td>{row.pitches ?? "—"}</td>
//                           <td>{fmt(row.velocity_avg)}</td>
//                           <td>{fmt(row.velocity_percentile, 1)}</td>
//                           <td>{fmt(row.horizontal_break_avg)}</td>
//                           <td>{fmt(row.horizontal_break_percentile, 1)}</td>
//                           <td>{fmt(row.vertical_break_avg)}</td>
//                           <td>{fmt(row.vertical_break_percentile, 1)}</td>
//                           <td>{fmt(row.release_height_avg)}</td>
//                           <td>{fmt(row.release_height_percentile, 1)}</td>
//                           <td>{fmt(row.extension_avg)}</td>
//                           <td>{fmt(row.extension_percentile, 1)}</td>
//                           <td>{fmt(row.stuff_plus_avg)}</td>
//                           <td>{fmt(row.stuff_plus_percentile, 1)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {diagnosticRows.length > 0 && (
//               <div className="report-box">
//                 <h3>Diagnostics</h3>
//                 <div className="table-wrap">
//                   <table className="metrics-table">
//                     <thead>
//                       <tr>
//                         <th>Pitcher</th>
//                         <th>Pitch Type</th>
//                         <th>Pitches</th>
//                         <th>Avg Stuff+</th>
//                         <th>Top Adjustments</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {diagnosticRows.map((row, idx) => (
//                         <tr key={`${row.Pitcher}-${row.pitch_type}-${idx}`}>
//                           <td>{row.Pitcher || "—"}</td>
//                           <td>{row.pitch_type || "—"}</td>
//                           <td>{row.pitches ?? "—"}</td>
//                           <td>{fmt(row.avg_stuff_plus)}</td>
//                           <td>
//                             {(row.top_adjustments || []).length === 0 ? (
//                               "—"
//                             ) : (
//                               <ul className="adjustment-list">
//                                 {row.top_adjustments.map((adj, aIdx) => (
//                                   <li key={`${adj.feature}-${aIdx}`}>
//                                     <strong>{adj.feature}</strong>: +{fmt(adj.estimated_stuff_plus_gain)} Stuff+ —{" "}
//                                     {adj.coach_action || adj.suggested_direction}
//                                   </li>
//                                 ))}
//                               </ul>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {scoreRows.length === 0 && diagnosticRows.length === 0 && (
//               <div className="placeholder">
//                 Upload a CSV and run Stuff+ Score or Diagnostics to view results here.
//               </div>
//             )}
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }



// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";

// export default function StuffPlusPage() {
//   const [file, setFile] = useState(null);
//   const [meta, setMeta] = useState(null);

//   const [pitcher, setPitcher] = useState("");
//   const [pitchType, setPitchType] = useState("");
//   const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

//   const [scoreRows, setScoreRows] = useState([]);
//   const [diagnosticRows, setDiagnosticRows] = useState([]);
//   const [scoreLoading, setScoreLoading] = useState(false);
//   const [diagLoading, setDiagLoading] = useState(false);
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
//     setScoreRows([]);
//     setDiagnosticRows([]);
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

//   function appendCommonFilters(form) {
//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);
//   }

//   async function generateStuffScore() {
//     if (!file) return;

//     setScoreLoading(true);
//     setError(null);
//     setScoreRows([]);

//     const form = new FormData();
//     form.append("file", file);
//     appendCommonFilters(form);
//     form.append("min_pitches", "10");

//     const res = await fetch(`${API_BASE}/stuffplus/score`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating Stuff+ score");
//       setScoreLoading(false);
//       return;
//     }

//     setScoreRows(Array.isArray(data.metric_percentiles) ? data.metric_percentiles : []);
//     setScoreLoading(false);
//   }

//   async function generateStuffDiagnostics() {
//     if (!file) return;

//     setDiagLoading(true);
//     setError(null);
//     setDiagnosticRows([]);

//     const form = new FormData();
//     form.append("file", file);
//     appendCommonFilters(form);
//     form.append("min_pitches", "10");
//     form.append("top_k", "3");

//     const res = await fetch(`${API_BASE}/stuffplus/diagnostics`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     if (!res.ok) {
//       setError(data.detail || data.error || "Error generating Stuff+ diagnostics");
//       setDiagLoading(false);
//       return;
//     }

//     setDiagnosticRows(Array.isArray(data.diagnostics) ? data.diagnostics : []);
//     setDiagLoading(false);
//   }

//   function fmt(value, digits = 2) {
//     if (value === null || value === undefined || Number.isNaN(value)) return "—";
//     const n = Number(value);
//     if (!Number.isFinite(n)) return "—";
//     return n.toFixed(digits);
//   }

//   return (
//     <div className="page">
//       <div className="app-shell">

//         {/* ✅ UPDATED NAV */}
//         <nav className="top-nav">
//           <Link to="/" className="nav-link">
//             Home
//           </Link>
//           <Link to="/heatmaps" className="nav-link">
//             Heatmaps
//           </Link>
//           <Link to="/stuffplus" className="nav-link active">
//             Stuff+
//           </Link>
//         </nav>

//         <header className="hero">
//           <h1 className="hero-title">Stuff+ Model</h1>
//           <p className="hero-subtitle">
//             Upload Trackman CSV data to score pitches against the MLB baseline and view actionable diagnostics.
//           </p>
//         </header>

//         <main className="grid-layout">
//           <section className="panel controls-panel">
//             <h2>Controls</h2>

//             <label htmlFor="stuff-csv-upload">Upload CSV</label>
//             <input
//               id="stuff-csv-upload"
//               type="file"
//               accept=".csv"
//               onChange={handleFile}
//               className="input-control"
//             />

//             {meta && (
//               <>
//                 <label htmlFor="stuff-pitcher-select">Pitcher</label>
//                 <select
//                   id="stuff-pitcher-select"
//                   value={pitcher}
//                   onChange={(e) => setPitcher(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All</option>
//                   {meta.pitchers.map((p) => (
//                     <option key={p} value={p}>
//                       {p}
//                     </option>
//                   ))}
//                 </select>

//                 <label htmlFor="stuff-source-select">Pitch Type Source</label>
//                 <select
//                   id="stuff-source-select"
//                   value={pitchTypeSource}
//                   onChange={(e) => setPitchTypeSource(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <label htmlFor="stuff-pitch-type-select">Pitch Type</label>
//                 <select
//                   id="stuff-pitch-type-select"
//                   value={pitchType}
//                   onChange={(e) => setPitchType(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All</option>
//                   {pitchTypeOptions.map((pt) => (
//                     <option key={pt} value={pt}>
//                       {pt}
//                     </option>
//                   ))}
//                 </select>

//                 <div className="button-row">
//                   <button onClick={generateStuffScore} className="btn btn-primary">
//                     {scoreLoading ? "Loading Score..." : "Generate Stuff+ Score"}
//                   </button>
//                   <button onClick={generateStuffDiagnostics} className="btn btn-secondary">
//                     {diagLoading ? "Loading Diagnostics..." : "Generate Stuff+ Diagnostics"}
//                   </button>
//                 </div>
//               </>
//             )}

//             {error && <div className="error-message">{error}</div>}
//           </section>

//           <section className="panel results-panel">
//             <div className="results-head">
//               <h2>Stuff+ Results</h2>
//               <div className="chip-row">
//                 <span className="chip">Pitcher: {pitcher || "All"}</span>
//                 <span className="chip">Source: {pitchTypeSource}</span>
//                 <span className="chip">Pitch Type: {pitchType || "All"}</span>
//               </div>
//             </div>

//             {scoreRows.length > 0 && (
//               <div className="report-box">
//                 <h3>Score Summary</h3>
//                 <div className="table-wrap">
//                   <table className="metrics-table">
//                     {/* table stays same */}
//                   </table>
//                 </div>
//               </div>
//             )}

//             {diagnosticRows.length > 0 && (
//               <div className="report-box">
//                 <h3>Diagnostics</h3>
//                 <div className="table-wrap">
//                   <table className="metrics-table">
//                     {/* table stays same */}
//                   </table>
//                 </div>
//               </div>
//             )}

//             {scoreRows.length === 0 && diagnosticRows.length === 0 && (
//               <div className="placeholder">
//                 Upload a CSV and run Stuff+ Score or Diagnostics to view results here.
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

export default function StuffPlusPage() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);

  const [pitcher, setPitcher] = useState("");
  const [pitchType, setPitchType] = useState("");
  const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

  const [scoreRows, setScoreRows] = useState([]);
  const [diagnosticRows, setDiagnosticRows] = useState([]);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [error, setError] = useState(null);

  const pitchTypeOptions = useMemo(() => {
    if (!meta) return [];
    return pitchTypeSource === "auto"
      ? meta.auto_pitch_types
      : meta.tagged_pitch_types;
  }, [meta, pitchTypeSource]);

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setMeta(null);
    setScoreRows([]);
    setDiagnosticRows([]);
    setError(null);

    const form = new FormData();
    form.append("file", f);

    const res = await fetch(`${API_BASE}/metadata`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setMeta(data);
  }

  function appendCommonFilters(form) {
    if (pitcher) form.append("pitcher", pitcher);
    if (pitchType) form.append("pitch_type", pitchType);
    form.append("pitch_type_source", pitchTypeSource);
  }

  async function generateStuffScore() {
    if (!file) return;

    setScoreLoading(true);
    setError(null);
    setScoreRows([]);

    const form = new FormData();
    form.append("file", file);
    appendCommonFilters(form);
    form.append("min_pitches", "10");

    const res = await fetch(`${API_BASE}/stuffplus/score`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || data.error || "Error generating Stuff+ score");
      setScoreLoading(false);
      return;
    }

    setScoreRows(Array.isArray(data.metric_percentiles) ? data.metric_percentiles : []);
    setScoreLoading(false);
  }

  async function generateStuffDiagnostics() {
    if (!file) return;

    setDiagLoading(true);
    setError(null);
    setDiagnosticRows([]);

    const form = new FormData();
    form.append("file", file);
    appendCommonFilters(form);
    form.append("min_pitches", "10");
    form.append("top_k", "3");

    const res = await fetch(`${API_BASE}/stuffplus/diagnostics`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || data.error || "Error generating Stuff+ diagnostics");
      setDiagLoading(false);
      return;
    }

    setDiagnosticRows(Array.isArray(data.diagnostics) ? data.diagnostics : []);
    setDiagLoading(false);
  }

  function fmt(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toFixed(digits);
  }

  return (
    <div className="page">
      <div className="app-shell">
        <nav className="top-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/heatmaps" className="nav-link">
            Heatmaps
          </Link>
          <Link to="/stuffplus" className="nav-link active">
            Stuff+
          </Link>
        </nav>

        <header className="hero">
          <h1 className="hero-title">Stuff+ Model</h1>
          <p className="hero-subtitle">
            Upload Trackman CSV data to score pitches against the MLB baseline and view actionable diagnostics.
          </p>
        </header>

        <main className="grid-layout">
          <section className="panel controls-panel">
            <h2>Controls</h2>

            <label htmlFor="stuff-csv-upload">Upload CSV</label>
            <input
              id="stuff-csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="input-control"
            />

            {meta && (
              <>
                <label htmlFor="stuff-pitcher-select">Pitcher</label>
                <select
                  id="stuff-pitcher-select"
                  value={pitcher}
                  onChange={(e) => setPitcher(e.target.value)}
                  className="input-control"
                >
                  <option value="">All</option>
                  {meta.pitchers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <label htmlFor="stuff-source-select">Pitch Type Source</label>
                <select
                  id="stuff-source-select"
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

                <label htmlFor="stuff-pitch-type-select">Pitch Type</label>
                <select
                  id="stuff-pitch-type-select"
                  value={pitchType}
                  onChange={(e) => setPitchType(e.target.value)}
                  className="input-control"
                >
                  <option value="">All</option>
                  {pitchTypeOptions.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>

                <div className="button-row">
                  <button onClick={generateStuffScore} className="btn btn-primary">
                    {scoreLoading ? "Loading Score..." : "Generate Stuff+ Score"}
                  </button>
                  <button onClick={generateStuffDiagnostics} className="btn btn-secondary">
                    {diagLoading ? "Loading Diagnostics..." : "Generate Stuff+ Diagnostics"}
                  </button>
                </div>
              </>
            )}

            {error && <div className="error-message">{error}</div>}
          </section>

          <section className="panel results-panel">
            <div className="results-head">
              <h2>Stuff+ Results</h2>
              <div className="chip-row">
                <span className="chip">Pitcher: {pitcher || "All"}</span>
                <span className="chip">Source: {pitchTypeSource}</span>
                <span className="chip">Pitch Type: {pitchType || "All"}</span>
              </div>
            </div>

            {scoreRows.length > 0 && (
              <div className="report-box">
                <h3>Score Summary</h3>
                <div className="table-wrap">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Pitcher</th>
                        <th>Pitch Type</th>
                        <th>Bucket</th>
                        <th>Throws</th>
                        <th>Pitches</th>
                        <th>Velo Avg</th>
                        <th>Velo %ile</th>
                        <th>HB Avg</th>
                        <th>HB %ile</th>
                        <th>VB Avg</th>
                        <th>VB %ile</th>
                        <th>Release H Avg</th>
                        <th>Release H %ile</th>
                        <th>Ext Avg</th>
                        <th>Ext %ile</th>
                        <th>Stuff+ Avg</th>
                        <th>Stuff+ %ile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreRows.map((row, idx) => (
                        <tr key={`${row.Pitcher}-${row.pitch_type}-${idx}`}>
                          <td>{row.Pitcher || "—"}</td>
                          <td>{row.pitch_type || "—"}</td>
                          <td>{row.pitch_bucket || "—"}</td>
                          <td>{row.p_throws || "—"}</td>
                          <td>{row.pitches ?? "—"}</td>
                          <td>{fmt(row.velocity_avg)}</td>
                          <td>{fmt(row.velocity_percentile, 1)}</td>
                          <td>{fmt(row.horizontal_break_avg)}</td>
                          <td>{fmt(row.horizontal_break_percentile, 1)}</td>
                          <td>{fmt(row.vertical_break_avg)}</td>
                          <td>{fmt(row.vertical_break_percentile, 1)}</td>
                          <td>{fmt(row.release_height_avg)}</td>
                          <td>{fmt(row.release_height_percentile, 1)}</td>
                          <td>{fmt(row.extension_avg)}</td>
                          <td>{fmt(row.extension_percentile, 1)}</td>
                          <td>{fmt(row.stuff_plus_avg)}</td>
                          <td>{fmt(row.stuff_plus_percentile, 1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {diagnosticRows.length > 0 && (
              <div className="report-box">
                <h3>Diagnostics</h3>
                <div className="table-wrap">
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Pitcher</th>
                        <th>Pitch Type</th>
                        <th>Pitches</th>
                        <th>Avg Stuff+</th>
                        <th>Top Adjustments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticRows.map((row, idx) => (
                        <tr key={`${row.Pitcher}-${row.pitch_type}-${idx}`}>
                          <td>{row.Pitcher || "—"}</td>
                          <td>{row.pitch_type || "—"}</td>
                          <td>{row.pitches ?? "—"}</td>
                          <td>{fmt(row.avg_stuff_plus)}</td>
                          <td>
                            {(row.top_adjustments || []).length === 0 ? (
                              "—"
                            ) : (
                              <ul className="adjustment-list">
                                {row.top_adjustments.map((adj, aIdx) => (
                                  <li key={`${adj.feature}-${aIdx}`}>
                                    <strong>{adj.feature}</strong>: +{fmt(adj.estimated_stuff_plus_gain)} Stuff+ —{" "}
                                    {adj.coach_action || adj.suggested_direction}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {scoreRows.length === 0 && diagnosticRows.length === 0 && (
              <div className="placeholder">
                Upload a CSV and run Stuff+ Score or Diagnostics to view results here.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}