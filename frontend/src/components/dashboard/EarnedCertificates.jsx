import React from 'react';

const CertificateCard = ({ certificate }) => {
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
      <button className="mt-auto w-full flex items-center justify-center gap-2 bg-transparent border border-white/10 text-on-surface py-2 rounded-lg font-label-md text-label-md hover:border-primary hover:text-primary transition-colors group-hover:bg-primary/5 cursor-pointer">
        <span className="material-symbols-outlined text-[18px]">download</span>
        Download PDF
      </button>
    </div>
  );
};

const EarnedCertificates = ({ certificates }) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-unit-md">Earned Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-md w-full">
        {certificates.map(cert => (
          <CertificateCard key={cert.id} certificate={cert} />
        ))}
      </div>
    </section>
  );
};

export default EarnedCertificates;
