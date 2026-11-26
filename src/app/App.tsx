import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import type { BundeslandCode } from '../types/question';
import { getBundesland } from '../data/bundeslaender';
import BundeslandSetup from '../features/setup/BundeslandSetup';
import Dashboard from '../features/dashboard/Dashboard';

const STORAGE_KEY = 'lid-trainer-bundesland';

function readSavedBundesland(): BundeslandCode | '' {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && getBundesland(saved as BundeslandCode) ? saved as BundeslandCode : '';
  } catch {
    return '';
  }
}

export default function App() {
  const [bundesland, setBundesland] = useState<BundeslandCode | ''>(readSavedBundesland);

  useEffect(() => {
    try {
      if (bundesland) window.localStorage.setItem(STORAGE_KEY, bundesland);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [bundesland]);

  const selectedState = bundesland ? getBundesland(bundesland) : undefined;

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="LiD Trainer home">
          <span className="brand-mark">L</span>
          <span>LiD Trainer</span>
        </Link>
        <div className="topbar-tools">
          <span className="topbar-caption">LEBEN IN DEUTSCHLAND</span>
          {selectedState && (
            <button className="settings-button" type="button" onClick={() => setBundesland('')}>
              Change state
            </button>
          )}
        </div>
      </header>
      <main className="main-content">
        {!selectedState ? (
          <BundeslandSetup value={bundesland} onChange={setBundesland} isFirstVisit />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard selectedState={selectedState} />} />
            <Route path="/settings" element={<BundeslandSetup value={bundesland} onChange={setBundesland} />} />
            <Route path="*" element={<Dashboard selectedState={selectedState} />} />
          </Routes>
        )}
      </main>
      <footer className="app-footer">Made to make exam preparation a little easier.</footer>
    </div>
  );
}
