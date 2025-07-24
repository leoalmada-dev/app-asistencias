import { createContext, useContext, useState, useEffect } from "react";

const EquipoContext = createContext();

export const EquipoProvider = ({ children }) => {
  const stored = localStorage.getItem("equipoId");
  const [equipoId, setEquipoId] = useState(stored ? parseInt(stored) : null);

  useEffect(() => {
    if (equipoId !== null) localStorage.setItem("equipoId", equipoId);
  }, [equipoId]);

  return (
    <EquipoContext.Provider value={{ equipoId, setEquipoId }}>
      {children}
    </EquipoContext.Provider>
  );
};

export const useEquipo = () => useContext(EquipoContext);
