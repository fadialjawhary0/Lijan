/**
 * Format date to display format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = date => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format time to display format (HH:MM)
 * @param {string|TimeSpan} time - Time to format (can be TimeSpan string or HH:MM:SS string)
 * @returns {string} Formatted time string
 */
export const formatTime = time => {
  if (!time) return '-';

  // Handle TimeSpan format (e.g., "14:30:00" or "14:30")
  if (typeof time === 'string') {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
  }

  return time.toString();
};

/**
 * Format date and time to display format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = date => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = date => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Check if a meeting is currently active (within a 2-hour window)
 * @param {string|Date} meetingDate - Meeting date to check
 * @returns {boolean} True if meeting is currently active
 */
export const isMeetingActive = meetingDate => {
  if (!meetingDate) return false;

  const dateObj = typeof meetingDate === 'string' ? new Date(meetingDate) : meetingDate;
  const now = new Date();
  const twoHoursLater = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);

  return now >= dateObj && now <= twoHoursLater;
};
