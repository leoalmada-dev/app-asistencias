const fs = require('fs');
const path = require('path');

const extensiones = ['.js', '.jsx', '.json', '.md'];
const carpetaBase = './src';

const reemplazos = [
  { de: 'prácticas', a: 'entrenamientos' },
  { de: 'practicas', a: 'entrenamientos' },
  { de: 'Prácticas', a: 'Entrenamientos' },
  { de: 'Practicas', a: 'Entrenamientos' },
  { de: 'práctica', a: 'entrenamiento' },
  { de: 'practica', a: 'entrenamiento' },
  { de: 'Práctica', a: 'Entrenamiento' },
  { de: 'Practica', a: 'Entrenamiento' },
];

function recorrerCarpeta(carpeta) {
  fs.readdirSync(carpeta).forEach((archivo) => {
    const rutaCompleta = path.join(carpeta, archivo);
    const stats = fs.statSync(rutaCompleta);

    if (stats.isDirectory()) {
      recorrerCarpeta(rutaCompleta);
    } else if (extensiones.includes(path.extname(archivo))) {
      reemplazarEnArchivo(rutaCompleta);
    }
  });
}

function reemplazarEnArchivo(ruta) {
  let contenido = fs.readFileSync(ruta, 'utf8');
  let modificado = false;

  reemplazos.forEach(({ de, a }) => {
    const regex = new RegExp(de, 'g');
    if (regex.test(contenido)) {
      contenido = contenido.replace(regex, a);
      modificado = true;
    }
  });

  if (modificado) {
    fs.writeFileSync(ruta, contenido, 'utf8');
    console.log(`✔ Modificado: ${ruta}`);
  }
}

// Ejecutar
recorrerCarpeta(carpetaBase);
