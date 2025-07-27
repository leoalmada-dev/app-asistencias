import { useState, useRef } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { obtenerEquipos, obtenerJugadores, obtenerEntrenamientos, obtenerPartidos } from "../hooks/useDB";
import db from "../db/indexedDB";

export default function Backup() {
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);

  // Exportar datos a JSON
  const exportarDatos = async () => {
    const data = {
      equipos: await obtenerEquipos(),
      jugadores: await obtenerJugadores(),
      entrenamientos: await obtenerEntrenamientos(),
      partidos: await obtenerPartidos(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-futbol-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Al seleccionar archivo, abrimos el modal
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileToImport(file);
    setShowModal(true);
  };

  // Confirmación final del modal
  const confirmarImportacion = () => {
    if (!fileToImport) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result);

        if (!data.equipos || !data.jugadores || !data.entrenamientos || !data.partidos) {
          alert("El archivo no tiene el formato correcto.");
          setShowModal(false);
          return;
        }

        await db.transaction("rw", db.equipos, db.jugadores, db.entrenamientos, db.partidos, async () => {
          await db.equipos.clear();
          await db.jugadores.clear();
          await db.entrenamientos.clear();
          await db.partidos.clear();

          await db.equipos.bulkAdd(data.equipos);
          await db.jugadores.bulkAdd(data.jugadores);
          await db.entrenamientos.bulkAdd(data.entrenamientos);
          await db.partidos.bulkAdd(data.partidos);
        });
        setShowModal(false);
        alert("Datos importados correctamente.");
        window.location.reload();
      } catch (err) {
        alert("Error importando el archivo. ¿Es un backup válido?");
        setShowModal(false);
        console.error(err);
      }
    };
    reader.readAsText(fileToImport);
  };

  return (
    <div className="mb-4">
      <h5>Backup y Restauración</h5>
      <Button variant="success" className="me-3" onClick={exportarDatos}>
        Exportar backup (.json)
      </Button>
      <Form.Label htmlFor="importar-json" className="btn btn-primary mb-0">
        Importar backup (.json)
        <Form.Control
          type="file"
          accept="application/json"
          id="importar-json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileChange}
        />
      </Form.Label>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar importación de backup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>⚠️ ¡Advertencia!</strong><br />
            Esta acción <b>reemplazará TODOS los datos actuales</b> de la aplicación por los datos del backup seleccionado.<br />
            <span style={{ color: "crimson" }}>Esta acción no se puede deshacer.</span>
          </p>
          <p>
            ¿Seguro que deseas continuar?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarImportacion}>
            Sí, importar backup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
