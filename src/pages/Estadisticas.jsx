import { useEffect, useState } from "react";
import { obtenerJugadores, obtenerPartidos } from "../hooks/useDB";
import { Table } from "react-bootstrap";
import { useEquipo } from "../context/EquipoContext";

export default function Estadisticas() {
    const [estadisticas, setEstadisticas] = useState([]);
    const { equipoId } = useEquipo();

    useEffect(() => {
        const cargarEstadisticas = async () => {
            const jugadores = (await obtenerJugadores()).filter(j => j.equipoId === equipoId);
            const partidos = (await obtenerPartidos()).filter(p => p.equipoId === equipoId);

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
    }, [equipoId]);

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
