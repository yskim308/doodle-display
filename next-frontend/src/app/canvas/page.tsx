"use client";
import { useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { Button } from "@mui/material";
export default function Page() {
  const canvasRef = useRef<CanvasDraw | null>(null);

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

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl my-3">draw... or else</h1>
      <CanvasDraw ref={canvasRef} brushRadius={1} lazyRadius={0} />
      <div>
        <Button variant="contained" onClick={handleReset}>
          reset
        </Button>
        <Button variant="contained" onClick={handleSave}>
          submit
        </Button>
      </div>
    </div>
  );
}
