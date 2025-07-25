// src/hooks/useDB.js
import db from '../db/indexedDB';

// ─── Jugadores ─────────────────────
export const obtenerJugadores = async () => await db.jugadores.toArray();

export const agregarJugador = async (jugador) => {
  return await db.jugadores.add(jugador);
};

export const actualizarJugador = async (id, jugador) => {
  return await db.jugadores.update(id, jugador);
};

export const eliminarJugador = async (id) => {
  return await db.jugadores.delete(id);
};

// ─── Prácticas ─────────────────────
export const obtenerPracticas = async () => await db.practicas.toArray();

export const agregarPractica = async (practica) => {
  return await db.practicas.add(practica);
};

export const actualizarPractica = async (id, practica) => {
  return await db.practicas.update(id, practica);
};

export const eliminarPractica = async (id) => {
  return await db.practicas.delete(id);
};

// ─── Partidos ─────────────────────
export const obtenerPartidos = async () => await db.partidos.toArray();

export const agregarPartido = async (partido) => {
  return await db.partidos.add(partido);
};

export const actualizarPartido = async (id, partido) => {
  return await db.partidos.update(id, partido);
};

export const eliminarPartido = async (id) => {
  return await db.partidos.delete(id);
};

// ─── Equipos ─────────────────────
export const obtenerEquipos = async () => await db.equipos.toArray();

export const agregarEquipo = async (equipo) => await db.equipos.add(equipo);

export const actualizarEquipo = async (id, equipo) => await db.equipos.update(id, equipo);

export const eliminarEquipo = async (id) => await db.equipos.delete(id);

