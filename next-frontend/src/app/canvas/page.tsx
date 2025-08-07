"use client";
import CanvasDraw from "react-canvas-draw";
export default function Page() {
  return (
    <div className="flex flex-col items-center">
      <CanvasDraw brushRadius={1} lazyRadius={0} />
    </div>
  );
}
