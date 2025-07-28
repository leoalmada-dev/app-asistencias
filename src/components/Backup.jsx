import { useState, useRef } from "react";
import { Button, Form, Modal, Alert } from "react-bootstrap";
import { FaDownload, FaUpload } from "react-icons/fa6";
import { obtenerEquipos, obtenerJugadores, obtenerEntrenamientos, obtenerPartidos } from "../hooks/useDB";
import db from "../db/indexedDB";
import AlertaFlotante from "../components/AlertaFlotante";

export default function Backup() {
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);
  const [importing, setImporting] = useState(false);
  const [alerta, setAlerta] = useState({ show: false, mensaje: "", tipo: "success" });

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
    setAlerta({ show: true, mensaje: "Backup exportado correctamente.", tipo: "success" });
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
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result);

        if (!data.equipos || !data.jugadores || !data.entrenamientos || !data.partidos) {
          setShowModal(false);
          setAlerta({ show: true, mensaje: "El archivo no tiene el formato correcto.", tipo: "danger" });
          setImporting(false);
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
        setImporting(false);
        setAlerta({ show: true, mensaje: "¡Datos importados correctamente! Refrescá la página para ver los cambios.", tipo: "success" });
        // window.location.reload(); // Dejá esto comentado, así no recarga forzado
      } catch (err) {
        setShowModal(false);
        setImporting(false);
        setAlerta({ show: true, mensaje: "Error importando el archivo. ¿Es un backup válido?", tipo: "danger" });
        console.error(err);
      }
    };
    reader.readAsText(fileToImport);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Backup y Restauración</h3>
      <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
        <Button variant="success" className="d-flex align-items-center" onClick={exportarDatos}>
          <FaDownload className="me-2" /> Exportar backup (.json)
        </Button>
        <Form.Label htmlFor="importar-json" className="btn btn-primary mb-0 d-flex align-items-center">
          <FaUpload className="me-2" /> Importar backup (.json)
          <Form.Control
            type="file"
            accept="application/json"
            id="importar-json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onFileChange}
          />
        </Form.Label>
      </div>

      <Alert variant="info" className="mb-3">
        <b>¿Cómo funciona?</b> Exportá tus datos como respaldo o importá un backup anterior.<br />
        <b>¡Precaución!</b> La importación reemplaza todos los datos existentes.
      </Alert>

      <Modal show={showModal} onHide={() => { setShowModal(false); setFileToImport(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar importación de backup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>⚠️ ¡Advertencia!</strong><br />
            Esta acción <b>reemplazará TODOS los datos actuales</b> de la aplicación por los datos del backup seleccionado.<br />
            <span style={{ color: "crimson" }}>Esta acción no se puede deshacer.</span>
          </p>
          {fileToImport && (
            <div className="border rounded p-2 mb-2 small bg-light">
              <b>Archivo seleccionado:</b><br />
              <span className="text-secondary">{fileToImport.name}</span> <span className="ms-2">({Math.round(fileToImport.size / 1024)} KB)</span>
            </div>
          )}
          <p className="mb-0">
            ¿Seguro que deseas continuar?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setFileToImport(null); }} disabled={importing}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarImportacion} disabled={importing}>
            {importing ? "Importando..." : "Sí, importar backup"}
          </Button>
        </Modal.Footer>
      </Modal>

      <AlertaFlotante
        show={alerta.show}
        mensaje={alerta.mensaje}
        tipo={alerta.tipo}
        onClose={() => setAlerta(a => ({ ...a, show: false }))}
        ms={2500}
      />
    </div>
  );
}
