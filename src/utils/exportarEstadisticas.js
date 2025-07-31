import * as XLSX from "xlsx-js-style";

// Paleta
const COLOR_PRINCIPAL = "239B56"; // Verde principal
const COLOR_OSCURO = "186A3B";    // Verde oscuro
const COLOR_INTERMEDIO = "27AE60";// Verde intermedio
const COLOR_CLARO = "82E0AA";     // Verde claro
const COLOR_GRIS_CLARO = "F7F9F9";

export const exportarEstadisticasAExcel = ({ datosTabla, nombreArchivo, titulo, resumen }) => {
    const workbook = XLSX.utils.book_new();

    // Construcción de filas
    const filas = [
        [titulo],
        [],
        ["Resumen"],
        ...Object.entries(resumen).map(([key, value]) => [key, value]),
        [],
        ["Datos Detallados"],
        Object.keys(datosTabla[0]),
        ...datosTabla.map(row => Object.values(row)),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(filas);

    // Combinar celdas para título
    worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: Object.keys(datosTabla[0]).length - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }
    ];

    // --- Estilos ---
    const estiloTitulo = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: COLOR_OSCURO } },
        alignment: { vertical: "center", horizontal: "center" }
    };

    const estiloResumen = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: COLOR_CLARO } },
        alignment: { horizontal: "left" },
        border: {
            bottom: { style: "thin", color: { rgb: COLOR_INTERMEDIO } },
            top: { style: "thin", color: { rgb: COLOR_INTERMEDIO } },
            left: { style: "thin", color: { rgb: COLOR_INTERMEDIO } },
            right: { style: "thin", color: { rgb: COLOR_INTERMEDIO } }
        }
    };

    const estiloResumenValor = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: COLOR_CLARO } },
        alignment: { horizontal: "center" },
        border: {
            bottom: { style: "thin", color: { rgb: COLOR_INTERMEDIO } },
            top: { style: "thin", color: { rgb: COLOR_INTERMEDIO } },
            left: { style: "thin", color: { rgb: COLOR_INTERMEDIO } },
            right: { style: "thin", color: { rgb: COLOR_INTERMEDIO } }
        }
    };

    const estiloEncabezado = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill: { fgColor: { rgb: COLOR_PRINCIPAL } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            bottom: { style: "thin", color: { rgb: COLOR_OSCURO } },
            top: { style: "thin", color: { rgb: COLOR_OSCURO } },
            left: { style: "thin", color: { rgb: COLOR_OSCURO } },
            right: { style: "thin", color: { rgb: COLOR_OSCURO } }
        }
    };

    const estiloCelda = {
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            bottom: { style: "thin", color: { rgb: "BBBBBB" } },
            top: { style: "thin", color: { rgb: "BBBBBB" } },
            left: { style: "thin", color: { rgb: "BBBBBB" } },
            right: { style: "thin", color: { rgb: "BBBBBB" } }
        }
    };

    // Estilos para filas alternas
    const estiloCeldaImpar = {
        ...estiloCelda,
        fill: { fgColor: { rgb: COLOR_GRIS_CLARO } }
    };
    const estiloCeldaPar = {
        ...estiloCelda,
        fill: { fgColor: { rgb: "FFFFFF" } }
    };

    // --- Aplicar estilos ---

    // Título principal
    worksheet["A1"].s = estiloTitulo;

    // Resumen
    const inicioResumen = 3;
    Object.entries(resumen).forEach((_, idx) => {
        worksheet[`A${inicioResumen + idx + 1}`].s = estiloResumen;
        worksheet[`B${inicioResumen + idx + 1}`].s = estiloResumenValor;
    });

    // Encabezado tabla
    const encabezadoRow = filas.findIndex(f => f[0] === "Datos Detallados") + 1;
    Object.keys(datosTabla[0]).forEach((_, idx) => {
        const celda = XLSX.utils.encode_cell({ r: encabezadoRow, c: idx });
        worksheet[celda].s = estiloEncabezado;
    });

    // Celdas de la tabla
    datosTabla.forEach((_, filaIdx) => {
        Object.keys(datosTabla[0]).forEach((_, colIdx) => {
            const celda = XLSX.utils.encode_cell({ r: encabezadoRow + 1 + filaIdx, c: colIdx });
            worksheet[celda].s = (filaIdx % 2 === 0) ? estiloCeldaPar : estiloCeldaImpar;
        });
    });

    // Ajuste automático de columnas
    worksheet["!cols"] = Object.keys(datosTabla[0]).map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, "Estadísticas");
    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
};
