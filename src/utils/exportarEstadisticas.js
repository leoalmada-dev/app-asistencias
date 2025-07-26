import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportarEstadisticasAExcel({
    datosTabla,
    nombreArchivo = "Estadisticas",
    titulo = "",
    // otros props
}) {
    // 1. Crea worksheet y workbook
    const ws = XLSX.utils.json_to_sheet(datosTabla, { origin: "A2" });
    const wb = XLSX.utils.book_new();

    // 2. Agrega título si hay
    if (titulo) {
        XLSX.utils.sheet_add_aoa(ws, [[titulo]], { origin: "A1" });
    }

    // 3. (Opcional) Dale formato a la celda A1 para que sea grande/negrita

    // 4. Arma workbook y guarda
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(
        new Blob([buf], { type: "application/octet-stream" }),
        `${nombreArchivo}.xlsx`
    );
}
