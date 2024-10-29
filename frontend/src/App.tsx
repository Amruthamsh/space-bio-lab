import Navbar from "./Components/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs";
import Microbial from "./Pages/Microbial";
import Clinostat from "./Pages/Clinostat";

export default function App() {
  return (
    <div className="w-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/microbial-visualizations" element={<Microbial />} />
        <Route path="/clinostat" element={<Clinostat />} />
      </Routes>
    </div>
  );
}
