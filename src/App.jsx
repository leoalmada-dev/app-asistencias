import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

import Jugadores from './pages/Jugadores';
import Practicas from './pages/Practicas';
import Partidos from './pages/Partidos';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Jugadores />} />
            <Route path="/jugadores" element={<Jugadores />} />
            <Route path="/practicas" element={<Practicas />} />
            <Route path="/partidos" element={<Partidos />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}
