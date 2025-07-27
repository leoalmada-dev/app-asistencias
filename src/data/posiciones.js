// Puedes adaptar colores/nombres según tu gusto o los de tu club
export const CATEGORIAS_POSICION = [
  {
    categoria: "Portero",
    color: "purple",
    posiciones: [
      { value: "PT", label: "Portero", color: "secondary" } // o "purple" si agregás tu color personalizado
    ]
  },
  {
    categoria: "Defensas",
    color: "primary",
    posiciones: [
      { value: "DC", label: "Defensa central", color: "primary" },
      { value: "LD", label: "Lateral derecho", color: "primary" },
      { value: "LI", label: "Lateral izquierdo", color: "primary" }
    ]
  },
  {
    categoria: "Centrocampistas",
    color: "success",
    posiciones: [
      { value: "MP", label: "MediaPunta", color: "success" },
      { value: "MC", label: "MedioCentro", color: "success" },
      { value: "ID", label: "Interior Derecho", color: "success" },
      { value: "II", label: "Interior Izquierdo", color: "success" },
      { value: "MCD", label: "MedioCampo Defensivo", color: "success" }
    ]
  },
  {
    categoria: "Delanteros",
    color: "danger",
    posiciones: [
      { value: "SP", label: "Segundo Punta", color: "danger" },
      { value: "CD", label: "Centro Delantero", color: "danger" },
      { value: "ED", label: "Extremo Derecho", color: "danger" },
      { value: "EI", label: "Extremo Izquierdo", color: "danger" }
    ]
  }
];
