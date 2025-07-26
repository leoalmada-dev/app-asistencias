import html2canvas from "html2canvas";

export function exportarGraficoComoPNG(ref, nombreArchivo = "grafico") {
    if (ref?.current) {
        html2canvas(ref.current, { backgroundColor: "#fff" }).then(canvas => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${nombreArchivo}.png`;
            link.click();
        });
    }
}
