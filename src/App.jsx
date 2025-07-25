import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { EquipoProvider } from './context/EquipoContext';
import { migrarObservacionesANotas } from './hooks/useDB';
import { useEffect } from 'react';

import Jugadores from './pages/Jugadores';
import Practicas from './pages/Practicas';
import Partidos from './pages/Partidos';
import Estadisticas from './pages/Estadisticas';
import Equipos from './pages/Equipos';
import AppWrapper from './AppWrapper';
import Configuracion from './pages/Configuracion';
import DetallePractica from './pages/DetallePractica';
import DetallePartido from './pages/DetallePartido';

export default function App() {
  useEffect(() => {
    // Solo corre si no migraste aún
    if (!localStorage.getItem("migracionNotasHecha")) {
      migrarObservacionesANotas().then(() => {
        localStorage.setItem("migracionNotasHecha", "1");
      });
    }
  }, []);

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
                <Route path="/practicas/:id" element={<DetallePractica />} />
                <Route path="/partidos" element={<Partidos />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
                <Route path="/equipos" element={<Equipos />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/partidos/:id" element={<DetallePartido />} />
              </Routes>
            </Layout>
          </AppWrapper>
        </Router>
      </EquipoProvider>
    </ThemeProvider>
  );
}
