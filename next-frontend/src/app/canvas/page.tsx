"use client";
import { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import { Button, Slider, Typography, Box } from "@mui/material";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import BrushIcon from "@mui/icons-material/Brush";

export default function Page() {
  const canvasRef = useRef<CanvasDraw | null>(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSlider, setShowBrushSlider] = useState(false);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const saveData = canvasRef.current.getSaveData();
    console.log(saveData);
    console.log("save pressed");
    canvasRef.current.clear();
  };

  const handleReset = () => {
    if (!canvasRef.current) return;
    canvasRef.current.clear();
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBrushColor(event.target.value);
  };

  const handleBrushSizeChange = (event: Event, newValue: number) => {
    setBrushRadius(newValue);
  };

  return (
    <div className="flex flex-col items-center h-full">
      {/* Toggle Controls */}
      <Box className="flex gap-4 mb-4 items-center mt-10">
        {/* Color Toggle Button */}
        <Button
          variant="outlined"
          onClick={() => setShowColorPicker(!showColorPicker)}
          startIcon={<ColorLensIcon />}
        >
          Color
        </Button>

        {/* Brush Size Toggle Button */}
        <Button
          variant="outlined"
          onClick={() => setShowBrushSlider(!showBrushSlider)}
          startIcon={<BrushIcon />}
        >
          Size
        </Button>
      </Box>

      {/* Conditional Controls */}
      <Box className="flex gap-4 mb-4 items-center">
        {/* Color Picker - shown conditionally */}
        {showColorPicker && (
          <Box className="flex items-center gap-2">
            <Typography variant="body2">Color: </Typography>
            <input
              type="color"
              value={brushColor}
              onChange={handleColorChange}
              style={{
                width: 30,
                height: 30,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            />
          </Box>
        )}

        {/* Brush Slider - shown conditionally */}
        {showBrushSlider && (
          <Box sx={{ width: 200 }}>
            <p>{brushRadius}px</p>
            <Slider
              value={brushRadius}
              onChange={handleBrushSizeChange}
              min={1}
              max={20}
              step={1}
              valueLabelDisplay="auto"
              sx={{ color: brushColor }}
            />
          </Box>
        )}
      </Box>

      {/* Canvas */}
      <CanvasDraw
        ref={canvasRef}
        brushRadius={brushRadius}
        brushColor={brushColor}
        lazyRadius={0}
      />

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Submit
        </Button>
      </div>
    </div>
  );
}
