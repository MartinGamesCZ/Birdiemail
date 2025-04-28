import { DateTime } from "luxon";

// Function to format a date to human readable format
export function formatMailDate(date: Date | string): string {
  // Use luxon to parse the date
  const parsedDate = new Date(date);

  // Check if the date is today
  const isToday = parsedDate.toDateString() === new Date().toDateString();

  return isToday
    ? // If the date is today, format it only to time
      DateTime.fromJSDate(parsedDate).toFormat("HH:mm")
    : // If the date is not today, format it to date and time
      DateTime.fromJSDate(parsedDate).toFormat("dd. MM. yyyy HH:mm");
}
