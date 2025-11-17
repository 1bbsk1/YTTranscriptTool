export const randomItem = <T>(items: T[]): T => {
  if (!items.length) {
    throw new Error("randomItem called with empty array");
  }
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
};

export const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);
