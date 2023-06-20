import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
import Home from 'pages/Home';
import ReconnectingToast from 'components/ReconnectingToast';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ReconnectingToast />
    </Router>
  );
}

export default AppRouter;
