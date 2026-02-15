import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges and deduplicates CSS class names using `clsx` and `tailwind-merge`.
 *
 * Combines multiple class values together while intelligently resolving
 * Tailwind CSS conflicts (e.g., `p-2` and `p-4` will keep only `p-4`).
 *
 * @param inputs - A list of class values (strings, objects, arrays, etc.).
 * @returns A merged class string with Tailwind conflicts resolved.
 *
 * @example
 * cn('p-2 bg-red-500', 'p-4') // => 'bg-red-500 p-4'
 * cn('text-sm', { 'font-bold': true, 'italic': false }) // => 'text-sm font-bold'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a file size in bytes into a human-readable string (KB, MB, GB, TB).
 *
 * Automatically selects the most appropriate unit and rounds to 2 decimal places.
 *
 * @param bytes - The file size in bytes.
 * @returns A formatted string with the size and unit.
 *
 * @example
 * formatFileSize(0)           // => '0 Bytes'
 * formatFileSize(1024)        // => '1 KB'
 * formatFileSize(1536)        // => '1.5 KB'
 * formatFileSize(1048576)     // => '1 MB'
 * formatFileSize(1073741824)  // => '1 GB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats a date value according to different display styles.
 *
 * Supports 3 formats: compact (`short`), full (`long`), and time-only (`time`).
 * Uses the `en-US` locale for output formatting.
 *
 * @param date - The date to format (Date object, ISO string, or timestamp).
 * @param format - The display format:
 *   - `'short'` (default): e.g., "Jan 15, 2026"
 *   - `'long'`: e.g., "Thursday, January 15, 2026"
 *   - `'time'`: e.g., "02:30 PM"
 * @returns The formatted date string.
 *
 * @example
 * formatDate(new Date(), 'short') // => 'Feb 15, 2026'
 * formatDate('2026-01-01', 'long') // => 'Thursday, January 1, 2026'
 * formatDate(Date.now(), 'time')   // => '01:48 AM'
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const d = new Date(date);

  const options = (
    {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
    } as const
  )[format];

  return d.toLocaleDateString('en-US', options);
}

/**
 * Formats a date as a relative time string compared to the current moment.
 *
 * Returns human-readable strings like "Just now", "5m ago", "3h ago", "2d ago".
 * Falls back to a short date format if the difference exceeds 7 days.
 *
 * @param date - The date to compute relative time for (Date object, ISO string, or timestamp).
 * @returns A relative time string.
 *
 * @example
 * formatRelativeTime(new Date())                                      // => 'Just now'
 * formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000))           // => '5m ago'
 * formatRelativeTime(new Date(Date.now() - 3 * 60 * 60 * 1000))      // => '3h ago'
 * formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // => '2d ago'
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(d, 'short');
}

/**
 * Generates a random unique ID string.
 *
 * Combines a random base-36 string with the current timestamp in base-36
 * to ensure uniqueness.
 *
 * @returns A random ID string.
 *
 * @example
 * generateId() // => 'k5x8z3m2lq1abc'
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Creates a debounced version of the provided function.
 *
 * The function will only execute after no further calls have been made
 * within the specified `wait` period. Useful for high-frequency events
 * like keystrokes, window resizing, etc.
 *
 * @typeParam T - The type of the original function.
 * @param func - The function to debounce.
 * @param wait - The debounce delay in milliseconds.
 * @returns A debounced version of the original function.
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   fetchResults(query);
 * }, 300);
 *
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled version of the provided function.
 *
 * The function will execute at most once within the specified `limit` period.
 * Useful for rate-limiting high-frequency events like scrolling, mouse movement, etc.
 *
 * @typeParam T - The type of the original function.
 * @param func - The function to throttle.
 * @param limit - The minimum interval between executions in milliseconds.
 * @returns A throttled version of the original function.
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculates the Body Mass Index (BMI) from weight and height.
 *
 * Formula: BMI = weight (kg) / height (m)²
 *
 * @param weight - Body weight in kilograms (kg).
 * @param heightCm - Body height in centimeters (cm).
 * @returns The BMI value rounded to 1 decimal place.
 *
 * @example
 * calculateBMI(70, 175) // => 22.9
 * calculateBMI(90, 180) // => 27.8
 */
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

/**
 * Categorizes a BMI value according to WHO standards.
 *
 * Returns a label and corresponding color code:
 * - Underweight (< 18.5): blue `#3b82f6`
 * - Normal (18.5 – 24.9): green `#22c55e`
 * - Overweight (25 – 29.9): orange `#f97316`
 * - Obese (≥ 30): red `#ef4444`
 *
 * @param bmi - The BMI value to categorize.
 * @returns An object containing `label` (category name) and `color` (hex color code).
 *
 * @example
 * getBMICategory(17)   // => { label: 'Underweight', color: '#3b82f6' }
 * getBMICategory(22)   // => { label: 'Normal', color: '#22c55e' }
 * getBMICategory(27.5) // => { label: 'Overweight', color: '#f97316' }
 * getBMICategory(35)   // => { label: 'Obese', color: '#ef4444' }
 */
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#f97316' };
  return { label: 'Obese', color: '#ef4444' };
}

/**
 * Maps a weather icon code to its corresponding emoji.
 *
 * Translates weather API icon identifiers into visual emoji representations.
 * Returns a default thermometer emoji 🌡️ if the icon code is not recognized.
 *
 * @param icon - The weather icon code (e.g., `'clear-day'`, `'rain'`, `'snow'`).
 * @returns The corresponding weather emoji.
 *
 * @example
 * getWeatherIcon('clear-day')  // => '☀️'
 * getWeatherIcon('rain')       // => '🌧️'
 * getWeatherIcon('snow')       // => '❄️'
 * getWeatherIcon('unknown')    // => '🌡️'
 */
export function getWeatherIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'clear-day': '☀️',
    'clear-night': '🌙',
    cloudy: '☁️',
    'partly-cloudy-day': '⛅',
    'partly-cloudy-night': '🌙',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    fog: '🌫️',
    thunder: '⛈️',
    thunderstorm: '⛈️',
  };

  return iconMap[icon] || '🌡️';
}

/**
 * Truncates a text string if it exceeds the specified maximum length.
 *
 * Appends "..." to the end if the text is longer than `maxLength`.
 * Returns the original string unchanged if it is within the limit.
 *
 * @param text - The text string to truncate.
 * @param maxLength - The maximum number of characters before truncation (excluding "...").
 * @returns The truncated string (if applicable).
 *
 * @example
 * truncateText('Hello World', 5) // => 'Hello...'
 * truncateText('Hello', 10)      // => 'Hello'
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Strips all HTML tags from a string, returning only the plain text content.
 *
 * Uses the DOM API (`document.createElement`) to parse HTML and extract text.
 * **Note:** This function only works in a browser environment (client-side).
 *
 * @param html - The HTML string to strip tags from.
 * @returns The plain text content.
 *
 * @example
 * stripHtml('<p>Hello <strong>World</strong></p>') // => 'Hello World'
 * stripHtml('<div><a href="#">Link</a></div>')     // => 'Link'
 * stripHtml('')                                     // => ''
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Copies a text string to the user's clipboard.
 *
 * Uses the Clipboard API (`navigator.clipboard.writeText`).
 * **Note:** Requires clipboard permissions and only works in a secure context (HTTPS or localhost).
 *
 * @param text - The text content to copy.
 * @returns A Promise that resolves when the copy operation succeeds.
 *
 * @example
 * await copyToClipboard('Hello World');
 * // 'Hello World' is now in the clipboard
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * Triggers a file download from a given URL.
 *
 * Creates a hidden `<a>` element with the `download` attribute to initiate the download.
 * Works with both Blob URLs and regular URLs.
 *
 * @param url - The URL of the file to download.
 * @param filename - The filename to save the file as on the user's machine.
 *
 * @example
 * downloadFile('https://example.com/report.pdf', 'report.pdf');
 * downloadFile(blobUrl, 'image.png');
 */
export function downloadFile(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Pauses execution for a specified duration.
 *
 * Returns a Promise that resolves after `ms` milliseconds.
 * Useful in `async` functions for simulating delays or adding wait times.
 *
 * @param ms - The duration to pause in milliseconds.
 * @returns A Promise that resolves after the specified duration.
 *
 * @example
 * await sleep(1000); // Pause for 1 second
 * await sleep(500);  // Pause for 0.5 seconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines the file type based on its filename extension.
 *
 * Supports the following file type categories:
 * - `'image'`: jpg, jpeg, png, gif, webp, svg, bmp
 * - `'video'`: mp4, webm, ogg, mov, avi
 * - `'audio'`: mp3, wav, ogg, flac, aac
 * - `'pdf'`: pdf
 * - `'document'`: doc, docx, odt, rtf
 * - `'spreadsheet'`: xls, xlsx, ods, csv
 * - `'archive'`: zip, rar, 7z, tar, gz
 * - `'default'`: any unrecognized extension
 *
 * @param filename - The filename to determine the type of (including extension).
 * @returns A string representing the file type category.
 *
 * @example
 * getFileType('photo.jpg')   // => 'image'
 * getFileType('video.mp4')   // => 'video'
 * getFileType('report.pdf')  // => 'pdf'
 * getFileType('data.xlsx')   // => 'spreadsheet'
 * getFileType('backup.zip')  // => 'archive'
 * getFileType('unknown.xyz') // => 'default'
 */
export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  const docExts = ['doc', 'docx', 'odt', 'rtf'];
  const spreadsheetExts = ['xls', 'xlsx', 'ods', 'csv'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (docExts.includes(ext)) return 'document';
  if (spreadsheetExts.includes(ext)) return 'spreadsheet';
  if (archiveExts.includes(ext)) return 'archive';

  return 'default';
}
