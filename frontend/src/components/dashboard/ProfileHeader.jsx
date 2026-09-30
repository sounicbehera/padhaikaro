import React, { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UPLOAD_AVATAR, GET_DASHBOARD_DATA } from '../../graphql/dashboardQueries';

const ProfileHeader = ({ userData }) => {
  const fileInputRef = useRef(null);
  const [uploadAvatar, { loading }] = useMutation(UPLOAD_AVATAR, {
    refetchQueries: [{ query: GET_DASHBOARD_DATA }]
  });
  const [uploadError, setUploadError] = useState('');

  if (!userData) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        setUploadError('');
        await uploadAvatar({ variables: { base64Image: reader.result } });
      } catch (err) {
        setUploadError('Failed to upload image');
      }
    };
    reader.onerror = () => setUploadError('Failed to read file');
  };

  return (
    <section className="bg-surface-container-high rounded-xl border-t border-l border-white/10 p-unit-lg flex flex-col md:flex-row items-center md:items-start gap-unit-lg relative overflow-hidden shadow-[0px_20px_40px_rgba(0,0,0,0.3)]">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative group z-10 cursor-pointer" onClick={() => !loading && fileInputRef.current.click()}>
        <img 
          alt={`${userData.name} Profile Picture`} 
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface object-cover ${loading ? 'opacity-50' : 'group-hover:opacity-80 transition-opacity'}`} 
          src={userData.avatar || "https://ui-avatars.com/api/?name=" + userData.name} 
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-unit-xs">
          {userData.name}
        </h1>
        {uploadError && <p className="text-error text-sm mb-2">{uploadError}</p>}
        
        {/* Scholar status removed */}
        
        <div className="w-full bg-surface-container-lowest rounded-lg p-unit-md border border-white/5 flex items-center justify-between mt-auto">
          <div>
            <div className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Total Points</div>
            <div className="font-headline-md text-headline-md text-primary mt-1">
              {userData.points.toLocaleString()} <span className="text-on-surface-variant text-body-sm font-body-sm">pts</span>
            </div>
          </div>
          <button className="bg-transparent border border-white/10 text-on-surface px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-white/5 transition-colors cursor-pointer">
            View Details
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
