import { Navbar, Container, Nav, Form, InputGroup } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEquipo } from '../context/EquipoContext';
import { obtenerEquipos } from '../hooks/useDB';
import { useEffect, useState } from 'react';
import { FaMoon, FaSun, FaShirt } from 'react-icons/fa6'; // remera

export default function CustomNavbar() {
  const { modoOscuro, setModoOscuro } = useTheme();
  const { pathname } = useLocation();
  const { equipoId, setEquipoId } = useEquipo();
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    obtenerEquipos().then(setEquipos);
  }, []);

  return (
    <Navbar expand="lg" bg={modoOscuro ? 'dark' : 'light'} variant={modoOscuro ? 'dark' : 'light'} sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">Fútbol Infantil</Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/jugadores" active={pathname === "/jugadores"}>Jugadores</Nav.Link>
            <Nav.Link as={Link} to="/practicas" active={pathname === "/practicas"}>Prácticas</Nav.Link>
            <Nav.Link as={Link} to="/partidos" active={pathname === "/partidos"}>Partidos</Nav.Link>
            <Nav.Link as={Link} to="/estadisticas" active={pathname === "/estadisticas"}>Estadísticas</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3">
            {/* Selector de equipo */}
            <InputGroup size="sm" className="w-auto">
              <InputGroup.Text>
                <FaShirt />
              </InputGroup.Text>
              <Form.Select
                value={equipoId || ""}
                onChange={(e) => setEquipoId(parseInt(e.target.value))}
                title="Seleccionar equipo"
              >
                <option value="">Equipo</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </Form.Select>
            </InputGroup>
            
            {/* Icono de modo oscuro */}
            <Form.Check
              type="switch"
              id="modoOscuroSwitch"
              label={modoOscuro ? <FaMoon /> : <FaSun />}
              checked={modoOscuro}
              onChange={() => setModoOscuro(!modoOscuro)}
            />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
