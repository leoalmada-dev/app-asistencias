import { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { CATEGORIAS_POSICION } from "../data/posiciones";
import AlertaFlotante from "./AlertaFlotante";

export default function JugadorForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel,
    jugadores = []
}) {
    const [form, setForm] = useState({
        nombre: "",
        numero: "",
        posicion: "",
        posicionSecundaria: "",
    });

    const [alerta, setAlerta] = useState({ show: false, mensaje: "", tipo: "success" });

    useEffect(() => {
        if (modoEdicion && initialData) {
            setForm({
                nombre: initialData.nombre || "",
                numero: initialData.numero || "",
                posicion: initialData.posicion || "",
                posicionSecundaria: initialData.posicionSecundaria || "",
            });
        } else if (!modoEdicion) {
            setForm({
                nombre: "",
                numero: "",
                posicion: "",
                posicionSecundaria: "",
            });
        }
    }, [initialData, modoEdicion]);

    // -------- VALIDACIÓN DE NÚMERO ÚNICO ---------
    const jugadorDuplicado = () => {
        if (!form.numero) return null;
        // Log completo para debugging
        console.log("===> Form.numero a comparar:", form.numero, "| tipo:", typeof form.numero);
        console.log("Lista jugadores:", jugadores.map(j => ({ id: j.id, nombre: j.nombre, numero: j.numero, tipo: typeof j.numero })));
        for (const j of jugadores) {
            if (j.numero) {
                const igual = j.numero.toString() === form.numero.toString();
                console.log(
                    `Comparando con: ${j.nombre} (id:${j.id}) Nro: ${j.numero} [${typeof j.numero}] == Form: ${form.numero} [${typeof form.numero}] -->`, igual
                );
                if (
                    igual &&
                    (!modoEdicion || j.id !== initialData.id)
                ) {
                    return j;
                }
            }
        }
        return null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.posicion && form.posicionSecundaria && form.posicion === form.posicionSecundaria) {
            setAlerta({ show: true, mensaje: "La posición secundaria no puede ser igual a la principal.", tipo: "warning" });
            return;
        }
        const dup = jugadorDuplicado();
        if (dup) {
            setAlerta({ show: true, mensaje: `¡Ese número ya está asignado a: ${dup.nombre}!`, tipo: "danger" });
            return;
        }
        onSave({
            ...form,
            activo: modoEdicion && initialData.hasOwnProperty("activo") ? initialData.activo : true
        });
        setAlerta({
            show: true,
            mensaje: modoEdicion ? "¡Jugador actualizado con éxito!" : "¡Jugador agregado!",
            tipo: "success"
        });
        if (!modoEdicion) {
            setForm({
                nombre: "",
                numero: "",
                posicion: "",
                posicionSecundaria: "",
            });
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit} className="mt-1">
                <Row>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                                maxLength={40}
                                placeholder="Nombre completo"
                                autoFocus
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Número</Form.Label>
                            <Form.Control
                                name="numero"
                                value={form.numero}
                                onChange={handleChange}
                                type="number"
                                min="1"
                                placeholder="(opcional)"
                                isInvalid={!!jugadorDuplicado()}
                            />
                            <Form.Control.Feedback type="invalid">
                                {jugadorDuplicado()
                                    ? `Ya asignado a: ${jugadorDuplicado().nombre}`
                                    : "Ese número ya está en uso."}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Posición principal</Form.Label>
                            <Form.Select
                                name="posicion"
                                value={form.posicion}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar posición</option>
                                {CATEGORIAS_POSICION.map(cat => (
                                    <optgroup key={cat.categoria} label={cat.categoria}>
                                        {cat.posiciones.map(pos => (
                                            <option key={pos.value} value={pos.value}>
                                                {pos.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Posición secundaria</Form.Label>
                            <Form.Select
                                name="posicionSecundaria"
                                value={form.posicionSecundaria}
                                onChange={handleChange}
                            >
                                <option value="">(Sin secundaria)</option>
                                {CATEGORIAS_POSICION.map(cat => (
                                    <optgroup key={cat.categoria} label={cat.categoria}>
                                        {cat.posiciones
                                            .filter(pos => pos.value !== form.posicion)
                                            .map(pos => (
                                                <option key={pos.value} value={pos.value}>
                                                    {pos.label}
                                                </option>
                                            ))}
                                    </optgroup>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <div className="d-flex gap-2 align-items-center mt-3">
                    <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                        {modoEdicion ? "Actualizar" : "Agregar jugador"}
                    </Button>
                    {modoEdicion && onCancel && (
                        <Button variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </Form>

            <div className="mt-3 small text-secondary">
                <b>Tip:</b> El número de camiseta es opcional. Para equipos donde los números cambian seguido, podés dejarlo vacío y solo asignar números en partidos o planillas puntuales.
            </div>

            <AlertaFlotante
                show={alerta.show}
                mensaje={alerta.mensaje}
                tipo={alerta.tipo}
                onClose={() => setAlerta({ ...alerta, show: false })}
            />
        </>
    );
}
