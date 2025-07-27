import { CATEGORIAS_POSICION } from "../data/posiciones";

export function getPosData(value) {
  for (const cat of CATEGORIAS_POSICION) {
    const pos = cat.posiciones.find(p => p.value === value);
    if (pos) return pos;
  }
  return null;
}
