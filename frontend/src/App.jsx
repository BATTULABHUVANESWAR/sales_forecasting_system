import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import History from "./pages/History";
import Analytics from "./pages/Analytics";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =================================================
                    PUBLIC
                ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =================================================
                    PROTECTED APPLICATION
                ================================================= */}

                <Route
                    path="/*"
                    element={

                        <ProtectedRoute>

                            <Layout>

                                <Routes>

                                    <Route
                                        path="/"
                                        element={
                                            <Dashboard />
                                        }
                                    />

                                    <Route
                                        path="/forecast"
                                        element={
                                            <Forecast />
                                        }
                                    />

                                    <Route
                                        path="/history"
                                        element={
                                            <History />
                                        }
                                    />

                                    <Route
                                        path="/analytics"
                                        element={
                                            <Analytics />
                                        }
                                    />

                                </Routes>

                            </Layout>

                        </ProtectedRoute>

                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;