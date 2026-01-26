import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function generatePdfFromLetter(letterContent: string): Promise<Buffer> {
  const doc = new jsPDF();

  // Set fonts and styles
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  // Add content
  doc.text(letterContent, 10, 10);

  // Save the PDF to a buffer
  const pdfBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfBuffer);
}
