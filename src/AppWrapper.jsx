import { useEffect, useState } from "react";
import { obtenerEquipos } from "./hooks/useDB";
import { useEquipo } from "./context/EquipoContext";
import Equipos from "./pages/Equipos";

function AppWrapper({ children }) {
  const [equipos, setEquipos] = useState([]);
  const { equipoId, setEquipoId } = useEquipo();

  useEffect(() => {
    obtenerEquipos().then((lista) => {
      setEquipos(lista);

      // Si no hay equipo seleccionado, pero existen equipos, seleccioná el primero
      if (!equipoId && lista.length > 0) {
        setEquipoId(lista[0].id);
      }
    });
  }, [equipoId, setEquipoId]);

  // Si no hay equipos, forzá al usuario a crearlos
  if (equipos.length === 0) {
    return (
      <div className="container py-5">
        <h4>Debes crear al menos un equipo para comenzar a usar el sistema</h4>
        <Equipos />
      </div>
    );
  }

  return <>{children}</>;
}

export default AppWrapper;
