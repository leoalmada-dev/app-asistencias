import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ejemplo de la firma de la función
export const exportarEstadisticasAExcel = ({ datosTabla, nombreArchivo, titulo, resumen }) => {
    const workbook = XLSX.utils.book_new();

    // Resumen inicial
    const filasResumen = [
        [titulo],
        [],
        ["Resumen"],
        ...Object.entries(resumen).map(([key, value]) => [key, value]),
        [],
        ["Datos Detallados"],
        Object.keys(datosTabla[0]),
        ...datosTabla.map(row => Object.values(row)),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(filasResumen);

    // Ajustar anchos de columna automáticamente
    const maxColumnWidths = Object.keys(datosTabla[0]).map((_, colIndex) => {
        return Math.max(
            ...filasResumen.map(row => (row[colIndex] ? row[colIndex].toString().length : 10))
        ) + 5;
    });

    worksheet["!cols"] = maxColumnWidths.map(w => ({ wch: w }));

    XLSX.utils.book_append_sheet(workbook, worksheet, "Estadísticas");
    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
};
