/**
 * Get current date/time in BVI timezone (Atlantic Standard Time, UTC-4)
 * formatted for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function getCurrentDateTimeAST(): string {
  const now = new Date();
  const astOffset = -4 * 60;
  const utcOffset = now.getTimezoneOffset();
  const astTime = new Date(now.getTime() + (utcOffset + astOffset) * 60 * 1000);

  const year = astTime.getFullYear();
  const month = String(astTime.getMonth() + 1).padStart(2, "0");
  const day = String(astTime.getDate()).padStart(2, "0");
  const hours = String(astTime.getHours()).padStart(2, "0");
  const minutes = String(astTime.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert datetime-local value to ISO string for database storage.
 * Assumes the input time is in AST (UTC-4).
 */
export function convertToISOString(datetimeLocal: string): string {
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const utcDate = new Date(Date.UTC(year, month - 1, day, hours + 4, minutes));
  return utcDate.toISOString();
}
