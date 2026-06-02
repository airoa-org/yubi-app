export function secondsToHoursMinutes(seconds: number): {
  hours: number;
  minutes: number;
} {
  return {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
  };
}

export function hoursMinutesToSeconds(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60;
}
