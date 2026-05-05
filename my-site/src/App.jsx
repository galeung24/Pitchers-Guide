import { BrowserRouter, Routes, Route } from "react-router-dom";
import TrackmanHeatmapPage from "./TrackmanHeatMapPage";
import StuffPlusPage from "./StuffPlusPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TrackmanHeatmapPage />} />
        <Route path="/stuffplus" element={<StuffPlusPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

