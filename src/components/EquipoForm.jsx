import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

const MAX_CHARS = 32;

export default function EquipoForm({
    onSave,
    initialData = {},
    modoEdicion = false,
    onCancel,
    equipos = []
}) {
    const [nombre, setNombre] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setNombre(initialData?.nombre || "");
        setError("");
    }, [initialData, modoEdicion]);

    const handleChange = (e) => {
        const value = e.target.value.slice(0, MAX_CHARS);
        setNombre(value);
        setError(""); // Limpiar error al escribir
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        const existe = equipos.find(eq =>
            eq.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
            (!modoEdicion || eq.id !== initialData.id)
        );
        if (existe) {
            setError(`Ya existe un equipo/categoría con ese nombre (${existe.nombre}).`);
            return;
        }
        onSave({ nombre: nombre.trim() });
        if (!modoEdicion) setNombre("");
        setError("");
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-3">
            <fieldset className={`rounded p-3 ${modoEdicion ? "border border-warning" : "border"}`}>
                <legend className="float-none w-auto px-2 fs-5 mb-0">
                    {modoEdicion ? "Editar equipo/categoría" : "Nuevo equipo/categoría"}
                </legend>
                <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        value={nombre}
                        onChange={handleChange}
                        placeholder="Ej: 2014, 2015, Sub-14, Femenino, etc."
                        autoFocus
                        maxLength={MAX_CHARS}
                        isInvalid={!!error}
                    />
                    <Form.Text muted>
                        {nombre.length}/{MAX_CHARS} caracteres
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
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
                <div className="text-secondary small mt-2">
                    <b>Tip:</b> Al crear un equipo o categoría, se seleccionará automáticamente como equipo activo en toda la aplicación. Podrás asignarle jugadores, campeonatos y partidos. El equipo seleccionado actual se muestra arriba a la derecha.
                </div>
            </fieldset>
        </Form>
    );
}
