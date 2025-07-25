import { createContext, useContext, useEffect, useState } from "react";
import { obtenerEquipos } from "../hooks/useDB";

const EquipoContext = createContext();

export function EquipoProvider({ children }) {
    const [equipos, setEquipos] = useState([]);
    const [equipoId, setEquipoId] = useState(null);

    const cargarEquipos = async () => {
        const lista = await obtenerEquipos();
        setEquipos(lista);
        // Opcional: setea el equipoId al primero si no hay uno seleccionado
        if (lista.length > 0 && !equipoId) setEquipoId(lista[0].id);
    };

    useEffect(() => {
        cargarEquipos();
    }, []);

    return (
        <EquipoContext.Provider value={{
            equipos,
            setEquipos,
            equipoId,
            setEquipoId,
            cargarEquipos
        }}>
            {children}
        </EquipoContext.Provider>
    );
}

export function useEquipo() {
    return useContext(EquipoContext);
}
