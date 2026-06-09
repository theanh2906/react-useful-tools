import exifr from 'exifr';

/**
 * Extract the capture date from an image file using EXIF metadata.
 * Falls back to file.lastModified if EXIF metadata is missing or parsing fails.
 * 
 * @param file - The image file to parse.
 * @returns A promise resolving to a date string in YYYY-MM-DD format.
 */
export async function extractImageCaptureDate(file: File): Promise<string> {
  try {
    // Parse EXIF metadata specifically for DateTimeOriginal and CreateDate
    const output = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']);
    const timestamp = output?.DateTimeOriginal || output?.CreateDate;

    if (timestamp instanceof Date) {
      return formatDateToISO(timestamp);
    }
  } catch (error) {
    console.warn('Failed to parse EXIF metadata, falling back to lastModified:', error);
  }

  // Fallback to file system lastModified date
  return formatDateToISO(new Date(file.lastModified));
}

/**
 * Formats a Date object into YYYY-MM-DD format in local timezone.
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
