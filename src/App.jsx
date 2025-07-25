import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { EquipoProvider } from './context/EquipoContext';

import Jugadores from './pages/Jugadores';
import Practicas from './pages/Practicas';
import Partidos from './pages/Partidos';
import Estadisticas from './pages/Estadisticas';
import Equipos from './pages/Equipos';
import AppWrapper from './AppWrapper';

export default function App() {
  return (
    <ThemeProvider>
      <EquipoProvider>
        <Router>
          <AppWrapper>
            <Layout>
              <Routes>
                <Route path="/" element={<Jugadores />} />
                <Route path="/jugadores" element={<Jugadores />} />
                <Route path="/practicas" element={<Practicas />} />
                <Route path="/partidos" element={<Partidos />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
                <Route path="/equipos" element={<Equipos />} />
              </Routes>
            </Layout>
          </AppWrapper>
        </Router>
      </EquipoProvider>
    </ThemeProvider>
  );
}
