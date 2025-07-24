// src/hooks/useDB.js
import db from '../db/indexedDB';

export const agregarJugador = async (jugador) => {
  try {
    const id = await db.jugadores.add(jugador);
    return id;
  } catch (error) {
    console.error("Error agregando jugador:", error);
  }
};

export const obtenerJugadores = async () => {
  try {
    return await db.jugadores.toArray();
  } catch (error) {
    console.error("Error obteniendo jugadores:", error);
    return [];
  }
};
