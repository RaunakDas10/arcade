import { 
  generateGuestName, 
  distance, 
  generateId, 
  formatTime,
  clamp,
  lerp
} from '../src/utils/helpers';

describe('Helper Functions', () => {
  test('generateGuestName should return a string', () => {
    const name = generateGuestName();
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  test('distance should calculate correctly', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
    expect(distance(1, 1, 4, 5)).toBe(5);
    expect(distance(0, 0, 0, 0)).toBe(0);
  });

  test('generateId should return a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  test('formatTime should format seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3600)).toBe('60:00');
  });

  test('clamp should limit values to range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test('lerp should interpolate correctly', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});
