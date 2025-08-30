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
  strokeMultiplier?: number
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
  const originalWidth = data.width ?? DEFAULT_WIDTH;
  const originalHeight = data.height ?? DEFAULT_HEIGHT;
  const targetWidth = opts.width ?? originalWidth;
  const targetHeight = opts.height ?? originalHeight;
  const background = opts.background ?? "#ffffff";

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Calculate scale factors to fit the drawing within the target dimensions
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;
  const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
  
  // Calculate centering offsets
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;

  // background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Apply scaling and centering transformation
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // draw lines
  for (const line of data.lines ?? []) {
    const pts = line.points ?? [];
    if (pts.length < 2) continue;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    
    // Check if this is an eraser stroke
    const isEraser = line.brushColor === "rgba(0,0,0,0)" || 
                     line.brushColor === "transparent" || 
                     (line as any).eraser === true;
    
    if (isEraser) {
      // Handle eraser strokes - use destination-out compositing
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)"; // Any color works for eraser
    } else {
      // Handle regular brush strokes
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = line.brushColor ?? "#111827";
    }
    
    // Try multiple possible brush radius properties
    const brushRadius = line.brushRadius ?? (line as any).brushSize ?? (line as any).width ?? 2;
    
    // Apply stroke multiplier if specified, otherwise use 1.8x as default
    const multiplier = opts.strokeMultiplier ?? 1.8;
    const enlargedBrushRadius = brushRadius * multiplier;
    
    // CORRECT SCALING: Maintain the same brush-to-canvas ratio
    // Calculate what percentage of the original canvas the brush occupied
    const relativeBrushRatio = enlargedBrushRadius / originalWidth;
    // Apply that same ratio to the new canvas size
    const scaledBrushRadius = relativeBrushRatio * targetWidth;
    
    ctx.lineWidth = scaledBrushRadius;
    
    // Debug: Log brush scaling calculations
    if (data.lines.length > 0 && data.lines[0] === line) {
      console.log('=== BRUSH SCALING DEBUG ===');
      console.log('Original brush radius:', brushRadius, 'px');
      console.log('Enlarged brush radius (1.8x):', enlargedBrushRadius, 'px');
      console.log('Original canvas width:', originalWidth, 'px');
      console.log('Brush-to-canvas ratio:', relativeBrushRatio.toFixed(4));
      console.log('Target canvas width:', targetWidth, 'px');
      console.log('Scaled brush radius:', scaledBrushRadius.toFixed(2), 'px');
      console.log('Scale factor used:', (targetWidth / originalWidth).toFixed(3));
      console.log('Is eraser:', isEraser);
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }

  // Restore the context
  ctx.restore();
}

