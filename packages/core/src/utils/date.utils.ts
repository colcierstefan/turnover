export const PARTIAL_ISO_DATE_PATTERN = /^\d{4}(-\d{2}(-\d{2})?)?$/;

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);
