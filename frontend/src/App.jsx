import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import Landing from './pages/Landing.jsx';
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
          <Route path="/rencanakan" element={<Plan />} />
          <Route path="/perjalanan" element={<MyTrips />} />
          <Route path="/perjalanan/:id" element={<TripDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}
