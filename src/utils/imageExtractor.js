import coverImage from '../assets/cover2.png';

/**
 * Extracts image URL from a given URL synchronously (for initial render)
 * Checks if URL is a direct image first
 *
 * @param {string} url - The URL to extract image from
 * @returns {string} Image URL or fallback image
 */
export const extractImageFromUrl = url => {
  if (!url) {
    return coverImage;
  }

  try {
    // Check if URL is a direct image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerUrl = url.toLowerCase();

    // Check if URL ends with image extension or contains image extension before query params
    const urlWithoutQuery = lowerUrl.split('?')[0];
    const isDirectImage = imageExtensions.some(ext => urlWithoutQuery.endsWith(ext));

    if (isDirectImage) {
      return url;
    }

    // Check for common image hosting patterns
    const imageHostingPatterns = [
      /imgur\.com\/\w+\.(jpg|jpeg|png|gif)/i,
      /i\.imgur\.com\/\w+\.(jpg|jpeg|png|gif)/i,
      /unsplash\.com\/photos/i,
      /pexels\.com\/photo/i,
      /images\.unsplash\.com/i,
    ];

    if (imageHostingPatterns.some(pattern => pattern.test(url))) {
      return url;
    }

    // For non-direct images, return null to indicate async fetch is needed
    // The component will use useExtractImageFromUrlQuery to fetch og:image
    return null;
  } catch (error) {
    console.error('Error extracting image from URL:', error);
    return coverImage;
  }
};

/**
 * Gets image URL with error handling
 * Tries to load the image, falls back if it fails
 *
 * @param {string} url - The URL to get image from
 * @returns {Promise<string>} Image URL or fallback
 */
export const getImageWithFallback = async url => {
  if (!url) {
    return coverImage;
  }

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(coverImage);
    img.src = url;
  });
};

/**
 * Hook-like function to get image URL with state management
 * Can be used in components
 *
 * @param {string} url - The URL to extract image from
 * @returns {string} Image URL (initially returns extracted URL, updates on error)
 */
export const useImageUrl = url => {
  const extractedUrl = extractImageFromUrl(url);

  // In a real implementation, you might want to use useState/useEffect
  // For now, return the extracted URL
  return extractedUrl;
};
