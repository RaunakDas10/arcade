/**
 * Generates a random guest name for players
 * @returns {string} A random guest name
 */
export function generateGuestName() {
    const adjectives = [
        'Brave', 'Swift', 'Mighty', 'Clever', 'Fierce',
        'Agile', 'Nimble', 'Sneaky', 'Deadly', 'Rapid',
        'Silent', 'Shadow', 'Mystic', 'Pixel', 'Cyber'
    ];
    
    const nouns = [
        'Warrior', 'Hunter', 'Ninja', 'Sniper', 'Ranger',
        'Knight', 'Archer', 'Rogue', 'Soldier', 'Assassin',
        'Gunner', 'Fighter', 'Agent', 'Trooper', 'Scout'
    ];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100);
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
}

/**
 * Calculates the distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} The distance between the points
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Generates a unique ID
 * @returns {string} A unique ID
 */
export function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

/**
 * Formats a number as a time string (MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Detects if the device is mobile
 * @returns {boolean} True if the device is mobile
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Lerps between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} amt - Amount to interpolate (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

/**
 * Clamps a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
