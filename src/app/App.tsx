import { Link, Route, Routes } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard';

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="LiD Trainer home">
          <span className="brand-mark">L</span>
          <span>LiD Trainer</span>
        </Link>
        <span className="topbar-caption">LEBEN IN DEUTSCHLAND</span>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      <footer className="app-footer">Made to make exam preparation a little easier.</footer>
    </div>
  );
}