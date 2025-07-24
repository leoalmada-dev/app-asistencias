// src/db/indexedDB.js
import Dexie from 'dexie';

const db = new Dexie('AsistenciasFutbolDB');

// Definimos las tablas y los índices
db.version(1).stores({
  jugadores: '++id, nombre, numero, categoria, posicion, activo',
  practicas: '++id, fecha, hora, lugar',
  partidos: '++id, fecha, tipo, torneo, rival',
  asistencias: '++id, practicaId, jugadorId, presente',
  participaciones: '++id, partidoId, jugadorId, minutoEntrada, minutoSalida',
  cambios: '++id, partidoId, entra, sale, minuto'
});

export default db;
