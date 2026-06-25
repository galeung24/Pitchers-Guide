
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
//       ? meta.auto_pitch_types || []
//       : meta.tagged_pitch_types || [];
//   }, [meta, pitchTypeSource]);

//   async function handleFile(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     setFile(f);
//     setMeta(null);
//     setImgUrl(null);
//     setReport(null);
//     setError(null);

//     setPitcher("");
//     setPitchType("");
//     setPitchTypeSource("tagged");
//     setCount("");
//     setBatterSide("");
//     setDateFrom("");
//     setDateTo("");

//     const form = new FormData();
//     form.append("file", f);

//     const res = await fetch(`${API_BASE}/metadata`, {
//       method: "POST",
//       body: form,
//     });

//     const data = await res.json();
//     setMeta(data);
//   }

//   function appendFilters(form) {
//     if (pitcher) form.append("pitcher", pitcher);
//     if (pitchType) form.append("pitch_type", pitchType);
//     form.append("pitch_type_source", pitchTypeSource);

//     if (count) form.append("count", count);
//     if (batterSide) form.append("batter_side", batterSide);
//     if (dateFrom) form.append("date_from", dateFrom);
//     if (dateTo) form.append("date_to", dateTo);
//   }

//   async function generate() {
//     if (!file) return;

//     setLoading(true);
//     setError(null);
//     setReport(null);

//     const form = new FormData();
//     form.append("file", file);
//     appendFilters(form);

//     const res = await fetch(`${API_BASE}/heatmap/upload`, {
//       method: "POST",
//       body: form,
//     });

//     const contentType = res.headers.get("content-type") || "";

//     if (contentType.includes("application/json")) {
//       const data = await res.json();
//       setError(data.error || data.detail || "Unknown error");
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
//     appendFilters(form);

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
//             <input
//               type="file"
//               accept=".csv"
//               onChange={handleFile}
//               className="input-control"
//             />

//             {meta && (
//               <>
//                 <label>Pitcher</label>
//                 <select
//                   value={pitcher}
//                   onChange={(e) => setPitcher(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All Pitchers</option>
//                   {(meta.pitchers || []).map((p) => (
//                     <option key={p} value={p}>
//                       {p}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Pitch Type Source</label>
//                 <select
//                   value={pitchTypeSource}
//                   onChange={(e) => {
//                     setPitchTypeSource(e.target.value);
//                     setPitchType("");
//                   }}
//                   className="input-control"
//                 >
//                   <option value="tagged">Tagged</option>
//                   <option value="auto">Auto</option>
//                 </select>

//                 <label>Pitch Type</label>
//                 <select
//                   value={pitchType}
//                   onChange={(e) => setPitchType(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All Pitch Types</option>
//                   {pitchTypeOptions.map((pt) => (
//                     <option key={pt} value={pt}>
//                       {pt}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Count</label>
//                 <select
//                   value={count}
//                   onChange={(e) => setCount(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All Counts</option>
//                   {(meta.counts || []).map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Hitter Side</label>
//                 <select
//                   value={batterSide}
//                   onChange={(e) => setBatterSide(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">All Hitters</option>
//                   {(meta.hitter_handedness || []).map((h) => (
//                     <option key={h} value={h}>
//                       {h}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Date From</label>
//                 <select
//                   value={dateFrom}
//                   onChange={(e) => setDateFrom(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">Start Date</option>
//                   {(meta.date_options || []).map((d) => (
//                     <option key={d} value={d}>
//                       {d}
//                     </option>
//                   ))}
//                 </select>

//                 <label>Date To</label>
//                 <select
//                   value={dateTo}
//                   onChange={(e) => setDateTo(e.target.value)}
//                   className="input-control"
//                 >
//                   <option value="">End Date</option>
//                   {(meta.date_options || []).map((d) => (
//                     <option key={d} value={d}>
//                       {d}
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
//             <h2>Visualization</h2>

//             {loading && <p className="status-text">Processing Trackman data...</p>}

//             <div className="heatmap-report-layout">
//               <div className="heatmap-side">
//                 {imgUrl ? (
//                   <img
//                     src={imgUrl}
//                     alt="Trackman heatmap"
//                     className="heatmap-image"
//                   />
//                 ) : (
//                   <div className="placeholder">
//                     Generate a heatmap to see results.
//                   </div>
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

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function cleanAiReport(raw) {
  if (!raw) return "";

  if (typeof raw === "object") {
    return raw;
  }

  return String(raw)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "")
    .trim();
}

function parseAiReport(raw) {
  if (!raw) return null;

  if (typeof raw === "object") {
    return raw;
  }

  const cleaned = cleanAiReport(raw);

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function formatPercent(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "N/A";

  if (Math.abs(num) <= 1) {
    return `${(num * 100).toFixed(1)}%`;
  }

  return `${num.toFixed(1)}%`;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "N/A";

  const num = Number(value);
  if (!Number.isNaN(num)) {
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  }

  return String(value);
}

function renderFallbackReport(report) {
  const cleaned = cleanAiReport(report);

  if (typeof cleaned !== "string") {
    return <pre>{JSON.stringify(cleaned, null, 2)}</pre>;
  }

  return cleaned
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, i) => <p key={i}>{line}</p>);
}

function renderList(items) {
  if (!items) return null;

  if (Array.isArray(items)) {
    return (
      <ul>
        {items.map((item, i) => (
          <li key={i}>{typeof item === "object" ? JSON.stringify(item) : item}</li>
        ))}
      </ul>
    );
  }

  if (typeof items === "object") {
    return (
      <ul>
        {Object.entries(items).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </li>
        ))}
      </ul>
    );
  }

  return <p>{String(items)}</p>;
}

function AiScoutingReport({ report }) {
  const parsed = parseAiReport(report);

  if (!parsed) {
    return <div className="report-text">{renderFallbackReport(report)}</div>;
  }

  return (
    <div className="report-text">
      {parsed.Overview && (
        <div className="report-section">
          <h4>Overview</h4>
          <p>{parsed.Overview}</p>
        </div>
      )}

      {parsed.Arsenal && (
        <div className="report-section">
          <h4>Arsenal</h4>

          {Object.entries(parsed.Arsenal).map(([pitchName, pitchData]) => (
            <div className="pitch-report-card" key={pitchName}>
              <h5>{pitchName}</h5>

              {typeof pitchData === "object" && pitchData !== null ? (
                <>
                  {pitchData.usage !== undefined && (
                    <p>
                      <strong>Usage:</strong> {formatPercent(pitchData.usage)}
                    </p>
                  )}

                  {pitchData.avg_velo !== undefined && (
                    <p>
                      <strong>Avg Velo:</strong> {formatValue(pitchData.avg_velo)}
                    </p>
                  )}

                  {pitchData.avg_spin !== undefined && (
                    <p>
                      <strong>Avg Spin:</strong> {formatValue(pitchData.avg_spin)}
                    </p>
                  )}

                  {pitchData.whiff_per_swing !== undefined && (
                    <p>
                      <strong>Whiff/Swing:</strong>{" "}
                      {formatPercent(pitchData.whiff_per_swing)}
                    </p>
                  )}

                  {pitchData.chase_rate !== undefined && (
                    <p>
                      <strong>Chase Rate:</strong>{" "}
                      {formatPercent(pitchData.chase_rate)}
                    </p>
                  )}

                  {pitchData.notes && <p>{pitchData.notes}</p>}
                  {pitchData.summary && <p>{pitchData.summary}</p>}
                </>
              ) : (
                <p>{String(pitchData)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {parsed.Strengths && (
        <div className="report-section">
          <h4>Strengths</h4>
          {renderList(parsed.Strengths)}
        </div>
      )}

      {parsed.Weaknesses && (
        <div className="report-section">
          <h4>Weaknesses</h4>
          {renderList(parsed.Weaknesses)}
        </div>
      )}

      {parsed.Recommendations && (
        <div className="report-section">
          <h4>Recommendations</h4>
          {renderList(parsed.Recommendations)}
        </div>
      )}

      {parsed.Game_Plan && (
        <div className="report-section">
          <h4>Game Plan</h4>
          {renderList(parsed.Game_Plan)}
        </div>
      )}

      {parsed.Summary && (
        <div className="report-section">
          <h4>Summary</h4>
          <p>{parsed.Summary}</p>
        </div>
      )}
    </div>
  );
}

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
                  <AiScoutingReport report={report} />
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}