import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import logoDucky from '../assets/logo-ducky.png';
import { folioEjemplar, textoUbicacion } from '../utils/formato';
import type { LibroConEjemplares } from './listado.service';

export const NOMBRE_PDF = 'Listado de libros.pdf';

// Colores del Design System (tokens.css) en RGB para jsPDF
const NAVY: [number, number, number] = [0, 82, 140];
const ORO: [number, number, number] = [182, 120, 0];
const GRIS: [number, number, number] = [95, 95, 95];

/** Línea de datos del libro, igual que en la vista previa del prototipo. */
export function detalleLibro({ libro }: LibroConEjemplares): string {
  return [
    libro.autores.map((a) => a.nombre).join(', '),
    `ISBN ${libro.isbn}`,
    libro.editorial,
    libro.anio,
    libro.idioma,
    libro.temas.length ? `Tema: ${libro.temas.map((t) => t.nombre).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

async function cargarImagen(url: string): Promise<string> {
  const respuesta = await fetch(url);
  const blob = await respuesta.blob();
  return new Promise((resolver) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result as string);
    lector.readAsDataURL(blob);
  });
}

/** Genera el PDF "Listado de libros" (encabezado, criterio, fecha y un bloque por libro). */
export async function generarPdfListado(listado: LibroConEjemplares[], encabezado: string): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margen = 40;
  const ancho = doc.internal.pageSize.getWidth() - margen * 2;

  doc.addImage(await cargarImagen(logoDucky), 'PNG', margen, margen, 36, 36);
  doc
    .setFontSize(8)
    .setTextColor(...ORO)
    .text('Universidad Ducky · Biblioteca', margen + 46, margen + 12);
  doc.setFontSize(16).setTextColor(26, 26, 26).setFont('helvetica', 'bold');
  doc.text('Listado de libros', margen + 46, margen + 30);
  doc
    .setFont('helvetica', 'normal')
    .setFontSize(8)
    .setTextColor(...GRIS);
  doc.text(doc.splitTextToSize(encabezado, ancho), margen, margen + 56);

  let y = margen + 80;
  for (const item of listado) {
    if (y > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      y = margen;
    }
    doc
      .setFont('helvetica', 'bold')
      .setFontSize(11)
      .setTextColor(26, 26, 26)
      .text(item.libro.titulo, margen, y);
    const detalle = doc.splitTextToSize(detalleLibro(item), ancho);
    doc
      .setFont('helvetica', 'normal')
      .setFontSize(8)
      .setTextColor(...GRIS)
      .text(detalle, margen, y + 13);
    y += 13 + detalle.length * 10;

    if (item.ejemplares.length === 0) {
      doc.setTextColor(...ORO).text('Sin ejemplares registrados', margen, y + 4);
      y += 26;
      continue;
    }
    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      head: [['Ejemplar', 'Estado', 'Modalidad', 'Ubicación']],
      body: item.ejemplares.map((e) => [
        folioEjemplar(e.idEjemplar),
        e.estado,
        e.modalidad,
        textoUbicacion(e),
      ]),
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: NAVY },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }
  return doc.output('blob');
}

async function aBase64(blob: Blob): Promise<string> {
  const dataUrl = await cargarImagen(URL.createObjectURL(blob));
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/** "148 KB" */
export const tamanoLegible = (blob: Blob): string => `${Math.max(Math.round(blob.size / 1024), 1)} KB`;

/**
 * Guarda el PDF: en Android, en la carpeta Documentos del teléfono;
 * en el navegador, como descarga normal (carpeta Descargas).
 */
export async function descargarPdf(blob: Blob): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: NOMBRE_PDF,
      data: await aBase64(blob),
      directory: Directory.Documents,
      recursive: true,
    });
    return;
  }
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = NOMBRE_PDF;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

/**
 * Abre la hoja para compartir del sistema con el PDF adjunto (WhatsApp, correo, Drive…).
 * Devuelve false si el navegador no permite compartir archivos; en ese caso se descarga.
 */
export async function compartirPdf(blob: Blob): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: NOMBRE_PDF,
      data: await aBase64(blob),
      directory: Directory.Cache,
    });
    await Share.share({ title: 'Listado de libros', files: [uri] });
    return true;
  }
  const archivo = new File([blob], NOMBRE_PDF, { type: 'application/pdf' });
  if (navigator.canShare?.({ files: [archivo] })) {
    await navigator.share({ title: 'Listado de libros', files: [archivo] });
    return true;
  }
  await descargarPdf(blob);
  return false;
}

/**
 * Imprime el listado: en el navegador abre el diálogo de impresión (la hoja de vista previa
 * tiene estilos de impresión); en Android, que no tiene diálogo de impresión web, abre la hoja
 * de compartir con el PDF para enviarlo a una impresora o app.
 */
export async function imprimirListado(blob: Blob): Promise<void> {
  if (Capacitor.isNativePlatform()) await compartirPdf(blob);
  else window.print();
}
