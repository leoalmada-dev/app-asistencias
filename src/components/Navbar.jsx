import { useState } from 'react';
import { Navbar, Container, Nav, Form, InputGroup } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEquipo } from '../context/EquipoContext';
import { FaMoon, FaSun, FaShirt } from 'react-icons/fa6';

export default function CustomNavbar() {
  const { modoOscuro, setModoOscuro } = useTheme();
  const { pathname } = useLocation();
  const { equipos, equipoId, setEquipoId } = useEquipo();
  const [expanded, setExpanded] = useState(false); // Estado para hamburguesa

  // Equipo predeterminado: primero de la lista si ninguno seleccionado
  const equipoSelectValue = equipoId || (equipos[0]?.id ?? "");

  // Función para colapsar menú tras navegar
  const handleNavClick = () => setExpanded(false);

  return (
    <Navbar
      expand="lg"
      bg={modoOscuro ? 'dark' : 'light'}
      variant={modoOscuro ? 'dark' : 'light'}
      sticky="top"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={handleNavClick}>
          Fútbol Asistencias
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/jugadores" active={pathname === "/jugadores"} onClick={handleNavClick}>
              Jugadores
            </Nav.Link>
            <Nav.Link as={Link} to="/practicas" active={pathname === "/practicas"} onClick={handleNavClick}>
              Prácticas
            </Nav.Link>
            <Nav.Link as={Link} to="/partidos" active={pathname === "/partidos"} onClick={handleNavClick}>
              Partidos
            </Nav.Link>
            <Nav.Link as={Link} to="/estadisticas" active={pathname === "/estadisticas"} onClick={handleNavClick}>
              Estadísticas
            </Nav.Link>
            <Nav.Link as={Link} to="/equipos" active={pathname === "/equipos"} onClick={handleNavClick}>
              Equipos
            </Nav.Link>
            <Nav.Link as={Link} to="/configuracion" active={pathname === "/configuracion"} onClick={handleNavClick}>
              Configuración
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3">
            {/* Selector de equipo */}
            <InputGroup size="sm" className="w-auto">
              <InputGroup.Text>
                <FaShirt />
              </InputGroup.Text>
              <Form.Select
                size="sm"
                value={equipoSelectValue}
                onChange={e => setEquipoId(Number(e.target.value))}
                className="w-auto"
                title="Seleccionar equipo"
              >
                {equipos.length === 0 && (
                  <option value="">Sin equipos</option>
                )}
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
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
