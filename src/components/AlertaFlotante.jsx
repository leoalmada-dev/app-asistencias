// src/components/AlertaFlotante.jsx
import { useEffect } from "react";
import { Alert } from "react-bootstrap";

export default function AlertaFlotante({ show, mensaje, tipo = "success", onClose, ms = 2200 }) {
    useEffect(() => {
        if (!show || !onClose) return;
        const t = setTimeout(onClose, ms);
        return () => clearTimeout(t);
    }, [show, onClose, ms]);

    if (!show) return null;

    return (
        <Alert
            variant={tipo}
            className="position-fixed shadow"
            style={{
                top: 16,
                right: 16,
                minWidth: 280,
                zIndex: 1050,
                opacity: 0.97
            }}
            onClose={onClose}
            dismissible
        >
            {mensaje}
        </Alert>
    );
}
