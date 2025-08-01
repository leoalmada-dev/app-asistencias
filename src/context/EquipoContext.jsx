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

    const actualizarConfigEquipo = async (idEquipo, nuevaConfig) => {
        // Buscá el equipo y actualizá solo la config
        setEquipos(prev =>
            prev.map(e => e.id === idEquipo
                ? { ...e, configPartidos: { ...e.configPartidos, ...nuevaConfig } }
                : e
            )
        );
        // Guardalo en tu DB también si lo necesitas (opcional)
        // await actualizarEquipo(idEquipo, { configPartidos: { ...nuevaConfig } });
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
            cargarEquipos,
            actualizarConfigEquipo,
        }}>
            {children}
        </EquipoContext.Provider>
    );
}

export function useEquipo() {
    return useContext(EquipoContext);
}
