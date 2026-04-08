// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";

// export default function TrackmanHeatmapPage() {
//   const [file, setFile] = useState(null);
//   const [meta, setMeta] = useState(null);

//   const [pitcher, setPitcher] = useState("");
//   const [pitchType, setPitchType] = useState("");
//   const [pitchTypeSource, setPitchTypeSource] = useState("tagged");

//   const [imgUrl, setImgUrl] = useState(null);
//   const [report, setReport] = useState(null); // AI report text string
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

//     // AI endpoint
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

//     // display only generated text
//     setReport(data.report || "No report generated.");
//     setLoading(false);
//   }

//   return (
//     <div className="page">
//       <div className="app-shell">
//         <nav className="top-nav">
//           <Link to="/" className="nav-link active">
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

//             <label htmlFor="csv-upload">Upload CSV</label>
//             <input
//               id="csv-upload"
//               type="file"
//               accept=".csv"
//               onChange={handleFile}
//               className="input-control"
//             />

//             {meta && (
//               <>
//                 <label htmlFor="pitcher-select">Pitcher</label>
//                 <select
//                   id="pitcher-select"
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

//                 <label htmlFor="source-select">Pitch Type Source</label>
//                 <select
//                   id="source-select"
//                   value={pitchTypeSource}
//                   onChange={(e) => setPitchTypeSource(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <label htmlFor="pitch-type-select">Pitch Type</label>
//                 <select
//                   id="pitch-type-select"
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
//             <div className="results-head">
//               <h2>Visualization</h2>
//               <div className="chip-row">
//                 <span className="chip">Pitcher: {pitcher || "All"}</span>
//                 <span className="chip">Source: {pitchTypeSource}</span>
//                 <span className="chip">Pitch Type: {pitchType || "All"}</span>
//               </div>
//             </div>

//             {loading && <p className="status-text">Processing Trackman data...</p>}

//             <div className="heatmap-wrap">
//               {imgUrl ? (
//                 <img src={imgUrl} alt="Trackman heatmap" className="heatmap-image" />
//               ) : (
//                 <div className="placeholder">
//                   Upload a CSV and generate a heatmap to see results here.
//                 </div>
//               )}
//             </div>

//             {report && (
//               <div className="report-box">
//                 <h3>AI Scouting Report</h3>
//                 <pre>{report}</pre>
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

  const [imgUrl, setImgUrl] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setImgUrl(null);
    setReport(null);
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

  async function generate() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setReport(null);

    const form = new FormData();
    form.append("file", file);

    if (pitcher) form.append("pitcher", pitcher);
    if (pitchType) form.append("pitch_type", pitchType);
    form.append("pitch_type_source", pitchTypeSource);

    const res = await fetch(`${API_BASE}/heatmap/upload`, {
      method: "POST",
      body: form,
    });

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      setError(data.error || "Unknown error");
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

    if (pitcher) form.append("pitcher", pitcher);
    if (pitchType) form.append("pitch_type", pitchType);
    form.append("pitch_type_source", pitchTypeSource);

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
          <Link to="/" className="nav-link active">
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

            <label htmlFor="csv-upload">Upload CSV</label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="input-control"
            />

            {meta && (
              <>
                <label htmlFor="pitcher-select">Pitcher</label>
                <select
                  id="pitcher-select"
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

                <label htmlFor="source-select">Pitch Type Source</label>
                <select
                  id="source-select"
                  value={pitchTypeSource}
                  onChange={(e) => setPitchTypeSource(e.target.value)}
                  className="input-control"
                >
                  <option value="tagged">Tagged</option>
                  <option value="auto">Auto</option>
                </select>

                <label htmlFor="pitch-type-select">Pitch Type</label>
                <select
                  id="pitch-type-select"
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
            <div className="results-head">
              <h2>Visualization</h2>
              <div className="chip-row">
                <span className="chip">Pitcher: {pitcher || "All"}</span>
                <span className="chip">Source: {pitchTypeSource}</span>
                <span className="chip">Pitch Type: {pitchType || "All"}</span>
              </div>
            </div>

            {loading && <p className="status-text">Processing Trackman data...</p>}

            <div className={`viz-content ${report ? "has-report" : ""}`}>
              <div className="heatmap-wrap">
                {imgUrl ? (
                  <img src={imgUrl} alt="Trackman heatmap" className="heatmap-image" />
                ) : (
                  <div className="placeholder">
                    Upload a CSV and generate a heatmap to see results here.
                  </div>
                )}
              </div>

              {report && (
                <div className="report-box side-report">
                  <h3>AI Scouting Report</h3>
                  <pre>{report}</pre>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}