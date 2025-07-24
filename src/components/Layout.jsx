// src/components/Layout.jsx
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container className="mt-4">
        {children}
      </Container>
    </>
  );
}
