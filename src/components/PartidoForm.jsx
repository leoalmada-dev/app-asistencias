import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";
import { FaTimes, FaTrash } from "react-icons/fa";

export default function PartidoForm({ onSave, initialData = {}, modoEdicion = false, onCancel }) {
    const [form, setForm] = useState({
        fecha: "",
        hora: "",
        duracion: 60,
        tipo: "amistoso",
        torneo: "",
        rival: "",
        golesFavor: 0,
        golesContra: 0,
        participaciones: [],
        cambios: [],
    });

    const [jugadores, setJugadores] = useState([]);
    const { equipoId } = useEquipo();

    useEffect(() => {
        obtenerJugadores().then(js => {
            setJugadores(js.filter(j => j.equipoId === equipoId));
        });
    }, [equipoId]);

    useEffect(() => {
        if (modoEdicion && initialData) {
            setForm({
                fecha: initialData.fecha || "",
                hora: initialData.hora || "",
                duracion: initialData.duracion || 60,
                tipo: initialData.tipo || "amistoso",
                torneo: initialData.torneo || "",
                rival: initialData.rival || "",
                golesFavor: initialData.golesFavor ?? 0,
                golesContra: initialData.golesContra ?? 0,
                participaciones: initialData.participaciones
                    ? initialData.participaciones.map(p => ({
                        ...p,
                        goles: p.goles ?? 0
                    }))
                    : [],
                cambios: initialData.cambios ?? [],
            });
        } else if (!modoEdicion) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraPartido") || "18:00";
            const ultimaDuracion = parseInt(localStorage.getItem("ultimaDuracionPartido")) || 60;

            setForm({
                fecha: hoy,
                hora: ultimaHora,
                duracion: ultimaDuracion,
                tipo: "amistoso",
                torneo: "",
                rival: "",
                golesFavor: 0,
                golesContra: 0,
                participaciones: [],
                cambios: [],
            });
        }
    }, [initialData, modoEdicion]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "duracion" ? parseInt(value) : value });
    };

    const handleParticipacionChange = (index, campo, valor) => {
        const nuevas = [...form.participaciones];
        nuevas[index][campo] = valor;
        setForm({ ...form, participaciones: nuevas });
    };

    const agregarParticipante = () => {
        setForm(f => ({
            ...f,
            participaciones: [
                ...f.participaciones,
                {
                    jugadorId: "",
                    minutoEntrada: 0,
                    minutoSalida: f.duracion,
                    goles: 0
                }
            ]
        }));
    };

    const agregarTodosLosJugadores = () => {
        const existentes = form.participaciones.map(p => p.jugadorId);
        const nuevos = jugadores
            .filter(j => !existentes.includes(j.id))
            .sort((a, b) => {
                const numA = parseInt(a.numero) || 999;
                const numB = parseInt(b.numero) || 999;
                if (numA !== numB) return numA - numB;
                return a.nombre.localeCompare(b.nombre);
            })
            .map(j => ({
                jugadorId: j.id,
                minutoEntrada: 0,
                minutoSalida: form.duracion,
                goles: 0
            }));

        const combinados = [...form.participaciones, ...nuevos];

        const combinadosOrdenados = combinados
            .map(p => ({
                ...p,
                jugador: jugadores.find(j => j.id === p.jugadorId) || {}
            }))
            .sort((a, b) => {
                const numA = parseInt(a.jugador.numero) || 999;
                const numB = parseInt(b.jugador.numero) || 999;
                if (numA !== numB) return numA - numB;
                return (a.jugador.nombre || "").localeCompare(b.jugador.nombre || "");
            })
            .map(({ jugador, ...resto }) => resto);

        setForm(f => ({
            ...f,
            participaciones: combinadosOrdenados
        }));
    };

    const eliminarParticipante = (index) => {
        const nuevas = [...form.participaciones];
        nuevas.splice(index, 1);
        setForm({ ...form, participaciones: nuevas });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        localStorage.setItem("ultimaHoraPartido", form.hora);
        localStorage.setItem("ultimaDuracionPartido", form.duracion.toString());

        if (!modoEdicion) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraPartido") || "18:00";
            const ultimaDuracion = parseInt(localStorage.getItem("ultimaDuracionPartido")) || 60;

            setForm({
                fecha: hoy,
                hora: ultimaHora,
                duracion: ultimaDuracion,
                tipo: "amistoso",
                torneo: "",
                rival: "",
                golesFavor: 0,
                golesContra: 0,
                participaciones: [],
                cambios: [],
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <fieldset className={`rounded p-3 mb-4 ${modoEdicion ? "border border-warning" : "border"}`}>
                <legend className="float-none w-auto px-2 fs-5">
                    {modoEdicion ? "Editar partido" : "Registrar partido"}
                </legend>

                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Hora</Form.Label>
                            <Form.Control type="time" name="hora" value={form.hora} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Duración (min)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duracion"
                                min={10}
                                step={5}
                                value={form.duracion}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select name="tipo" value={form.tipo} onChange={handleChange}>
                                <option value="amistoso">Amistoso</option>
                                <option value="campeonato">Campeonato</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Torneo</Form.Label>
                            <Form.Control name="torneo" value={form.torneo} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Rival</Form.Label>
                            <Form.Control name="rival" value={form.rival} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Goles a favor</Form.Label>
                            <Form.Control type="number" name="golesFavor" value={form.golesFavor} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Goles en contra</Form.Label>
                            <Form.Control type="number" name="golesContra" value={form.golesContra} onChange={handleChange} />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mb-2 mt-3">
                    <h5>Participaciones ({form.participaciones.length}/{jugadores.length})</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="outline-success"
                            type="button"
                            onClick={agregarParticipante}
                            disabled={form.participaciones.length >= jugadores.length}
                        >
                            + Jugador
                        </Button>
                        <Button
                            size="sm"
                            variant="outline-primary"
                            type="button"
                            onClick={agregarTodosLosJugadores}
                            disabled={form.participaciones.length >= jugadores.length}
                        >
                            + Completar Jugadores
                        </Button>
                    </div>
                </div>

                <Table size="sm" bordered hover className="mt-2">
                    <thead>
                        <tr>
                            <th style={{ width: "5%", textAlign: "center" }}>#</th>
                            <th style={{ width: "45%" }}>Jugador</th>
                            <th style={{ width: "15%" }}>Entrada</th>
                            <th style={{ width: "15%" }}>Salida</th>
                            <th style={{ width: "15%" }}>Goles</th>
                            <th style={{ width: "5%", textAlign: "center" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.participaciones.map((p, i) => (
                            <tr key={i}>
                                <td className="text-center align-middle">{i + 1}</td>
                                <td>
                                    <Form.Select
                                        value={p.jugadorId}
                                        onChange={(e) => handleParticipacionChange(i, 'jugadorId', e.target.value)}
                                    >
                                        <option value="">Seleccionar</option>
                                        {jugadores
                                            .sort((a, b) => {
                                                const numA = parseInt(a.numero) || 999;
                                                const numB = parseInt(b.numero) || 999;
                                                if (numA !== numB) return numA - numB;
                                                return a.nombre.localeCompare(b.nombre);
                                            })
                                            .map(j => {
                                                const yaUsado = form.participaciones.some(
                                                    (otro, idx) => idx !== i && otro.jugadorId === j.id
                                                );
                                                const label = j.numero ? `#${j.numero} - ${j.nombre}` : j.nombre;
                                                return (
                                                    <option
                                                        key={j.id}
                                                        value={j.id}
                                                        disabled={yaUsado}
                                                        title={label}
                                                    >
                                                        {label}
                                                    </option>
                                                );
                                            })}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        value={p.minutoEntrada}
                                        onChange={(e) => handleParticipacionChange(i, 'minutoEntrada', e.target.value)}
                                        style={{ width: "100%" }}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        value={p.minutoSalida}
                                        onChange={(e) => handleParticipacionChange(i, 'minutoSalida', e.target.value)}
                                        style={{ width: "100%" }}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={p.goles || 0}
                                        onChange={e => handleParticipacionChange(i, 'goles', parseInt(e.target.value) || 0)}
                                        style={{ width: "100%" }}
                                    />
                                </td>
                                <td className="text-center align-middle p-0">
                                    <Button
                                        variant="Link"
                                        size="sm"
                                        type="button"
                                        className="text-danger py-1"
                                        onClick={() => eliminarParticipante(i)}
                                        title="Quitar jugador"
                                    >
                                        <FaTimes />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="d-flex gap-2 align-items-center mt-3">
                    <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                        {modoEdicion ? "Actualizar" : "Registrar partido"}
                    </Button>
                    {modoEdicion && onCancel && (
                        <Button variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </fieldset>
        </Form>
    );
}
