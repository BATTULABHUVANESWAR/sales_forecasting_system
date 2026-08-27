import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/forecast" element={<Forecast />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
