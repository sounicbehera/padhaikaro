import React, { forwardRef } from 'react';

const CertificateTemplate = forwardRef(({ name, subject, score, total }, ref) => {
  const percentage = Math.round((score / total) * 100);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="absolute top-0 left-0 opacity-0 pointer-events-none -z-50 overflow-hidden" style={{ width: '1280px', height: '1122px' }}>
      <div 
        ref={ref} 
        className="w-[1280px] h-[1122px] relative flex flex-col items-center justify-center text-center font-sans overflow-hidden bg-white"
      >
        {/* Background Image downloaded from Stitch */}
        <img 
          src="/assets/certificate_bg.png" 
          alt="Certificate Background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        <div className="relative z-10 w-full h-full flex flex-col items-center pt-[480px]">
          <h2 className="text-7xl font-bold text-[#1a365d] mb-[120px] font-serif uppercase tracking-widest drop-shadow-sm">{name}</h2>
          
          <h3 className="text-5xl font-bold text-[#b8860b] mb-[30px] drop-shadow-sm">{subject}</h3>
          
          <p className="text-3xl text-gray-800 font-medium bg-white/80 px-6 py-2 rounded-full shadow-sm">
            Score: <span className="font-bold text-[#1a365d]">{percentage}%</span> ({score}/{total})
          </p>

          <div className="absolute bottom-[180px] left-0 w-full px-[220px] flex justify-between items-end">
            <div className="text-center w-[280px]">
              <p className="text-3xl text-gray-800 font-semibold mb-2">{date}</p>
              <div className="h-[3px] bg-gray-800 w-full rounded-full"></div>
              <p className="text-xl text-gray-700 mt-3 uppercase tracking-widest font-semibold">Date</p>
            </div>
            <div className="text-center w-[280px]">
              <p className="text-4xl text-gray-800 font-serif italic mb-2">Padhaikaro</p>
              <div className="h-[3px] bg-gray-800 w-full rounded-full"></div>
              <p className="text-xl text-gray-700 mt-3 uppercase tracking-widest font-semibold">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
