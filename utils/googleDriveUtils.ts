
/**
 * Utility functions for handling Google Drive links
 */

export const GOOGLE_DRIVE_REGEX = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([-a-zA-Z0-9_]+)/;
export const GOOGLE_USER_CONTENT_REGEX = /googleusercontent\.com/;

/**
 * Extracts File ID from a Google Drive URL
 * @param url Full Google Drive URL
 * @returns File ID or null
 */
export const extractDriveFileId = (url: string): string | null => {
  const match = url.match(GOOGLE_DRIVE_REGEX);
  return match ? match[1] : null;
};

/**
 * Generates a direct preview/embed link for App usage
 * @param fileId Google Drive File ID
 * @returns Preview URL
 */
export const getDrivePreviewLink = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Generates a thumbnail/image direct link (Works for image files on Drive)
 * Note: content.googleusercontent.com is more reliable than drive.google.com/uc?export=view for images
 * @param fileId Google Drive File ID
 * @returns Image Source URL
 */
export const getDriveImageLink = (fileId: string): string => {
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`; // s0 = full size
};

/**
 * Generates a download link
 * @param fileId Google Drive File ID
 * @returns Download URL
 */
export const getDriveDownloadLink = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Validates if the string is a valid Google Drive URL
 * @param url URL to check
 */
export const isValidDriveLink = (url: string): boolean => {
  return GOOGLE_DRIVE_REGEX.test(url) || GOOGLE_USER_CONTENT_REGEX.test(url);
};
