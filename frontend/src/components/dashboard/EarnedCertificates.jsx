import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import CertificateTemplate from '../quiz/CertificateTemplate';

const CertificateCard = ({ certificate, onDownload }) => {
  const isPrimary = certificate.type === 'primary';
  const iconColor = isPrimary ? 'text-primary' : 'text-secondary';
  const gradientLayer = isPrimary
    ? <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
    : <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #131313 25%, transparent 25%, transparent 75%, #131313 75%, #131313), linear-gradient(45deg, #131313 25%, transparent 25%, transparent 75%, #131313 75%, #131313)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>;

  return (
    <div className="bg-surface-container-high rounded-xl border-t border-l border-white/10 p-unit-md flex flex-col hover:bg-surface-container transition-colors group cursor-pointer w-full">
      <div className="w-full h-32 rounded-lg bg-surface-container-lowest flex items-center justify-center mb-unit-md relative overflow-hidden border border-white/5">
        {gradientLayer}
        <span className={`material-symbols-outlined text-4xl ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
      </div>
      <h3 className="font-headline-md text-body-lg text-on-surface font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
        {certificate.title}
      </h3>
      <p className="text-on-surface-variant font-label-sm text-label-sm mb-unit-md">
        Issued: {certificate.issueDate}
      </p>
      <button 
        onClick={() => onDownload(certificate)}
        className="mt-auto w-full flex items-center justify-center gap-2 bg-transparent border border-white/10 text-on-surface py-2 rounded-lg font-label-md text-label-md hover:border-primary hover:text-primary transition-colors group-hover:bg-primary/5 cursor-pointer">
        <span className="material-symbols-outlined text-[18px]">download</span>
        Download PDF
      </button>
    </div>
  );
};

const EarnedCertificates = ({ certificates }) => {
  const [downloadingCert, setDownloadingCert] = useState(null);
  const certRef = useRef(null);

  useEffect(() => {
    if (downloadingCert && certRef.current) {
      const processDownload = async () => {
        try {
          console.log("Starting PDF generation for:", downloadingCert.title);
          const imgData = await toPng(certRef.current, { pixelRatio: 2, fontEmbedCSS: '' });
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1280, 1122]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, 1280, 1122);
          pdf.save(`${downloadingCert.subject || 'Certificate'}.pdf`);
          console.log("PDF downloaded successfully");
        } catch (err) {
          console.error("Failed to generate PDF", err);
          alert("Failed to download the certificate: " + err.message);
        } finally {
          setDownloadingCert(null);
        }
      };
      
      // Allow React to render the template first
      setTimeout(processDownload, 100);
    }
  }, [downloadingCert]);

  if (!certificates || certificates.length === 0) return null;

  return (
    <section className="w-full relative">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-unit-md">Earned Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-md w-full">
        {certificates.map(cert => (
          <CertificateCard key={cert.id} certificate={cert} onDownload={setDownloadingCert} />
        ))}
      </div>
      
      {/* Hidden Certificate Template for downloading */}
      {downloadingCert && (
        <CertificateTemplate 
          ref={certRef}
          name={downloadingCert.name || "Student"} 
          subject={downloadingCert.subject || downloadingCert.title}
          score={downloadingCert.score || 100}
          total={downloadingCert.total || 100}
        />
      )}
    </section>
  );
};

export default EarnedCertificates;
