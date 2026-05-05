import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="page">
      <div className="app-shell">
        {/* HEADER */}
        <header className="hero" style={{ textAlign: "center" }}>
          <h1 className="hero-title" style={{ fontSize: "48px" }}>
            Pitcher’s Guide
          </h1>
        </header>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginTop: "50px",
          }}
        >
          {/* HEATMAP CARD */}
          <Link to="/heatmaps" style={{ textDecoration: "none" }}>
            <div className="feature-card">
              <h2>Heatmaps</h2>
              <p>
                Visualize pitch location and contact quality across zones.
                Filter by count, hitter side, and pitch type.
              </p>
            </div>
          </Link>

          {/* STUFF+ CARD */}
          <Link to="/stuffplus" style={{ textDecoration: "none" }}>
            <div className="feature-card">
              <h2>Stuff+</h2>
              <p>
                Evaluate pitch quality using advanced models and compare
                performance across pitch types.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}