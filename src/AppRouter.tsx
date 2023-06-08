import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
import Home from 'pages/Home';
// import Navbar from 'components/Navbar';

function AppRouter() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
