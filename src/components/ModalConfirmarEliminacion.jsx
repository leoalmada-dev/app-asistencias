// src/components/ModalConfirmarEliminacion.jsx
import { Modal, Button } from "react-bootstrap";

export default function ModalConfirmarEliminacion({
    show,
    onHide,
    onConfirm,
    nombre = "el ítem",
    loading = false,
    tipo = "equipo/categoría"
}) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar {tipo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    ¿Estás seguro de que deseas eliminar <b>{nombre}</b>?
                </p>
                <p className="text-danger mb-0">
                    Esta acción <b>NO</b> se puede deshacer. Todos los jugadores, entrenamientos y partidos asociados también se perderán.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Eliminando..." : "Eliminar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
