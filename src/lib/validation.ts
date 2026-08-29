export function findUnsupportedChar(
  value: string
): { char: string; index: number; codePoint: number } | null {
  let index = 0;
  for (const char of value) {
    const codePoint = char.codePointAt(0)!;
    if (codePoint > 255) return { char, index, codePoint };
    index += char.length;
  }
  return null;
}
