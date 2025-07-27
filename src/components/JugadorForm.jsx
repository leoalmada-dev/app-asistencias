import { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { CATEGORIAS_POSICION } from "../data/posiciones"; // Ya lo tienes

// Auxiliar para mapear value => label
const getPosLabel = (value) => {
    for (const cat of CATEGORIAS_POSICION) {
        const found = cat.posiciones.find(p => p.value === value);
        if (found) return found.label;
    }
    return "";
};

export default function JugadorForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel
}) {
    const [form, setForm] = useState({
        nombre: "",
        numero: "",
        posicion: "",
        posicionSecundaria: "",
        activo: true
    });

    // Autocompletar en edición
    useEffect(() => {
        if (modoEdicion && initialData) {
            setForm({
                nombre: initialData.nombre || "",
                numero: initialData.numero || "",
                posicion: initialData.posicion || "",
                posicionSecundaria: initialData.posicionSecundaria || "",
                activo: initialData.activo ?? true
            });
        } else if (!modoEdicion) {
            setForm({
                nombre: "",
                numero: "",
                posicion: "",
                posicionSecundaria: "",
                activo: true
            });
        }
    }, [initialData, modoEdicion]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // No permitir posiciones iguales
        if (form.posicion && form.posicionSecundaria && form.posicion === form.posicionSecundaria) {
            alert("La posición secundaria no puede ser igual a la principal.");
            return;
        }
        onSave(form);
        if (!modoEdicion) {
            setForm({
                nombre: "",
                numero: "",
                posicion: "",
                posicionSecundaria: "",
                activo: true
            });
        }
    };

    // Opciones para secundaria: no mostrar la seleccionada como principal
    const opcionesSecundaria = CATEGORIAS_POSICION.flatMap(cat =>
        cat.posiciones.filter(p => p.value !== form.posicion)
    );

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nro</Form.Label>
                        <Form.Control
                            name="numero"
                            value={form.numero}
                            onChange={handleChange}
                            type="number"
                            min="1"
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
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
                <Col md={3}>
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
                <Col md={1}>
                    <Form.Group className="mb-3">
                        <Form.Label>Activo</Form.Label>
                        <Form.Check
                            type="checkbox"
                            name="activo"
                            label="Sí"
                            checked={form.activo}
                            onChange={handleChange}
                        />
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
    );
}
