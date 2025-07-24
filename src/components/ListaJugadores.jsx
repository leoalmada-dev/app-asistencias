import React, { useState, useEffect } from 'react';
import { agregarJugador, obtenerJugadores } from '../hooks/useDB';

export default function ListaJugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    cargarJugadores();
  }, []);

  const cargarJugadores = async () => {
    const datos = await obtenerJugadores();
    setJugadores(datos);
  };

  const handleAgregar = async () => {
    if (nombre.trim()) {
      await agregarJugador({ nombre, numero: 0, categoria: '', posicion: '', activo: true });
      setNombre('');
      cargarJugadores();
    }
  };

  return (
    <div className="container mt-4">
      <h3>Jugadores</h3>
      <div className="input-group mb-3">
        <input value={nombre} onChange={e => setNombre(e.target.value)} className="form-control" />
        <button onClick={handleAgregar} className="btn btn-primary">Agregar</button>
      </div>
      <ul className="list-group">
        {jugadores.map(j => (
          <li key={j.id} className="list-group-item">
            {j.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
