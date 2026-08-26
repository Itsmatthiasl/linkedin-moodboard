export function findUnsupportedChar(value: string): string | null {
  for (const char of value) {
    if (char.codePointAt(0)! > 255) return char;
  }
  return null;
}
