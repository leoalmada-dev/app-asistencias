import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import { obtenerJugadores } from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";

export default function EntrenamientoForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel
}) {
    const [form, setForm] = useState({
        fecha: "",
        hora: "",
        lugar: "",
        duracion: 60,
        asistencias: [],
    });

    const [jugadores, setJugadores] = useState([]);
    const { equipoId } = useEquipo();

    useEffect(() => {
        obtenerJugadores().then(js => {
            // Jugadores activos del equipo actual
            const activos = js.filter(j => j.equipoId === equipoId && j.activo);

            // Si estamos editando, asegurate de incluir los jugadores de asistencias aunque ya no estén activos
            if (modoEdicion && initialData?.asistencias) {
                // Busca los jugadores por id que estén en asistencias pero no en activos
                const idsEnAsistencias = initialData.asistencias.map(a => a.jugadorId);
                const inactivosNecesarios = js.filter(
                    j => j.equipoId === equipoId &&
                        !j.activo &&
                        idsEnAsistencias.includes(j.id)
                );
                setJugadores([...activos, ...inactivosNecesarios]);
            } else {
                setJugadores(activos);
            }
        });
    }, [equipoId, modoEdicion, initialData]);

    useEffect(() => {
        if (modoEdicion && initialData && initialData.asistencias) {
            setForm({
                fecha: initialData.fecha || "",
                hora: initialData.hora || "",
                lugar: initialData.lugar || "",
                duracion: initialData.duracion || 60,
                asistencias: initialData.asistencias.map(a => ({
                    jugadorId: a.jugadorId,
                    nombre: a.nombre,
                    presente: a.presente ?? true,
                    motivo: a.motivo || ""
                }))
            });
        } else if (!modoEdicion && jugadores.length > 0) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraEntrenamiento") || "18:00";
            const ultimaDuracion = parseInt(localStorage.getItem("ultimaDuracionEntrenamiento")) || 60;
            const ultimoLugar = localStorage.getItem("ultimoLugarEntrenamiento") || ""; // <<< NUEVO

            const asistenciasIniciales = jugadores.map((j) => ({
                jugadorId: j.id,
                nombre: j.nombre,
                presente: true,
                motivo: "",
            }));

            setForm({
                fecha: hoy,
                hora: ultimaHora,
                lugar: ultimoLugar, // <<< PRE-CARGA AQUÍ
                duracion: ultimaDuracion,
                asistencias: asistenciasIniciales
            });
        }
        // eslint-disable-next-line
    }, [initialData, modoEdicion, jugadores]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: name === "duracion" ? parseInt(value) : value
        }));
    };

    const togglePresente = (index) => {
        setForm(f => {
            const nuevas = [...f.asistencias];
            nuevas[index].presente = !nuevas[index].presente;
            if (nuevas[index].presente) nuevas[index].motivo = "";
            return { ...f, asistencias: nuevas };
        });
    };

    const cambiarMotivo = (index, motivo) => {
        setForm(f => {
            const nuevas = [...f.asistencias];
            nuevas[index].motivo = motivo;
            return { ...f, asistencias: nuevas };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        localStorage.setItem("ultimaHoraEntrenamiento", form.hora);
        localStorage.setItem("ultimaDuracionEntrenamiento", form.duracion.toString());
        localStorage.setItem("ultimoLugarEntrenamiento", form.lugar);

        if (!modoEdicion) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraEntrenamiento") || "18:00";
            const ultimaDuracion = parseInt(localStorage.getItem("ultimaDuracionEntrenamiento")) || 60;

            const asistenciasIniciales = jugadores.map((j) => ({
                jugadorId: j.id,
                nombre: j.nombre,
                presente: true,
                motivo: "",
            }));

            setForm({
                fecha: hoy,
                hora: ultimaHora,
                lugar: "",
                duracion: ultimaDuracion,
                asistencias: asistenciasIniciales
            });
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <fieldset className={`rounded p-3 mb-4 ${modoEdicion ? "border border-warning" : "border"}`}>
                <legend className="float-none w-auto px-2 fs-5">
                    {modoEdicion ? "Editar entrenamiento" : "Registrar entrenamiento"}
                </legend>

                <Row>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha"
                                value={form.fecha}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Hora</Form.Label>
                            <Form.Control
                                type="time"
                                name="hora"
                                value={form.hora}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Duración (min)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duracion"
                                min={10}
                                step={5}
                                value={form.duracion}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Lugar</Form.Label>
                            <Form.Control
                                name="lugar"
                                value={form.lugar}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <h5>Asistencias ({form.asistencias.length})</h5>
                <Table size="sm" bordered hover>
                    <thead>
                        <tr className="text-center">
                            <th style={{ width: "5%" }}>#</th>
                            <th style={{ width: "55%" }}>Jugador</th>
                            <th style={{ width: "15%" }}>Presente</th>
                            <th style={{ width: "25%" }}>Motivo (si falta)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.asistencias
                            .map((a) => {
                                const jugador = jugadores.find(j => j.id === a.jugadorId);
                                return {
                                    ...a,
                                    nombreCompleto: a.nombre,
                                    activo: jugador?.activo !== false // true por defecto si no se encuentra (por si fue borrado)
                                };
                            })
                            .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
                            .map((a, index) => {
                                const i = form.asistencias.findIndex(as => as.jugadorId === a.jugadorId);
                                const estiloNombre = !a.activo
                                    ? { color: "#888", opacity: 0.7, fontStyle: "italic" }
                                    : {};
                                return (
                                    <tr key={a.jugadorId || index}>
                                        <td className="text-center align-middle">{index + 1}</td>
                                        <td className="align-middle  ps-2" style={estiloNombre}>
                                            {a.nombreCompleto}
                                            {!a.activo && (
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip id={`tt-inactivo-${a.jugadorId}`}>
                                                            Este jugador está marcado como <b>inactivo</b> y no se tiene en cuenta para estadísticas.
                                                        </Tooltip>
                                                    }
                                                >
                                                    <Badge
                                                        bg="secondary"
                                                        className="ms-2"
                                                        style={{ fontSize: "0.85em", cursor: "pointer" }}
                                                    >
                                                        inactivo
                                                    </Badge>
                                                </OverlayTrigger>
                                            )}
                                        </td>
                                        <td className="text-center align-middle">
                                            <Form.Check
                                                className="m-0"
                                                style={{ verticalAlign: "middle" }}
                                                type="checkbox"
                                                checked={a.presente}
                                                onChange={(e) => {
                                                    const nuevas = [...form.asistencias];
                                                    nuevas[i].presente = e.target.checked;
                                                    if (e.target.checked) nuevas[i].motivo = "";
                                                    setForm({ ...form, asistencias: nuevas });
                                                }}
                                            />
                                        </td>
                                        <td>
                                            {!a.presente ? (
                                                <Form.Control
                                                    size="sm"
                                                    placeholder="Motivo"
                                                    value={a.motivo}
                                                    onChange={(e) => cambiarMotivo(i, e.target.value)}
                                                />
                                            ) : (
                                                <div style={{ height: "31px" }} />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </Table>

                <div className="d-flex gap-2 align-items-center mt-3">
                    <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                        {modoEdicion ? "Actualizar" : "Registrar entrenamiento"}
                    </Button>
                    {modoEdicion && onCancel && (
                        <Button variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
                <div className="text-secondary small mt-2">
                    <b>Tip:</b> Podés marcar ausencias e indicar el motivo. Solo los jugadores activos se muestran en la lista de asistencia.
                </div>
            </fieldset>
        </Form>
    );
}
