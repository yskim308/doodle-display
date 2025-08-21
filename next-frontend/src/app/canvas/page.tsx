"use client";
import { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import {
  Button,
  Slider,
  Typography,
  Box,
  Popover,
  ToggleButton,
  IconButton,
  Stack,
  ToggleButtonGroup,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import { FormatColorFill } from "@mui/icons-material";
import ColorLensIcon from '@mui/icons-material/ColorLens'; // color change
import BrushIcon from "@mui/icons-material/Brush"; //paintbrush
import CreateIcon from "@mui/icons-material/Create";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; //eraser
import RestartAltIcon from '@mui/icons-material/RestartAlt'; //restart
import LogoutIcon from '@mui/icons-material/Logout'; // send
import BubbleChartIcon from '@mui/icons-material/BubbleChart'; // size
import axios from "axios";

export default function Page() {
  const canvasRef = useRef<CanvasDraw | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(4);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [drawMode, setDrawMode] = useState<"draw" | "erase">("draw");

  const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!backendBaseURL) throw new Error("backend base url not defined in .env");
  const handleSizeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSizePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "brush-size-popover" : undefined;

const handleSave = async () => {
  if (!canvasRef.current) return;

  // 1. Animated JSON (for /view)
  const saveData = canvasRef.current.getSaveData();

  // 2. Flat PNG (for /success)
  // TS doesn’t know about .canvasContainer, so we cast to `any`
  const canvasEl = (canvasRef.current as any).canvasContainer
    .children[1] as HTMLCanvasElement;
  const pngData = canvasEl.toDataURL("image/png");

  try {
    const res = await axios.post(`${backendBaseURL}/submit`, {
      json: saveData,
      png: pngData,
    });

    console.log("Saved successfully", res.data);
    canvasRef.current.clear();
  } catch (err) {
    console.error("Error saving", err);
  }
};


  const handleReset = () => {
    if (!canvasRef.current) return;
    canvasRef.current.clear();
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBrushColor(event.target.value);
  };

  const handleBrushSizeChange = (event: Event, newValue: number | number[]) => {
    setBrushRadius(newValue as number);
  };

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "draw" | "erase",
  ) => {
    if (newMode !== null) {
      setDrawMode(newMode);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full p-4">
      {/* --- Controls --- */}
      <Box className="flex gap-4 mb-4 items-center mt-10">
        {/* Draw/Erase Toggle */}
        <ToggleButtonGroup
          value={drawMode}
          exclusive
          onChange={handleModeChange}
          aria-label="draw or erase mode"
        >
          <ToggleButton value="draw" aria-label="draw mode">
            <CreateIcon />
          </ToggleButton>
          <ToggleButton value="erase" aria-label="erase mode">
            <AutoFixHighIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Color Button - only show when in draw mode */}
        {drawMode === "draw" && (
          <Button
            variant="outlined"
            onClick={() => colorInputRef.current?.click()}
            startIcon={<ColorLensIcon />}
          >
            Color
          </Button>
        )}

        {/* Hidden Color Input */}
        <input
          ref={colorInputRef}
          type="color"
          value={brushColor}
          onChange={handleColorChange}
          style={{ display: "none" }}
        />

        {/* Brush Size Button */}
        <Button
          variant="outlined"
          aria-describedby={id}
          onClick={handleSizeClick}
          startIcon={<BrushIcon />}
        >
          Size
        </Button>

        {/* Brush Size Popover */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleSizePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2, width: 200 }}>
            <Typography gutterBottom>
              {drawMode === "draw" ? "Brush" : "Eraser"} Size: {brushRadius}px
            </Typography>
            <Slider
              value={brushRadius}
              onChange={handleBrushSizeChange}
              min={1}
              max={20}
              step={1}
              valueLabelDisplay="auto"
              sx={{ color: drawMode === "draw" ? brushColor : "#666" }}
            />
          </Box>
        </Popover>
      </Box>

      {/* --- Canvas --- */}
      <Box border="1px solid #ccc" borderRadius={2}>
        <CanvasDraw
          ref={canvasRef}
          brushRadius={brushRadius}
          brushColor={drawMode === "draw" ? brushColor : "#FFFFFF"}
          lazyRadius={0}
          canvasWidth={350}
          canvasHeight={350}
          hideGrid={true}
        />
      </Box>

      {/* --- Action Buttons --- */}
      <div className="mt-4 flex gap-2">
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Submit
        </Button>
      </div>
    </div>
  );
}
