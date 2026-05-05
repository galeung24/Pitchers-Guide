// import { Link } from "react-router-dom";

// export default function StuffPlusPage() {
//   return (
//     <div style={{ padding: 40 }}>

//       {/* Navigation */}
//       <div style={{ marginBottom: 20 }}>
//         <Link to="/">Heatmaps</Link> |{" "}
//         <Link to="/stuffplus">Stuff+</Link>
//       </div>

//       <h1>Stuff+ Model</h1>

//       <p>
//         Stuff+ evaluates pitch quality using pitch characteristics like
//         velocity, spin rate, and movement rather than outcomes.
//       </p>

//       <ul>
//         <li>100 = League Average</li>
//         <li>120 = Elite Pitch</li>
//         <li>80 = Below Average</li>
//       </ul>

//     </div>
//   );
// }
import { Link } from "react-router-dom";

export default function StuffPlusPage() {
  return (
    <div className="page">
      <div className="app-shell">
        <nav className="top-nav">
          <Link to="/" className="nav-link">Heatmaps</Link>
          <Link to="/stuffplus" className="nav-link active">Stuff+</Link>
        </nav>

        <header className="hero">
          <h1 className="hero-title">Stuff+ Model Overview</h1>
          <p className="hero-subtitle">
            Stuff+ evaluates pitch quality from underlying pitch characteristics instead
            of outcomes.
          </p>
        </header>

        <section className="panel stuff-panel">
          <h2>How to Read Stuff+</h2>
          <ul className="metric-list">
            <li>
              <strong>100</strong> — League average pitch quality.
            </li>
            <li>
              <strong>120+</strong> — Elite pitch quality.
            </li>
            <li>
              <strong>80</strong> — Below-average pitch quality.
            </li>
          </ul>

          <p className="note-text">
            Typical model inputs include velocity, spin rate, movement profile, and
            release traits.
          </p>
        </section>
      </div>
    </div>
  );
}