import React, { useState, useRef, useEffect } from 'react';
import { downloadCertificatePdf } from '../../utils/certificateGenerator';
import CertificateTemplate from '../quiz/CertificateTemplate';

const CertificateCard = ({ certificate, onDownload, isDownloading }) => {
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
        onClick={() => !isDownloading && onDownload(certificate)}
        disabled={isDownloading}
        className={`mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
          isDownloading 
            ? 'bg-primary/20 text-primary border border-primary/40 cursor-not-allowed' 
            : 'bg-transparent border border-white/10 text-on-surface hover:border-primary hover:text-primary group-hover:bg-primary/5'
        }`}>
        {isDownloading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

const EarnedCertificates = ({ certificates, userName }) => {
  const [downloadingCert, setDownloadingCert] = useState(null);
  const certRef = useRef(null);

  useEffect(() => {
    if (!downloadingCert) return;

    let isMounted = true;

    const processDownload = async () => {
      try {
        console.log("Starting PDF generation for:", downloadingCert.title);
        if (!certRef.current) {
          throw new Error("Certificate template is not ready.");
        }

        const sanitizedTitle = (downloadingCert.subject || downloadingCert.title || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `PadhaiKaro_${sanitizedTitle}_Certificate.pdf`;
        await downloadCertificatePdf(certRef.current, filename);
        console.log("PDF downloaded successfully");
      } catch (err) {
        console.error("Failed to generate PDF", err);
        const errMsg = err?.message || (typeof err === 'string' ? err : 'Error generating PDF');
        alert("Failed to download the certificate: " + errMsg);
      } finally {
        if (isMounted) {
          setDownloadingCert(null);
        }
      }
    };

    // Allow React to mount/update the template element in the DOM before capturing
    const timer = setTimeout(processDownload, 120);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [downloadingCert]);

  if (!certificates || certificates.length === 0) return null;

  return (
    <section className="w-full relative">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-unit-md">Earned Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-md w-full">
        {certificates.map(cert => (
          <CertificateCard 
            key={cert.id || cert.title} 
            certificate={cert} 
            onDownload={setDownloadingCert}
            isDownloading={downloadingCert?.id === cert.id || (downloadingCert && downloadingCert.title === cert.title)} 
          />
        ))}
      </div>
      
      {/* Off-screen Certificate Template for downloading */}
      {downloadingCert && (
        <CertificateTemplate 
          ref={certRef}
          name={downloadingCert.name || userName || "Student Scholar"} 
          subject={downloadingCert.subject || downloadingCert.title}
          score={downloadingCert.score ?? 100}
          total={downloadingCert.total ?? 100}
          issueDate={downloadingCert.issueDate}
          certId={downloadingCert.id}
        />
      )}
    </section>
  );
};

export default EarnedCertificates;
