import React, { forwardRef } from 'react';

const CertificateTemplate = forwardRef(({ name, subject, score, total, issueDate, certId }, ref) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 100;

  // Format subject nicely so single letters like "C" become "C Certification Assessment"
  const formattedSubject = formatSubjectTitle(subject);

  // Format date elegantly (e.g. October 14, 2026)
  const formattedDate = formatDisplayDate(issueDate);

  const verificationId = certId || `PK-${Math.abs(hashCode(String(name) + String(subject))).toString(36).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '1200px',
        height: '848px',
        zIndex: -9999,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <div
        ref={ref}
        id="padhaikaro-certificate"
        style={{
          width: '1200px',
          height: '848px',
          position: 'relative',
          backgroundColor: '#fdfbf7',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '52px 70px 40px 70px',
          fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        {/* Vector Certificate Border Frame */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
          viewBox="0 0 1200 848"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle parchment background gradient */}
          <rect width="1200" height="848" fill="#fdfcf9" />

          {/* Outer Royal Navy Frame */}
          <rect x="20" y="20" width="1160" height="808" rx="6" stroke="#0f2444" strokeWidth="6" fill="none" />

          {/* Secondary Gold Border */}
          <rect x="30" y="30" width="1140" height="788" rx="4" stroke="#d97706" strokeWidth="2.5" fill="none" />

          {/* Inner Navy Dotted Security Border */}
          <rect x="38" y="38" width="1124" height="772" rx="3" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="6 3" strokeOpacity="0.5" fill="none" />

          {/* Decorative Corner Filigrees (Top-Left) */}
          <g transform="translate(38, 38)">
            <path d="M0 0 L 65 0 C 42 10 24 28 14 55 L 14 14 L 55 14 C 28 24 10 42 0 65 Z" fill="#d97706" fillOpacity="0.85" />
            <path d="M 6 6 L 45 6 C 30 14 18 26 10 45 L 10 10 L 45 10 Z" fill="#0f2444" />
            <circle cx="28" cy="28" r="3.5" fill="#b45309" />
            <path d="M 52 80 L 52 52 L 80 52" stroke="#b45309" strokeWidth="2" fill="none" />
          </g>

          {/* Decorative Corner Filigrees (Top-Right) */}
          <g transform="translate(1162, 38) scale(-1, 1)">
            <path d="M0 0 L 65 0 C 42 10 24 28 14 55 L 14 14 L 55 14 C 28 24 10 42 0 65 Z" fill="#d97706" fillOpacity="0.85" />
            <path d="M 6 6 L 45 6 C 30 14 18 26 10 45 L 10 10 L 45 10 Z" fill="#0f2444" />
            <circle cx="28" cy="28" r="3.5" fill="#b45309" />
            <path d="M 52 80 L 52 52 L 80 52" stroke="#b45309" strokeWidth="2" fill="none" />
          </g>

          {/* Decorative Corner Filigrees (Bottom-Left) */}
          <g transform="translate(38, 810) scale(1, -1)">
            <path d="M0 0 L 65 0 C 42 10 24 28 14 55 L 14 14 L 55 14 C 28 24 10 42 0 65 Z" fill="#d97706" fillOpacity="0.85" />
            <path d="M 6 6 L 45 6 C 30 14 18 26 10 45 L 10 10 L 45 10 Z" fill="#0f2444" />
            <circle cx="28" cy="28" r="3.5" fill="#b45309" />
            <path d="M 52 80 L 52 52 L 80 52" stroke="#b45309" strokeWidth="2" fill="none" />
          </g>

          {/* Decorative Corner Filigrees (Bottom-Right) */}
          <g transform="translate(1162, 810) scale(-1, -1)">
            <path d="M0 0 L 65 0 C 42 10 24 28 14 55 L 14 14 L 55 14 C 28 24 10 42 0 65 Z" fill="#d97706" fillOpacity="0.85" />
            <path d="M 6 6 L 45 6 C 30 14 18 26 10 45 L 10 10 L 45 10 Z" fill="#0f2444" />
            <circle cx="28" cy="28" r="3.5" fill="#b45309" />
            <path d="M 52 80 L 52 52 L 80 52" stroke="#b45309" strokeWidth="2" fill="none" />
          </g>
        </svg>

        {/* Certificate Content - Z-Index 10 */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Emblem & Academy Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#b45309">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  letterSpacing: '0.28em',
                  color: '#0f2444',
                  textTransform: 'uppercase'
                }}
              >
                PadhaiKaro Learning Academy
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#b45309">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>

            {/* Certificate Title */}
            <h1
              style={{
                fontSize: '38px',
                fontWeight: '800',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#0f2444',
                letterSpacing: '0.08em',
                margin: '0 0 6px 0',
                textTransform: 'uppercase'
              }}
            >
              Certificate of Achievement
            </h1>

            {/* Gold Ribbon Divider */}
            <div style={{ display: 'flex', alignItems: 'center', width: '420px', margin: '2px 0 10px 0' }}>
              <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, #d97706)' }} />
              <div style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', backgroundColor: '#b45309', margin: '0 10px' }} />
              <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, #d97706)' }} />
            </div>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '15px',
                fontStyle: 'italic',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#475569',
                margin: '0',
                letterSpacing: '0.04em'
              }}
            >
              This is proudly presented to
            </p>
          </div>

          {/* Student Recipient Name Section */}
          <div style={{ margin: '4px 0', width: '100%' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: '700',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#0d223f',
                letterSpacing: '0.02em',
                margin: '0 0 8px 0',
                textTransform: 'capitalize'
              }}
            >
              {name || "Student Scholar"}
            </h2>
            <div
              style={{
                width: '340px',
                height: '2.5px',
                margin: '0 auto',
                background: 'linear-gradient(to right, transparent, #d97706, #b45309, #d97706, transparent)'
              }}
            />
          </div>

          {/* Subject & Requirement Text */}
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <p
              style={{
                fontSize: '15px',
                color: '#334155',
                lineHeight: '1.5',
                margin: '0 0 6px 0'
              }}
            >
              for demonstrating outstanding mastery, curriculum completion, and academic proficiency in
            </p>

            {/* Subject Title */}
            <h3
              style={{
                fontSize: '32px',
                fontWeight: '800',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#b45309',
                letterSpacing: '0.02em',
                margin: '2px 0 12px 0'
              }}
            >
              {formattedSubject}
            </h3>

            {/* High-Contrast Distinction Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#fef3c7',
                border: '1.5px solid #d97706',
                padding: '7px 22px',
                borderRadius: '9999px',
                boxShadow: '0 2px 5px rgba(180, 83, 9, 0.12)'
              }}
            >
              <span style={{ color: '#16a34a', fontSize: '15px', fontWeight: 'bold' }}>★</span>
              <span style={{ fontSize: '14px', color: '#78350f', fontWeight: '700' }}>
                SCORE: {percentage}% ({score}/{total} CORRECT)
              </span>
              <span style={{ color: '#b45309' }}>•</span>
              <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Passed with Distinction
              </span>
              <span style={{ color: '#16a34a', fontSize: '15px', fontWeight: 'bold' }}>★</span>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 40px',
              boxSizing: 'border-box'
            }}
          >
            {/* Left: Date */}
            <div style={{ width: '220px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f2444', margin: '0 0 6px 0' }}>
                {formattedDate}
              </p>
              <div style={{ height: '2px', backgroundColor: '#0f2444', width: '100%', marginBottom: '6px' }} />
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>
                Date of Issuance
              </p>
            </div>

            {/* Center: Official Gold Foil Seal */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '86px',
                  height: '86px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #92400e 100%)',
                  boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3), inset 0 0 6px rgba(255,255,255,0.7)',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    border: '1.5px dashed rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#ffffff'
                  }}
                >
                  <span style={{ fontSize: '17px', lineHeight: 1, color: '#fef08a' }}>★</span>
                  <span style={{ fontSize: '8px', fontWeight: '900', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px' }}>
                    Verified
                  </span>
                  <span style={{ fontSize: '7px', fontWeight: '700', opacity: 0.95, letterSpacing: '0.08em' }}>
                    PadhaiKaro
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Signature */}
            <div style={{ width: '220px', textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
                  fontSize: '28px',
                  color: '#0f2444',
                  fontWeight: '600',
                  transform: 'rotate(-2deg)',
                  marginBottom: '2px'
                }}
              >
                Sounic behera
              </div>
              <div style={{ height: '2px', backgroundColor: '#0f2444', width: '100%', marginBottom: '6px' }} />
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>
                Academic Director
              </p>
            </div>
          </div>

          {/* Bottom Security Strip */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '14px',
              fontSize: '11px',
              color: '#64748b',
              marginTop: '4px'
            }}
          >
            <span>Credential ID: <strong style={{ color: '#0f2444' }}>{verificationId}</strong></span>
            <span>•</span>
            <span>Authenticity Verified by PadhaiKaro LMS</span>
            <span>•</span>
            <span>padhaikaro.com/verify</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Helper to format short subjects into prestigious titles
function formatSubjectTitle(subject) {
  if (!subject) return 'Certification Assessment';
  const clean = subject.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('certification') || lower.includes('certificate') || lower.includes('assessment')) {
    return clean;
  }

  if (clean.length <= 3) {
    // e.g. "C", "JS", "CSS", "SQL"
    return `${clean} Programming Certification`;
  }

  return `${clean} Certification Assessment`;
}

// Helper to format dates gracefully
function formatDisplayDate(dateStr) {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Handle DD/MM/YYYY or MM/DD/YYYY or timestamp
  try {
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      // If first part is day or month, try parsing
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (e) { }

  return dateStr;
}

// Helper for deterministic certificate ID
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 987654;
}

export default CertificateTemplate;
