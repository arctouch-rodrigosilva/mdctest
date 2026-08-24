import { describe, expect, it } from 'vitest';
import { formatSignalTime, getGreeting, getPhase } from './greeting.js';

function atHour(hour) {
  return new Date(2026, 7, 24, hour, 0, 0);
}

describe('getGreeting', () => {
  it('returns a morning greeting before noon', () => {
    expect(getGreeting(atHour(0))).toBe('Good morning, World');
    expect(getGreeting(atHour(11))).toBe('Good morning, World');
  });

  it('returns an afternoon greeting from noon until evening', () => {
    expect(getGreeting(atHour(12))).toBe('Good afternoon, World');
    expect(getGreeting(atHour(17))).toBe('Good afternoon, World');
  });

  it('returns an evening greeting from 18:00 onward', () => {
    expect(getGreeting(atHour(18))).toBe('Good evening, World');
    expect(getGreeting(atHour(23))).toBe('Good evening, World');
  });

  it('falls back when the date is invalid or missing the Date contract', () => {
    expect(getGreeting(new Date('not-a-date'))).toBe('Hello, World');
    expect(getGreeting(null)).toBe('Hello, World');
    expect(getGreeting({})).toBe('Hello, World');
  });
});

describe('getPhase', () => {
  it('maps hours onto named light phases', () => {
    expect(getPhase(atHour(4))).toBe('night');
    expect(getPhase(atHour(5))).toBe('morning');
    expect(getPhase(atHour(12))).toBe('afternoon');
    expect(getPhase(atHour(18))).toBe('evening');
    expect(getPhase(atHour(22))).toBe('night');
  });

  it('falls back to day for invalid input', () => {
    expect(getPhase(new Date(NaN))).toBe('day');
  });
});

describe('formatSignalTime', () => {
  it('formats a 24-hour clock with seconds', () => {
    expect(formatSignalTime(new Date(2026, 7, 24, 16, 31, 4))).toBe('16:31:04');
  });

  it('falls back when the date is invalid', () => {
    expect(formatSignalTime(new Date('invalid'))).toBe('--:--:--');
  });
});
