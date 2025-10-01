import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";

// Layout components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load page components for better performance
const HomePage = lazy(() => import("./components/pages/HomePage"));
const IcoPresalePage = lazy(() => import("./components/pages/IcoPresalePage"));
const ExplorerPage = lazy(() => import("./components/pages/ExplorerPage"));
const WalletPage = lazy(() => import("./components/pages/WalletPage"));
const DashboardPage = lazy(() => import("./components/pages/DashboardPage"));
const DocsPage = lazy(() => import("./components/pages/DocsPage"));
const SettingsPage = lazy(() => import("./components/pages/SettingsPage"));
const GasStationPage = lazy(() => import("./components/pages/GasStationPage"));
const SynergyScorePage = lazy(() => import("./components/pages/SynergyScorePage"));


// Fallback component for lazy loading
const PageLoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <LoadingScreen isLoading={true} />
    </Box>
);

function App() {
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (isInitialLoading) {
        return <LoadingScreen isLoading={true} />;
    }

    return (
        <Box minH="100vh" display="flex" flexDirection="column">
            <div className="parallax-bg"></div>
            <Navbar />
            <Box flex="1" minHeight="0" overflow="hidden">
                <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/ico-presale" element={<IcoPresalePage />} />
                        <Route path="/explorer" element={<ExplorerPage />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />  {/* Your existing dashboard */}
                        <Route path="/synergy-score" element={<SynergyScorePage />} />  {/* New Synergy Dashboard */}
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/docs/:category/:slug" element={<DocsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/gas-station" element={<GasStationPage />} />
                    </Routes>
                </Suspense>
            </Box>
            <Footer />
        </Box>
    );
}

export default App;
