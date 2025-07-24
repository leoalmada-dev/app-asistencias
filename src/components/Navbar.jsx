// src/components/Navbar.jsx
import { Navbar, Container, Nav, Form } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

export default function CustomNavbar() {
  const { modoOscuro, setModoOscuro } = useTheme();

  return (
    <Navbar bg={modoOscuro ? 'dark' : 'light'} variant={modoOscuro ? 'dark' : 'light'} expand="lg">
      <Container>
        <Navbar.Brand href="#">Fútbol Infantil</Navbar.Brand>
        <Nav className="ms-auto">
          <Form.Check
            type="switch"
            id="modoOscuroSwitch"
            label="🌙"
            checked={modoOscuro}
            onChange={() => setModoOscuro(!modoOscuro)}
          />
        </Nav>
      </Container>
    </Navbar>
  );
}
