import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '@/lib/store';
import Vote from '@/pages/Vote';
import Add from '@/pages/Add';
import Report from '@/pages/Report';
import Steward from '@/pages/Steward';
import About from '@/pages/About';

export default function App() {
  const lang = useStore((s) => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  }, [lang]);

  return (
    <HashRouter>
      <div className="ground min-h-dvh text-foreground">
        <Routes>
          <Route path="/" element={<Vote />} />
          <Route path="/add" element={<Add />} />
          <Route path="/report" element={<Report />} />
          <Route path="/steward" element={<Steward />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}