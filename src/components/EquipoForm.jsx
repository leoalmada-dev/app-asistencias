import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function EquipoForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel
}) {
    const [nombre, setNombre] = useState("");

    useEffect(() => {
        setNombre(initialData?.nombre || "");
    }, [initialData, modoEdicion]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) return alert("El nombre es obligatorio.");
        onSave({ nombre: nombre.trim() });
        if (!modoEdicion) setNombre("");
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
            <div className="d-flex gap-2 align-items-center mt-3">
                <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
                    {modoEdicion ? "Actualizar" : "Crear"}
                </Button>
                {modoEdicion && onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancelar edición
                    </Button>
                )}
            </div>
        </Form>
    );
}
