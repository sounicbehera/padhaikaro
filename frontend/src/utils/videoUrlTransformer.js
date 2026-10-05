/**
 * Parses and transforms a raw Cloudinary video URL into HLS and MP4 formats.
 * Space Complexity: O(1) auxiliary space (excluding the returned string allocations).
 */
export function transformCloudinaryVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { mp4Url: null, hlsUrl: null };
  }

  // 1. Validate domain to prevent malicious mutations
  if (!rawUrl.startsWith('https://res.cloudinary.com/') && !rawUrl.startsWith('http://res.cloudinary.com/')) {
    return { mp4Url: rawUrl, hlsUrl: null }; // Return as-is if it's not a Cloudinary URL
  }

  // 2. Strip existing extensions if present (e.g., .mp4, .mkv)
  let cleanUrl = rawUrl;
  const lastDotIndex = cleanUrl.lastIndexOf('.');
  const lastSlashIndex = cleanUrl.lastIndexOf('/');
  
  // Only strip if the dot is part of the filename (after the last slash)
  if (lastDotIndex > lastSlashIndex && lastDotIndex !== -1) {
    cleanUrl = cleanUrl.substring(0, lastDotIndex);
  }

  // 3. Construct the Fallback MP4 URL
  const mp4Url = `${cleanUrl}.mp4`;

  // 4. Construct the HLS Streaming URL
  // Cloudinary structure: .../video/upload/[transformations]/v1234/public_id
  const uploadToken = '/upload/';
  const uploadIndex = cleanUrl.indexOf(uploadToken);

  let hlsUrl = null;
  if (uploadIndex !== -1) {
    const beforeUpload = cleanUrl.substring(0, uploadIndex + uploadToken.length);
    const afterUpload = cleanUrl.substring(uploadIndex + uploadToken.length);
    
    // Inject the adaptive streaming profile 'sp_hd' for HLS
    hlsUrl = `${beforeUpload}sp_hd/${afterUpload}.m3u8`;
  }

  return { mp4Url, hlsUrl };
}
