export function getCurrentWeek() {
    const now = new Date();
    const seasonStart = new Date('2024-09-05'); // First game of 2024 season
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksPassed = Math.floor((now - seasonStart) / msPerWeek);
    return Math.min(Math.max(1, weeksPassed + 1), 18); // Clamp between week 1-18
} 