"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import CanvasDraw from "react-canvas-draw";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

/** Helper: load an image asset (e.g., /watermark.png) */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Minimal renderer: react-canvas-draw JSON -> <canvas> for PNG export.
 * If background === "transparent", we don't fill a background.
 */
function renderSaveDataToCanvas(
  canvas: HTMLCanvasElement,
  saveDataString: string,
  opts: {
    width?: number;
    height?: number;
    background?: "transparent" | string;
  } = {},
) {
  const data = JSON.parse(saveDataString);
  const cssWidth = (opts.width ?? Number(data.width)) || 640;
  const cssHeight = (opts.height ?? Number(data.height)) || 640;

  const dpr = Number(data.devicePixelRatio) || window.devicePixelRatio || 1;
  const background = opts.background ?? "#ffffff";

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const srcW = Number(data.width) || cssWidth;
  const srcH = Number(data.height) || cssHeight;

  const scale = Math.min(cssWidth / srcW, cssHeight / srcH);

  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  if (background !== "transparent") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }
  ctx.restore();

  // strokes
  for (const line of data?.lines ?? []) {
    const pts = line?.points ?? [];
    if (pts.length < 2) continue;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = line?.brushColor ?? "#111827";
    ctx.lineWidth = line?.brushRadius ?? 2;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }
}

/** Compute tight bounding box of non-transparent pixels */
function computeTightBBox(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h).data;
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = img[i + 3]; // alpha
      if (a !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || maxY < 0) return null; // empty
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export default function SuccessPage() {
  const [saveData, setSaveData] = useState<string | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const sd = sessionStorage.getItem("lastCanvas");
    if (sd) setSaveData(sd);
  }, []);

  useEffect(() => {
    (async () => {
      if (!saveData || !previewRef.current) return;

      // 1) paint the drawing onto the preview canvas (white bg, DPR-scaled)
      renderSaveDataToCanvas(previewRef.current, saveData, {
        width: 640,
        height: 640,
        background: "#ffffff",
      });

      // 2) overlay the full-canvas watermark (uses @2x on Retina)
      try {
        const data = JSON.parse(saveData);
        const cssW = 640;
        const cssH = 640;
        const dpr =
          Number(data.devicePixelRatio) || window.devicePixelRatio || 1;

        const wmSrc = dpr >= 2 ? "/watermark2x.png" : "/watermark.png";
        const wm = await loadImage(wmSrc);

        const ctx = previewRef.current.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.drawImage(wm, 0, 0, cssW, cssH);
          ctx.restore();
        }
      } catch (e) {
        console.warn("Preview watermark skipped:", e);
      }
    })();
  }, [saveData]);

  const handleDownload = async () => {
    if (!saveData) return;

    const data = JSON.parse(saveData);
    const cssW = 640;
    const cssH = 640;

    const out = exportCanvasRef.current ?? document.createElement("canvas");
    renderSaveDataToCanvas(out, saveData, {
      width: cssW,
      height: cssH,
      background: "#ffffff",
    });

    try {
      const dpr = Number(data.devicePixelRatio) || window.devicePixelRatio || 1;
      const wmSrc = dpr >= 2 ? "/watermark2x.png" : "/watermark.png";
      const watermark = await loadImage(wmSrc);

      const octx = out.getContext("2d");
      if (octx) {
        octx.save();
        octx.globalAlpha = 1;
        octx.imageSmoothingEnabled = true;
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        octx.drawImage(watermark, 0, 0, cssW, cssH);
        octx.restore();
      }
    } catch (e) {
      console.warn("Watermark not applied:", e);
    }

    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `message-wall-${Date.now()}.png`;
    a.click();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 3,
        px: 3,
        display: "flex",
        justifyContent: "center",
        bgcolor: "black",
        color: "white",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          pb: 3,
          px: 3,
          width: "100%",
          maxWidth: 720,
          bgcolor: "black",
          color: "white",
        }}
      >
        <Stack gap={2} alignItems="center">
          <Typography
            variant="subtitle1"
            textAlign="center"
            sx={{ mt: 1, fontFamily: "Copperplate, serif", letterSpacing: 2 }}
          >
            画面でメッセージをご確認ください。<br />Check out your message on the screen!
          </Typography>

          {saveData ? (
            <>
              {/* Read-only preview (white background so black strokes are visible) */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 350,
                  aspectRatio: "1/1",
                  border: "1px solid #fff",
                  p: 0,
                }}
              >
                <canvas
                  ref={previewRef}
                  style={{ maxWidth: "100%", height: "auto", display: "block" }}
                />
              </Box>

              <Button
                size="large"
                onClick={handleDownload}
                sx={{
                  border: "2px solid white",
                  color: "white",
                  backgroundColor: "transparent",
                  borderRadius: 1.5,
                  px: 6,
                  "&:hover": {
                    backgroundColor: "transparent",
                    border: "2px solid white",
                  },
                }}
              >
                <SaveAltIcon />
              </Button>
              {/* hidden export canvas used for PNG generation */}
              <canvas ref={exportCanvasRef} style={{ display: "none" }} />
            </>
          ) : (
            <Typography color="gray" textAlign="center"></Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
