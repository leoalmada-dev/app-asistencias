// src/components/Layout.jsx
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';
import SelectorEquipo from './SelectorEquipo';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container className="py-4">
        <div className="mx-auto w-100" style={{ maxWidth: "960px" }}>
          {children}
        </div>
      </Container>
    </>
  );
}
