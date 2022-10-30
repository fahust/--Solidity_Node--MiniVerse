export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


export function randomEnum<T>(enumeration: any) {
    const keys = Object.keys(enumeration).filter(
      (k) => !(Math.abs(Number.parseInt(k)) + 1)
    );
    const enumKey = keys[Math.floor(Math.random() * keys.length)];
    return enumeration[enumKey];
  }