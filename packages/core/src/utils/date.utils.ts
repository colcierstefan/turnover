export const PARTIAL_ISO_DATE_PATTERN = /^\d{4}(-\d{2}(-\d{2})?)?$/;

const DAY_MS = 24 * 60 * 60 * 1000;

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const toZonedIsoDate = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);

export const countDaysBetween = (fromIsoDate: string, toIsoDate: string) =>
  Math.round((Date.parse(toIsoDate) - Date.parse(fromIsoDate)) / DAY_MS);
