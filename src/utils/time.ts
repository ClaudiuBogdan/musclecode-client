export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = (minutes % 60).toString().padStart(2, "0");
  const paddedSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}
