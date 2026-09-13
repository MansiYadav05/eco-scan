import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ClassifyPage } from './pages/ClassifyPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F8FAF8] text-neutral-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
          {/* Persistent Top Navigation Bar */}
          <Navbar />

          {/* Dedicated Page View Routes */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Navigate to="/classify" replace />} />
              <Route path="/classify" element={<ClassifyPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/classify" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
