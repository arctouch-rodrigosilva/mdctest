const FALLBACK_GREETING = 'Hello, World';

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function getGreeting(date = new Date()) {
  if (!isValidDate(date)) {
    return FALLBACK_GREETING;
  }

  const hour = date.getHours();
  if (hour < 12) return 'Good morning, World';
  if (hour < 18) return 'Good afternoon, World';
  return 'Good evening, World';
}

export function getPhase(date = new Date()) {
  if (!isValidDate(date)) {
    return 'day';
  }

  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function formatSignalTime(date = new Date()) {
  if (!isValidDate(date)) {
    return '--:--:--';
  }

  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
