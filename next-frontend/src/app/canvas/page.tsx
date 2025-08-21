"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import FormatColorFill from "@mui/icons-material/FormatColorFill";
import ColorLensIcon from '@mui/icons-material/ColorLens'; // color change
import BrushIcon from "@mui/icons-material/Brush"; //paintbrush
import CreateIcon from "@mui/icons-material/Create";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; //eraser
import RestartAltIcon from '@mui/icons-material/RestartAlt'; //restart
import EastIcon from '@mui/icons-material/East';
import BubbleChartIcon from '@mui/icons-material/BubbleChart'; // size
import CommitIcon from '@mui/icons-material/Commit';
import axios from "axios";
import { isNullOrUndefined } from "node:util";

function isEmptySaveData(saveDataString: string): boolean {
  try {
    const data = JSON.parse(saveDataString);
    const lines = Array.isArray(data?.lines) ? data.lines : [];
        return lines.length === 0 || lines.every((ln: any) => !Array.isArray(ln?.points) || ln.points.length < 2);
  } catch {
    // if it isn't valid JSON, treat as empty to be safe
    return true;
  }
}

export default function Page() {
  const router = useRouter()
  const [hasContent, setHasContent] = useState(false);
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
    const saveData = canvasRef.current.getSaveData();
    if (isEmptySaveData(saveData)) {
      return;
    }
    let enriched = saveData;
    try {
      const obj = JSON.parse(saveData);
      obj.devicePixelRatio = window.devicePixelRatio || 1;
      enriched = JSON.stringify(obj);
    }
    catch {
    }
    
    try {
    await axios.post(`${backendBaseURL}/submit`, {
      canvas: saveData    });

    sessionStorage.setItem("lastCanvas", saveData);
    router.push("/success");
    }
    catch (err) {
      console.error("submit failed:", err);
    }
    finally {
      setTimeout(() => canvasRef.current?.clear(), 0);
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
    <div className="flex flex-col items-center h-full w-full p-4 bg-black text-white">
  <Box
    sx={{
      display:"flex",
      flexDirection: "column",
      alignItems: "center",
      mt: 2
    }}>
    <img
    src="/logo.png"
    alt="Logo"
    style={{ width: "240px", height: "auto" }}
    />
    <Typography
    variant="h5"
    sx={{
      mt: 1,
      fontFamily: "Copperplate, serif",
      letterSpacing: 2
    }}
    >
      MESSAGE WALL
    </Typography>
  </Box>
  <Box 
      sx={{
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        gap:3,
        width: "100%",
        maxWidth: 400,
        margin: "0 auto"
      }}
      >
      {/* --- Controls --- */}
      <Box className="flex gap-4 mb-4 items-center mt-10">
        {/* Draw/Erase Toggle */}
        <ToggleButtonGroup
          value={drawMode}
          exclusive
          onChange={handleModeChange}
          aria-label="draw or erase mode"
        >

          <ToggleButton 
          value="draw" 
          aria-label="draw mode"
          sx={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid white",
            "&.Mui-selected": {
            backgroundColor: "white", 
            color: "black",
            border: "1px solid white",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "white",
          },
          "&:hover": {
            backgroundColor: "transparent",
          },
          }}
          >
            <CreateIcon />
          </ToggleButton>

          <ToggleButton 
          value="erase" 
          aria-label="erase mode"
          sx={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid white",
            "&.Mui-selected": {
            backgroundColor: "white", // light gray when active
            color: "black",
            border: "1px solid white",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "white",
          },
          "&:hover": {
            backgroundColor: "transparent",
          },
          }}
          >
            <AutoFixHighIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      <Box className="flex gap-2 items-center">
        {/* Color Button - only show when in draw mode */}
        {drawMode === "draw" && (
          <Box sx={{ position: "relative", display:"inline-block "}}>
          <IconButton
            onClick={() => {
              console.log("color clicked");
              colorInputRef.current?.click();}}
            sx = {{
              backgroundColor: "white",
              color: "black",
              width: "48px",
              height: "48px",
              borderRadius: 1,
              "&.hover": { backgroundColor: "white" },
            }}
            >

            <ColorLensIcon />
          </IconButton>

        {/* Hidden Color Input */}
        <input
          ref={colorInputRef}
          type="color"
          value={brushColor}
          onChange={(e) => {
            console.log("new color", e.target.value);
            handleColorChange(e);
          }}
          style={{ 
            opacity: 0,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            cursor: "pointer",
            }}
        />
      </Box>
        )}

        {/* Brush Size Button */}
        <IconButton
          aria-describedby={id}
          onClick={handleSizeClick}
          sx = {{
            backgroundColor: "white",
            color: "black",
            width: "48px",
            height: "48px",
            borderRadius: 1,
            "&:hover": { backgroundColor: "white" },
          }}
        >
          <CommitIcon sx={{ fontSize: 34 }}/>
        </IconButton>

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
    </Box>

      {/* --- Canvas --- */}
      <Box 
      sx={{
        width: "100%",
        maxWidth: 350,
        aspectRatio: "1 / 1",
      }}
      border="1px solid #ccc" >
        <CanvasDraw
          ref={canvasRef}
          brushRadius={brushRadius}
          brushColor={drawMode === "draw" ? brushColor : "#FFFFFF"}
          lazyRadius={0}
          canvasWidth={undefined}
          canvasHeight={undefined}
          hideGrid={true}
          style={{width:"100%", height:"100%"}}
          onChange={() => {
            const sd = canvasRef.current?.getSaveData();
            if (sd) {
              setHasContent(!isEmptySaveData(sd));
            }
          }}
        />
      </Box>

      {/* --- Action Buttons --- */}
      <Box className="mt-4 flex gap-2">
        <IconButton 
        onClick={handleReset}
        sx={{
          border: "2px solid white",
          color: "white", 
          backgroundColor: "transparent",
          width: "48px",
          height: "48px",
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "transparent",
            border: "2px solid white",
          },
        }}
        >
          <RestartAltIcon />
        </IconButton>


        <Button 
        variant="contained" 
        onClick={handleSave}
        sx = {{
          backgroundColor: "white",
          color: "black",
          borderRadius: 1.5,
          "&:hover": {
            backgroundColor: "white",
          },
        }}
        >
          <EastIcon sx={{ fontsize: 32 }} />
        </Button>
      </Box>
  </Box>
    </div>
  );
}
