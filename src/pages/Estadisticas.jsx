import { useEffect, useState } from "react";
import { obtenerJugadores, obtenerPartidos } from "../hooks/useDB";
import { Table } from "react-bootstrap";

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState([]);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      const jugadores = await obtenerJugadores();
      const partidos = await obtenerPartidos();

      const datos = jugadores.map((jugador) => {
        let minutosTotales = 0;

        partidos.forEach((partido) => {
          partido.participaciones?.forEach((p) => {
            if (parseInt(p.jugadorId) === jugador.id) {
              const entrada = parseInt(p.minutoEntrada) || 0;
              const salida = parseInt(p.minutoSalida) || 0;
              minutosTotales += Math.max(0, salida - entrada);
            }
          });
        });

        return {
          id: jugador.id,
          nombre: jugador.nombre,
          categoria: jugador.categoria,
          posicion: jugador.posicion,
          minutosTotales,
        };
      });

      setEstadisticas(datos);
    };

    cargarEstadisticas();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Estadísticas de minutos jugados</h3>
      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Posición</th>
            <th>Minutos jugados</th>
          </tr>
        </thead>
        <tbody>
          {estadisticas.map((j) => (
            <tr key={j.id}>
              <td>{j.nombre}</td>
              <td>{j.categoria}</td>
              <td>{j.posicion}</td>
              <td>{j.minutosTotales}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
