// src/components/JugadorForm.jsx
import { Form, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function JugadorForm({ onSave, initialData = {}, modoEdicion = false }) {
  const [form, setForm] = useState({
    nombre: "",
    numero: "",
    categoria: "",
    posicion: "",
    activo: true,
  });

  useEffect(() => {
    if (initialData) setForm({ ...form, ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre) return alert("El nombre es obligatorio.");
    onSave(form);
    setForm({ nombre: "", numero: "", categoria: "", posicion: "", activo: true });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group className="mb-3">
            <Form.Label>Número</Form.Label>
            <Form.Control name="numero" type="number" value={form.numero} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Control name="categoria" value={form.categoria} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Posición</Form.Label>
            <Form.Control name="posicion" value={form.posicion} onChange={handleChange} />
          </Form.Group>
        </Col>
      </Row>
      <Form.Check
        type="checkbox"
        name="activo"
        label="Jugador activo"
        checked={form.activo}
        onChange={handleChange}
        className="mb-3"
      />
      <Button type="submit" variant={modoEdicion ? "warning" : "primary"}>
        {modoEdicion ? "Actualizar" : "Agregar"}
      </Button>
    </Form>
  );
}
