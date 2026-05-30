/**
 * Shared date/time formatting utilities for SatikFlow CRM.
 * Always displays dates in Indian Standard Time (IST / Asia/Kolkata).
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date string or Date as: "30 May 2026"
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const day = d.toLocaleDateString('en-US', { day: 'numeric', timeZone: IST_TIMEZONE });
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: IST_TIMEZONE });
  const year = d.toLocaleDateString('en-US', { year: 'numeric', timeZone: IST_TIMEZONE });
  return `${day} ${month} ${year}`;
};

/**
 * Format a date string or Date as: "12:30 PM" (12-hour, IST)
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  const timeString = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TIMEZONE
  });
  return timeString.replace(/\s+/g, ' ').toUpperCase();
};

/**
 * Format a date string or Date as: "30 May 2026 12:30 PM" (IST)
 */
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Build an ISO string with IST (+05:30) offset from a date input + time string
 * e.g. buildISTIsoString('2026-05-30', '12:30') → '2026-05-30T12:30:00+05:30'
 */
export const buildISTIsoString = (dateStr: string, timeStr: string): string => {
  return `${dateStr}T${timeStr}:00+05:30`;
};
