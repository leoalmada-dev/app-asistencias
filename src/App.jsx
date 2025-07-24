// src/App.jsx
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <h2>Bienvenido al sistema</h2>
        <p>Acá irá tu contenido principal...</p>
      </Layout>
    </ThemeProvider>
  );
}
