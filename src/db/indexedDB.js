// src/db/indexedDB.js
import Dexie from 'dexie';

const db = new Dexie('AsistenciasFutbolDB');

// Definimos las tablas y los índices
db.version(1).stores({
  jugadores: '++id, nombre, numero, categoria, posicion, activo',
  entrenamientos: '++id, fecha, hora, lugar',
  partidos: '++id, fecha, tipo, torneo, rival',
  asistencias: '++id, entrenamientoId, jugadorId, presente',
  participaciones: '++id, partidoId, jugadorId, minutoEntrada, minutoSalida',
  cambios: '++id, partidoId, entra, sale, minuto'
});

db.version(2).stores({
  equipos: '++id, nombre',
  jugadores: '++id, nombre, numero, posicion, activo, equipoId',
  entrenamientos: '++id, fecha, hora, lugar, equipoId',
  partidos: '++id, fecha, tipo, torneo, rival, equipoId',
  asistencias: '++id, entrenamientoId, jugadorId, presente',
  participaciones: '++id, partidoId, jugadorId, minutoEntrada, minutoSalida',
  cambios: '++id, partidoId, entra, sale, minuto'
});

db.version(3).stores({
  equipos: '++id, nombre',
  jugadores: '++id, nombre, numero, posicion, activo, equipoId',
  entrenamientos: '++id, fecha, hora, lugar, equipoId',
  partidos: '++id, fecha, tipo, torneo, rival, equipoId, campeonatoId', // Agregamos campeonatoId
  campeonatos: '++id, nombre, anio, equipoId, activo',
  asistencias: '++id, entrenamientoId, jugadorId, presente',
  participaciones: '++id, partidoId, jugadorId, minutoEntrada, minutoSalida',
  cambios: '++id, partidoId, entra, sale, minuto'
});

export default db;
