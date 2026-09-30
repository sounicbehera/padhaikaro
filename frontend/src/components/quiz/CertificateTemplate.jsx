import React, { forwardRef } from 'react';

const CertificateTemplate = forwardRef(({ name, subject, score, total }, ref) => {
  const percentage = Math.round((score / total) * 100);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="absolute left-[-9999px] top-[-9999px]">
      <div 
        ref={ref} 
        className="bg-white w-[800px] h-[600px] p-12 border-[16px] border-[#1a365d] flex flex-col items-center justify-center text-center font-sans"
      >
        <div className="border-[4px] border-solid border-gray-200 w-full h-full p-8 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-[#1a365d] mb-4 font-serif uppercase tracking-wider">Certificate of Completion</h1>
          <p className="text-xl text-gray-600 mb-8 italic">This is to certify that</p>
          <h2 className="text-4xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-gray-300 w-3/4">{name}</h2>
          <p className="text-xl text-gray-600 mb-4">has successfully completed the assessment for</p>
          <h3 className="text-3xl font-bold text-[#2b6cb0] mb-8">{subject} Certification</h3>
          <p className="text-lg text-gray-700 mb-12">
            Achieving a score of <span className="font-bold">{percentage}%</span> ({score}/{total})
          </p>
          <div className="flex justify-between w-full px-12 mt-auto">
            <div className="text-left">
              <p className="border-t-2 border-gray-800 w-40 text-center pt-2 font-semibold">Date</p>
              <p className="text-center">{date}</p>
            </div>
            <div className="text-right">
              <p className="border-t-2 border-gray-800 w-40 text-center pt-2 font-semibold">Instructor Signature</p>
              <p className="text-center font-cursive text-xl">LMS Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
