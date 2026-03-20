import { Routes, Route } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LandingPage from './pages/LandingPage';
import ProfileInput from './pages/ProfileInput';
import GapAnalysis from './pages/GapAnalysis';
import LearningRoadmap from './pages/LearningRoadmap';
import MockInterview from './pages/MockInterview';
import Settings from './pages/Settings';

function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;
  return (
    <div className={`toast toast--${state.toast.type}`}>
      {state.toast.message}
    </div>
  );
}

export default function App() {
  const { state } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="*"
          element={
            <div className="app-layout">
              <Sidebar />
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/profile" element={<ProfileInput />} />
                  <Route path="/dashboard" element={<GapAnalysis />} />
                  <Route path="/roadmap" element={<LearningRoadmap />} />
                  <Route path="/interview" element={<MockInterview />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
      <Toast />
    </>
  );
}
