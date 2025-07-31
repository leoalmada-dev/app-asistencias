import { useState } from 'react';
import { Navbar, Container, Nav, Form, InputGroup } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEquipo } from '../context/EquipoContext';
import { FaCog, FaMoon, FaSun, FaFutbol, FaChartBar } from 'react-icons/fa';
import { FaShirt, FaDumbbell } from 'react-icons/fa6';

export default function CustomNavbar() {
  const { modoOscuro, setModoOscuro } = useTheme();
  const { pathname } = useLocation();
  const { equipos, equipoId, setEquipoId } = useEquipo();
  const [expanded, setExpanded] = useState(false);

  const equipoSelectValue = equipoId || (equipos[0]?.id ?? "");
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
          MiPlantel
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/entrenamientos" active={pathname === "/entrenamientos"} onClick={handleNavClick} className="d-flex align-items-center">
              <FaDumbbell className="me-2" />
              Entrenamientos
            </Nav.Link>
            <Nav.Link as={Link} to="/partidos" active={pathname === "/partidos"} onClick={handleNavClick} className="d-flex align-items-center">
              <FaFutbol className="me-2" />
              Partidos
            </Nav.Link>
            <Nav.Link as={Link} to="/estadisticas" active={pathname === "/estadisticas"} onClick={handleNavClick} className="d-flex align-items-center">
              <FaChartBar className="me-2" />
              Estadísticas
            </Nav.Link>
            {/* Configuración: solo texto + icono en hamburguesa */}
            <div className="d-lg-none">
              <Nav.Link
                as={Link}
                to="/configuracion"
                active={pathname === "/configuracion"}
                onClick={handleNavClick}
                className="d-flex align-items-center"
              >
                <FaCog className="me-2" />
                Configuración
              </Nav.Link>
            </div>
          </Nav>

          {/* Selector de equipo + Switch + Engranaje */}
          <div
            className={
              "d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3 mt-3 mt-lg-0"
            }
            style={{
              minWidth: 250, // para evitar que quede todo apretado
            }}
          >
            <InputGroup size="sm" className="w-auto mb-2 mb-lg-0">
              <InputGroup.Text>
                <FaShirt />
              </InputGroup.Text>
              <Form.Select
                size="sm"
                value={equipoSelectValue}
                onChange={e => {
                  setEquipoId(Number(e.target.value));
                  setExpanded(false); // Cierra el menú hamburguesa si está abierto
                }}
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
            {/* Switch + icono bien alineados */}
            <div className="d-flex align-items-center" style={{ minWidth: 80 }}>
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  height: "32px", // igual al alto del switch
                  width: "32px",
                  fontSize: "1.2rem",
                  marginRight: "8px",
                }}
              >
                {modoOscuro ? <FaMoon /> : <FaSun />}
              </span>
              <Form.Check
                type="switch"
                id="modoOscuroSwitch"
                checked={modoOscuro}
                onChange={() => setModoOscuro(!modoOscuro)}
                style={{ marginBottom: 0 }}
              />
            </div>
            {/* Engranaje solo desktop */}
            <Nav.Link
              as={Link}
              to="/configuracion"
              active={pathname === "/configuracion"}
              onClick={handleNavClick}
              className="d-none d-lg-flex align-items-center ms-2"
              style={{
                fontSize: "1.4rem",
                padding: 0,
                color: modoOscuro ? "#fff" : "#333",
                minHeight: "40px"
              }}
              title="Configuración"
            >
              <FaCog />
            </Nav.Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
