// Function to format a site in bytes to a human-readable format
export function formatByteSize(size: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];

  let unitIndex = 0;
  let formattedSize = size;

  // Loop to find the appropriate unit
  // and format the size accordingly
  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024;
    unitIndex++;
  }

  // Return the formatted size with 2 decimal places
  // and the appropriate unit
  return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
}
