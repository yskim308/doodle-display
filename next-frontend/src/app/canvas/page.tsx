"use client";
import { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import {
  Button,
  Slider,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function Page() {
  const canvasRef = useRef<CanvasDraw | null>(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(1);

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

  const handleColorChange = (event) => {
    setBrushColor(event.target.value);
  };

  const handleBrushSizeChange = (event, newValue) => {
    setBrushRadius(newValue);
  };

  // Predefined color options
  const colorOptions = [
    { value: "#000000", label: "Black" },
    { value: "#FF0000", label: "Red" },
    { value: "#00FF00", label: "Green" },
    { value: "#0000FF", label: "Blue" },
    { value: "#FFFF00", label: "Yellow" },
    { value: "#FF00FF", label: "Magenta" },
    { value: "#00FFFF", label: "Cyan" },
    { value: "#FFA500", label: "Orange" },
    { value: "#800080", label: "Purple" },
    { value: "#FFC0CB", label: "Pink" },
  ];

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl my-3">draw... or else</h1>

      {/* Controls */}
      <Box className="flex gap-4 mb-4 items-center">
        {/* Color Picker */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Color</InputLabel>
          <Select value={brushColor} onChange={handleColorChange} label="Color">
            {colorOptions.map((color) => (
              <MenuItem key={color.value} value={color.value}>
                <Box className="flex items-center gap-2">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: color.value,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  />
                  {color.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Custom Color Input */}
        <Box className="flex items-center gap-2">
          <Typography variant="body2">Custom:</Typography>
          <input
            type="color"
            value={brushColor}
            onChange={handleColorChange}
            style={{ width: 40, height: 40, border: "none", borderRadius: 4 }}
          />
        </Box>

        {/* Brush Size Slider */}
        <Box sx={{ width: 200 }}>
          <Typography variant="body2" gutterBottom>
            Brush Size: {brushRadius}px
          </Typography>
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
