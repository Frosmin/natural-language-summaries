import { Route, Routes } from 'react-router';
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx"; // Asegúrate de que la ruta sea correcta

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
