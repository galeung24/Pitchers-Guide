// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import TrackmanHeatmapPage from "./TrackmanHeatMapPage";
// import StuffPlusPage from "./StuffPlusPage";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<TrackmanHeatmapPage />} />
//         <Route path="/stuffplus" element={<StuffPlusPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import TrackmanHeatmapPage from "./TrackmanHeatMapPage";
import StuffPlusPage from "./StuffPlusPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/heatmaps" element={<TrackmanHeatmapPage />} />
        <Route path="/stuffplus" element={<StuffPlusPage />} />
      </Routes>
    </Router>
  );
}