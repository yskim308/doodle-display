"use client";

export const DEFAULT_WIDTH = 300;
export const DEFAULT_HEIGHT = 300;

// Handles double-encoded JSON and ensures a valid { lines: [] } shape
export function normalizeSaveDataString(data: string): string {
  try {
    let parsed: unknown = JSON.parse(data);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as any).lines)
    ) {
      return JSON.stringify(parsed);
    }
  } catch {
    if (data.includes('"lines"')) return data;
  }
  return JSON.stringify({
    lines: [],
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
}

export function shortId(id: string, n = 8) {
  return id.slice(-n);
}
