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
      { value: "DC", label: "Defensa Central", color: "primary" },
      { value: "DCD", label: "Defensa Central Derecho", color: "primary" },
      { value: "DCI", label: "Defensa Central Izquierdo", color: "primary" },
      { value: "LD", label: "Lateral Derecho", color: "primary" },
      { value: "LI", label: "Lateral Izquierdo", color: "primary" }
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
      { value: "VD", label: "Volante Derecho", color: "success" },
      { value: "VI", label: "Volante Izquierdo", color: "success" },
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
