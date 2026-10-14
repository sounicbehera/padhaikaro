import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a high-fidelity PDF certificate
 * @param {HTMLElement} element - The DOM element containing the certificate
 * @param {string} filename - The filename to save as
 * @returns {Promise<void>}
 */
export async function downloadCertificatePdf(element, filename = 'Certificate.pdf') {
  if (!element) {
    throw new Error('Certificate template element is not ready.');
  }

  // 1. Wait for any images inside the template to fully load
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  );

  // Slight tick for layout reflow
  await new Promise((r) => setTimeout(r, 60));

  let imgData = null;

  try {
    // Primary renderer: html2canvas with 2x scale for sharp print quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fdfbf7',
      logging: false,
      width: 1200,
      height: 848,
      windowWidth: 1200,
      windowHeight: 848,
      scrollX: 0,
      scrollY: 0
    });

    imgData = canvas.toDataURL('image/png', 1.0);
  } catch (canvasErr) {
    console.warn('html2canvas failed, attempting html-to-image fallback:', canvasErr);
    // Fallback renderer: html-to-image
    const { toPng } = await import('html-to-image');
    imgData = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#fdfbf7',
      width: 1200,
      height: 848
    });
  }

  if (!imgData) {
    throw new Error('Failed to generate certificate image.');
  }

  // Create standard A4 Landscape PDF (297mm x 210mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Exactly fit A4 Landscape dimensions without borders or margins
  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');

  // Trigger browser download
  pdf.save(filename);
}
