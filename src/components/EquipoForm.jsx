// src/components/EquipoForm.jsx
import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function EquipoForm({ onSave, initialData = {}, modoEdicion = false }) {
    const [nombre, setNombre] = useState("");

    useEffect(() => {
        setNombre(initialData?.nombre || "");
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) return alert("El nombre es obligatorio.");
        onSave({ nombre: nombre.trim() });
        setNombre("");
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-3">
            <Form.Group>
                <Form.Label>Nombre del equipo/categoría</Form.Label>
                <Form.Control
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: 2014, 2015, Sub-14, Femenino, etc."
                    autoFocus
                />
            </Form.Group>
            <Button type="submit" className="mt-2" variant={modoEdicion ? "warning" : "primary"}>
                {modoEdicion ? "Actualizar" : "Crear"}
            </Button>
        </Form>
    );
}
