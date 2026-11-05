import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="grid min-h-[50vh] place-items-center"><Spinner /></div>;
  if (!user) return <Navigate to="/masuk" replace state={{ from: loc.pathname }} />;
  return children;
}
