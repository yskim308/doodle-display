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
      Array.isArray((parsed as { lines: unknown[] }).lines)
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

export interface RenderOptions {
  width?: number
  height?: number
  background?: string
}

/**
 * Very small renderer for react-canvas-draw saveData -> <canvas>
 * Supports straight stroke replay (no animation) for export.
 */
export function renderSaveDataToCanvas(
  canvas: HTMLCanvasElement,
  saveDataString: string,
  opts: RenderOptions = {}
) {
  const data = JSON.parse(normalizeSaveDataString(saveDataString));
  const width = opts.width ?? (data.width ?? DEFAULT_WIDTH);
  const height = opts.height ?? (data.height ?? DEFAULT_HEIGHT);
  const background = opts.background ?? "#ffffff";

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // draw lines
  for (const line of data.lines ?? []) {
    const pts = line.points ?? [];
    if (pts.length < 2) continue;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = line.brushColor ?? "#111827";
    ctx.lineWidth = line.brushRadius ?? 2;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }
}

