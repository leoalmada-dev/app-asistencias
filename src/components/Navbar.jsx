import { Navbar, Container, Nav, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function CustomNavbar() {
  const { modoOscuro, setModoOscuro } = useTheme();
  const { pathname } = useLocation();

  return (
    <Navbar bg={modoOscuro ? 'dark' : 'light'} variant={modoOscuro ? 'dark' : 'light'} expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Fútbol Infantil</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/jugadores" active={pathname === "/jugadores"}>Jugadores</Nav.Link>
          <Nav.Link as={Link} to="/practicas" active={pathname === "/practicas"}>Prácticas</Nav.Link>
          <Nav.Link as={Link} to="/partidos" active={pathname === "/partidos"}>Partidos</Nav.Link>
        </Nav>
        <Form.Check
          type="switch"
          id="modoOscuroSwitch"
          label={modoOscuro ? <FaMoon /> : <FaSun />}
          checked={modoOscuro}
          onChange={() => setModoOscuro(!modoOscuro)}
        />
      </Container>
    </Navbar>
  );
}
