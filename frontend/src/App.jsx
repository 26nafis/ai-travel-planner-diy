import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Plan from './pages/Plan.jsx';
import TripDetail from './pages/TripDetail.jsx';
import MyTrips from './pages/MyTrips.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/masuk" element={<AuthPage mode="login" />} />
          <Route path="/daftar" element={<AuthPage mode="register" />} />
          <Route path="/rencanakan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
          <Route path="/perjalanan" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/perjalanan/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}
