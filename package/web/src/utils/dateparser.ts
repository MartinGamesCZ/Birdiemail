import { DateTime } from "luxon";

export function formatMailDate(date: Date | string): string {
  const parsedDate = new Date(date);

  const isToday = parsedDate.toDateString() === new Date().toDateString();

  return isToday
    ? DateTime.fromJSDate(parsedDate).toFormat("HH:mm")
    : DateTime.fromJSDate(parsedDate).toFormat("dd. MM. yyyy HH:mm:ss");
}
