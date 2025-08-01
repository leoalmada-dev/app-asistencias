import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Table, Badge, OverlayTrigger, Tooltip, InputGroup, Modal } from "react-bootstrap";
import { obtenerJugadores, obtenerCampeonatos, agregarCampeonato } from "../hooks/useDB";
import { useEquipo } from "../context/EquipoContext";
import { FaTimes, FaPlus, FaCogs } from "react-icons/fa";

export default function PartidoForm({ onSave, initialData = {}, modoEdicion = false, onCancel }) {
    const [form, setForm] = useState({
        fecha: "",
        hora: "",
        tipo: "campeonato",
        torneo: "",
        rival: "",
        golesFavor: 0,
        golesContra: 0,
        participaciones: [],
        cambios: [],
    });

    const [jugadoresTodos, setJugadoresTodos] = useState([]);
    const [jugadoresActivos, setJugadoresActivos] = useState([]);
    const [campeonatos, setCampeonatos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevoCampeonato, setNuevoCampeonato] = useState({ nombre: "", anio: "" });
    const [guardando, setGuardando] = useState(false);
    const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);
    const { equipos, equipoId } = useEquipo();
    const equipo = equipos.find(e => e.id === equipoId);

    const configPorDefecto = equipo?.configPartidos || {
        duracion: 60,
        cambios: 7,
        puedeReingresar: true,
        jugadoresEnCancha: 9
    };

    // --- Estado override y modal config partido ---
    const [overrideConfig, setOverrideConfig] = useState(null); // null=usa defaults
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configForm, setConfigForm] = useState(configPorDefecto);

    useEffect(() => {
        if (modoEdicion && initialData) {
            setOverrideConfig({
                duracion: initialData.duracion ?? configPorDefecto.duracion,
                cambios: initialData.cambios ?? configPorDefecto.cambios,
                puedeReingresar: typeof initialData.puedeReingresar === "boolean"
                    ? initialData.puedeReingresar
                    : configPorDefecto.puedeReingresar,
                jugadoresEnCancha: initialData.jugadoresEnCancha ?? configPorDefecto.jugadoresEnCancha
            });
        } else {
            setOverrideConfig(null);
        }
        // eslint-disable-next-line
    }, [initialData, modoEdicion, equipoId]);

    // Sync configForm con la config efectiva cada vez que se abre el modal
    useEffect(() => {
        if (showConfigModal) setConfigForm({ ...(overrideConfig || configPorDefecto) });
        // eslint-disable-next-line
    }, [showConfigModal]);

    useEffect(() => {
        if (equipoId) {
            obtenerJugadores().then(js => {
                const delEquipo = js.filter(j => j.equipoId === equipoId);
                setJugadoresTodos(delEquipo);
                setJugadoresActivos(delEquipo.filter(j => j.activo));
            });
            obtenerCampeonatos(equipoId).then(cs => {
                setCampeonatos(cs.filter(c => c.activo));
            });
        }
    }, [equipoId]);

    useEffect(() => {
        if (modoEdicion && initialData) {
            setForm({
                fecha: initialData.fecha || "",
                hora: initialData.hora || "",
                tipo: initialData.tipo || "campeonato",
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
            setForm({
                fecha: hoy,
                hora: ultimaHora,
                tipo: "campeonato",
                torneo: "",
                rival: "",
                golesFavor: 0,
                golesContra: 0,
                participaciones: [],
                cambios: [],
            });
        }
    }, [initialData, modoEdicion]);

    useEffect(() => {
        const seleccionados = form.participaciones
            .map(p => parseInt(p.jugadorId))
            .filter(id => !isNaN(id));
        setJugadoresSeleccionados(seleccionados);
    }, [form.participaciones]);

    const handleTipoChange = (e) => {
        const value = e.target.value;
        setForm(f => ({
            ...f,
            tipo: value,
            torneo: value === "amistoso" ? "Amistoso" : "",
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleParticipacionChange = (index, campo, valor) => {
        const nuevas = [...form.participaciones];
        if (campo === "jugadorId") {
            const yaUsado = nuevas.some((p, i) => i !== index && p.jugadorId === valor);
            if (yaUsado) {
                alert("Ese jugador ya fue seleccionado en otra participación.");
                return;
            }
        }
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
                    minutoSalida: (overrideConfig || configPorDefecto).duracion,
                    goles: 0
                }
            ]
        }));
    };

    const agregarTodosLosJugadores = () => {
        const existentesValidos = form.participaciones
            .filter(p => !isNaN(parseInt(p.jugadorId)))
            .map(p => parseInt(p.jugadorId));
        const nuevos = jugadoresActivos
            .filter(j => !existentesValidos.includes(j.id))
            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
            .map(j => ({
                jugadorId: j.id,
                minutoEntrada: 0,
                minutoSalida: (overrideConfig || configPorDefecto).duracion,
                goles: 0
            }));
        const todos = [
            ...form.participaciones.filter(p => !isNaN(parseInt(p.jugadorId))),
            ...nuevos
        ];
        const todosOrdenados = todos
            .map(p => ({
                ...p,
                jugador: jugadoresTodos.find(j => j.id === p.jugadorId) || {}
            }))
            .sort((a, b) => (a.jugador.nombre || "").localeCompare(b.jugador.nombre || ""))
            .map(({ jugador, ...resto }) => resto);

        setForm(f => ({
            ...f,
            participaciones: todosOrdenados
        }));
    };

    const eliminarParticipante = (index) => {
        const nuevas = [...form.participaciones];
        nuevas.splice(index, 1);
        setForm({ ...form, participaciones: nuevas });
    };

    // --- GUARDAR PARTIDO ---
    const configEfectiva = overrideConfig || configPorDefecto;

    const handleSubmit = (e) => {
        e.preventDefault();
        const ids = form.participaciones.map(p => parseInt(p.jugadorId));
        if (ids.some(id => isNaN(id))) {
            alert("Hay participaciones sin jugador asignado.");
            return;
        }
        const unicos = new Set(ids);
        if (unicos.size !== ids.length) {
            alert("Hay jugadores duplicados en las participaciones.");
            return;
        }
        const envio = {
            ...form,
            torneo: form.tipo === "amistoso" ? "Amistoso" : form.torneo,
            ...configEfectiva // ⬅️ importante
        };
        onSave(envio);

        localStorage.setItem("ultimaHoraPartido", form.hora);

        if (!modoEdicion) {
            const hoy = new Date().toISOString().split("T")[0];
            const ultimaHora = localStorage.getItem("ultimaHoraPartido") || "18:00";
            setForm({
                fecha: hoy,
                hora: ultimaHora,
                tipo: "campeonato",
                torneo: "",
                rival: "",
                golesFavor: 0,
                golesContra: 0,
                participaciones: [],
                cambios: [],
            });
            setOverrideConfig(null);
        }
    };

    // --- MODAL de alta rápida de campeonato ---
    const abrirModal = () => {
        setNuevoCampeonato({ nombre: "", anio: "" });
        setShowModal(true);
    };
    const cerrarModal = () => setShowModal(false);

    const handleGuardarCampeonato = async (e) => {
        e.preventDefault();
        if (!nuevoCampeonato.nombre.trim() || !nuevoCampeonato.anio.trim()) return;
        setGuardando(true);
        await agregarCampeonato({
            ...nuevoCampeonato,
            equipoId,
            activo: true
        });
        setGuardando(false);
        setShowModal(false);
        const cs = await obtenerCampeonatos(equipoId);
        setCampeonatos(cs.filter(c => c.activo));
        setForm(f => ({
            ...f,
            torneo: nuevoCampeonato.nombre
        }));
    };

    // --- MODAL CONFIGURACIÓN DE PARTIDO ---
    const handleShowConfigModal = () => setShowConfigModal(true);
    const handleCloseConfigModal = () => setShowConfigModal(false);
    const handleGuardarConfigPartido = () => {
        setOverrideConfig(configForm);
        setShowConfigModal(false);
    };
    const handleConfigChange = (e) => {
        const { name, type, value, checked } = e.target;
        setConfigForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : Number(value)
        }));
    };

    // --- Utilidad para ver si el jugador es inactivo
    const isInactivo = (jugadorId) => {
        const jug = jugadoresTodos.find(j => j.id === jugadorId);
        return jug && !jug.activo;
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <fieldset className={`rounded p-3 mb-4 ${modoEdicion ? "border border-warning" : "border"}`}>
                    <legend className="float-none w-auto px-2 fs-5">
                        {modoEdicion ? "Editar partido" : "Registrar partido"}
                    </legend>
                    <Row>
                        <Col xs={12} md={6} className="mb-2">
                            <Form.Group>
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha"
                                    value={form.fecha}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-2">
                            <Form.Group>
                                <Form.Label>Hora</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="hora"
                                    value={form.hora}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-2">
                            <Form.Group>
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select name="tipo" value={form.tipo} onChange={handleTipoChange}>
                                    <option value="amistoso">Amistoso</option>
                                    <option value="campeonato">Campeonato</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Torneo</Form.Label>
                                {form.tipo === "campeonato" ? (
                                    <InputGroup>
                                        <Form.Select
                                            name="torneo"
                                            value={form.torneo}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Seleccionar campeonato...</option>
                                            {campeonatos.length === 0 && (
                                                <option value="" disabled>No hay campeonatos activos</option>
                                            )}
                                            {campeonatos.map(c => (
                                                <option key={c.id} value={c.nombre}>
                                                    {c.nombre} ({c.anio})
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>Agregar nuevo campeonato</Tooltip>}
                                        >
                                            <Button
                                                variant="outline-secondary"
                                                style={{
                                                    borderTopLeftRadius: 0,
                                                    borderBottomLeftRadius: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: "0 14px",
                                                    height: 38
                                                }}
                                                tabIndex={-1}
                                                onClick={abrirModal}
                                            >
                                                <FaPlus style={{ fontSize: 18 }} />
                                            </Button>
                                        </OverlayTrigger>
                                    </InputGroup>
                                ) : (
                                    <Form.Control
                                        name="torneo"
                                        value="Amistoso"
                                        disabled
                                        readOnly
                                    />
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Fila 2: Rival, Goles a favor, Goles en contra + ruedita */}
                    <Row className="align-items-end">
                        <Col xs={12} md={5} className="mb-2">
                            <Form.Group>
                                <Form.Label>Rival</Form.Label>
                                <Form.Control
                                    name="rival"
                                    value={form.rival}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={5} md={3} className="mb-2">
                            <Form.Group>
                                <Form.Label>Goles a favor</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="golesFavor"
                                    value={form.golesFavor}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={5} md={3} className="mb-2">
                            <Form.Group>
                                <Form.Label>Goles en contra</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="golesContra"
                                    value={form.golesContra}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={2} md={1} className="mb-2 px-2">
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Configurar reglas especiales para este partido</Tooltip>}
                            >
                                <Button
                                    variant="link"
                                    className="p-0 text-white"
                                    style={{ fontSize: 30 }}
                                    type="button"
                                    tabIndex={-1}
                                    onClick={handleShowConfigModal}
                                >
                                    <FaCogs />
                                </Button>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                    {/* Mostrar la configuración efectiva debajo de la ruedita */}
                    <div className="mb-2 text-secondary small" style={{ marginTop: -5 }}>
                        <span>
                            <FaCogs className="me-1" style={{ fontSize: "1em" }} />
                            <b>Configuración de partido:</b>
                            &nbsp;Duración: <b>{configEfectiva.duracion} min</b>,
                            En cancha: <b>{configEfectiva.jugadoresEnCancha}</b>,
                            Cambios: <b>{configEfectiva.cambios}</b>,
                            Reingreso: <b>{configEfectiva.puedeReingresar ? "Sí" : "No"}</b>.
                            
                        </span>
                    </div>
                    {/* Participaciones */}
                    <div className="mb-2 mt-4">
                        <h5>Participaciones ({form.participaciones.length}/{jugadoresActivos.length})</h5>
                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline-success"
                                type="button"
                                onClick={agregarParticipante}
                                disabled={form.participaciones.length >= jugadoresActivos.length}
                            >
                                + Jugador
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                type="button"
                                onClick={agregarTodosLosJugadores}
                                disabled={form.participaciones.length >= jugadoresActivos.length}
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
                            {form.participaciones.map((p, i) => {
                                const jugador = jugadoresTodos.find(j => j.id === p.jugadorId);
                                const estaInactivo = jugador && !jugador.activo;
                                return (
                                    <tr key={i}>
                                        <td className="text-center align-middle">{i + 1}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Form.Select
                                                    value={p.jugadorId}
                                                    className="form-select-sm"
                                                    onChange={(e) => handleParticipacionChange(i, 'jugadorId', parseInt(e.target.value))}
                                                    style={estaInactivo ? { color: "#aaa", fontStyle: "italic" } : {}}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    {[...jugadoresActivos, ...jugadoresTodos.filter(j => !j.activo && form.participaciones.some(pp => pp.jugadorId === j.id))]
                                                        .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
                                                        .map(j => {
                                                            const deshabilitado = jugadoresSeleccionados.includes(j.id) && j.id !== p.jugadorId;
                                                            const inactivo = !j.activo;
                                                            const label = j.nombre + (j.numero ? ` - #${j.numero}` : "");
                                                            return (
                                                                <option
                                                                    key={j.id}
                                                                    value={j.id}
                                                                    disabled={deshabilitado}
                                                                    style={inactivo ? { color: "#aaa", fontStyle: "italic" } : {}}
                                                                    title={label + (inactivo ? " (inactivo)" : "")}
                                                                >
                                                                    {label} {inactivo ? "(inactivo)" : ""}
                                                                </option>
                                                            );
                                                        })}
                                                </Form.Select>
                                                {estaInactivo &&
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip>Jugador inactivo (no se puede asignar a nuevos partidos)</Tooltip>}
                                                    >
                                                        <Badge bg="secondary" className="ms-2">inactivo</Badge>
                                                    </OverlayTrigger>
                                                }
                                            </div>
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                className="form-select-sm"
                                                value={p.minutoEntrada}
                                                onChange={(e) => handleParticipacionChange(i, 'minutoEntrada', e.target.value)}
                                                style={{ width: "100%" }}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                className="form-select-sm"
                                                value={p.minutoSalida}
                                                onChange={(e) => handleParticipacionChange(i, 'minutoSalida', e.target.value)}
                                                style={{ width: "100%" }}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                className="form-select-sm"
                                                min={0}
                                                value={p.goles || 0}
                                                onChange={e => handleParticipacionChange(i, 'goles', parseInt(e.target.value) || 0)}
                                                style={{ width: "100%" }}
                                            />
                                        </td>
                                        <td className="text-center align-middle p-0">
                                            <Button
                                                variant="link"
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
                                );
                            })}
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
                    <div className="mt-3 small text-secondary">
                        <span>
                            <b>Tip:</b> Cargá todos los jugadores antes de registrar partidos para poder asignar participaciones y cambios correctamente.
                        </span>
                    </div>
                </fieldset>
            </Form>
            {/* MODAL DE CONFIGURACIÓN DE PARTIDO */}
            <Modal show={showConfigModal} onHide={handleCloseConfigModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Configurar reglas para este partido</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Duración (minutos)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duracion"
                                        value={configForm.duracion}
                                        min={10}
                                        max={150}
                                        step={5}
                                        onChange={handleConfigChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Cambios permitidos</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="cambios"
                                        value={configForm.cambios}
                                        min={0}
                                        max={22}
                                        onChange={handleConfigChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Jugadores en cancha</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="jugadoresEnCancha"
                                        value={configForm.jugadoresEnCancha}
                                        min={5}
                                        max={22}
                                        onChange={handleConfigChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-end">
                                <Form.Check
                                    label="Permitir reingreso"
                                    name="puedeReingresar"
                                    checked={configForm.puedeReingresar}
                                    onChange={handleConfigChange}
                                    type="checkbox"
                                />
                            </Col>
                        </Row>
                        <div className="mt-3 d-flex justify-content-end">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => setConfigForm({ ...configPorDefecto })}
                            >
                                Restaurar por defecto
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseConfigModal}>Cancelar</Button>
                    <Button variant="success" onClick={handleGuardarConfigPartido}>
                        Guardar solo para este partido
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* MODAL DE ALTA RÁPIDA DE CAMPEONATO */}
            <Modal show={showModal} onHide={cerrarModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar campeonato</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleGuardarCampeonato}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                value={nuevoCampeonato.nombre}
                                maxLength={40}
                                required
                                onChange={e => setNuevoCampeonato(c => ({ ...c, nombre: e.target.value }))}
                                placeholder="Ej: Liga AUFI, Copa Nacional, etc."
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Año</Form.Label>
                            <Form.Control
                                type="number"
                                min={2000}
                                max={2100}
                                required
                                value={nuevoCampeonato.anio}
                                onChange={e => setNuevoCampeonato(c => ({ ...c, anio: e.target.value }))}
                                placeholder="Ej: 2025"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModal}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleGuardarCampeonato} disabled={guardando}>
                        {guardando ? "Guardando..." : "Agregar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
