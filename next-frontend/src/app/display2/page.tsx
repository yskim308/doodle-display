"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDrawingPolling } from "@/hooks/use-drawing-polling";
import { normalizeSaveDataString, renderSaveDataToCanvas } from "@/utils/canvas";
import type { ImageObject } from "@/types/image-object";

interface FloatingDrawing {
  id: string;
  image: ImageObject;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  timestamp: number;
  animated: boolean; // Track if this drawing has already been animated
}

export default function Display2Page() {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!backendBase) {
    throw new Error(
      "backend base url not set in .env (NEXT_PUBLIC_BACKEND_BASE_URL)",
    );
  }

  const {
    images,
    error,
    setError,
  } = useDrawingPolling({ backendBase, defaultInterval: 3000 });

  const [floatingDrawings, setFloatingDrawings] = useState<FloatingDrawing[]>([]);
  const [processedImages, setProcessedImages] = useState<Set<string>>(new Set());
  
  // Maximum number of drawings to show at once
  const MAX_FRAME_IMAGES = 20;
  
  // Track which canvases have been initialized to prevent multiple renders
  const initializedCanvases = useRef<Set<string>>(new Set());
  
  // Screen dimensions for positioning
  const [screenDimensions, setScreenDimensions] = useState({ width: 1920, height: 1080 });

  // Function to animate drawing stroke by stroke
  const animateDrawingStroke = useCallback((canvas: HTMLCanvasElement, saveDataString: string, width: number, height: number) => {
    try {
      const data = JSON.parse(normalizeSaveDataString(saveDataString));
      const originalWidth = data.width ?? 300;
      const originalHeight = data.height ?? 300;
      
      // Calculate scale factors to fit the drawing within the target dimensions
      const scaleX = width / originalWidth;
      const scaleY = height / originalHeight;
      const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
      
      // Calculate centering offsets
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);

      // Apply scaling and centering transformation
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      const lines = data.lines ?? [];
      let currentLine = 0;

      const animateNextStroke = () => {
        if (currentLine >= lines.length) {
          ctx.restore();
          return;
        }

        const line = lines[currentLine];
        const pts = line.points ?? [];
        
        if (pts.length >= 2) {
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.strokeStyle = line.brushColor ?? "#111827";
          
          // Try multiple possible brush radius properties
          const brushRadius = line.brushRadius ?? (line as any).brushSize ?? (line as any).width ?? 2;
          
          // Set line width with 1.8x multiplier to compensate for thin strokes
          ctx.lineWidth = brushRadius * 1.8;
          
          // Debug: Log brush scaling calculations
          if (currentLine === 0) {
            console.log('=== DISPLAY2 BRUSH SCALING DEBUG ===');
            console.log('Original brush radius:', brushRadius, 'px');
            console.log('Original canvas width:', originalWidth, 'px');
            console.log('Target canvas width:', width, 'px');
            console.log('Scale factor used:', scale.toFixed(3));
            console.log('Line width with 1.8x multiplier:', (brushRadius * 1.8).toFixed(2), 'px');
          }
          
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          
          ctx.stroke();
        }

        currentLine++;
        
        // Animate next stroke with a small delay
        setTimeout(animateNextStroke, 30); // 30ms delay between strokes for smooth animation
      };

      // Start the animation
      animateNextStroke();
    } catch (error) {
      console.error('Error animating drawing stroke:', error);
    }
  }, []);

  // Function to render static drawing
  const renderStaticDrawing = useCallback((canvas: HTMLCanvasElement, saveDataString: string, width: number, height: number) => {
    try {
      const data = JSON.parse(normalizeSaveDataString(saveDataString));
      const originalWidth = data.width ?? 300;
      const originalHeight = data.height ?? 300;
      
      // Calculate scale factors to fit the drawing within the target dimensions
      const scaleX = width / originalWidth;
      const scaleY = height / originalHeight;
      const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
      
      // Calculate centering offsets
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);

      // Apply scaling and centering transformation
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      const lines = data.lines ?? [];
      
      // Render all lines at once (no animation)
      lines.forEach((line: any) => {
        const pts = line.points ?? [];
        
        if (pts.length >= 2) {
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.strokeStyle = line.brushColor ?? "#111827";
          
          // Try multiple possible brush radius properties
          const brushRadius = line.brushRadius ?? (line as any).brushSize ?? (line as any).width ?? 2;
          
          // Set line width with 1.8x multiplier to compensate for thin strokes
          ctx.lineWidth = brushRadius * 1.8;
        }
      });
      
      ctx.restore();
    } catch (error) {
      console.error('Error rendering static drawing:', error);
    }
  }, []);

  // Update screen dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Check if a position overlaps with existing drawings
  const checkOverlap = (x: number, y: number, width: number, height: number): boolean => {
    const margin = 50; // Increased margin for TV display
    
    return floatingDrawings.some(drawing => {
      const dx = Math.abs(x - drawing.x);
      const dy = Math.abs(y - drawing.y);
      
      return dx < (width + drawing.width) / 2 + margin && 
             dy < (height + drawing.height) / 2 + margin;
    });
  };

  // Generate random position that doesn't overlap
  const generateRandomPosition = (width: number, height: number): { x: number; y: number } => {
    let attempts = 0;
    const maxAttempts = 100;
    
    // Use full browser dimensions for positioning
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Reserve space for header and ensure drawings are fully visible
    const headerHeight = 80; // Space for MESSAGE WALL text
    const margin = 30; // Minimum margin from edges
    
    while (attempts < maxAttempts) {
      // Generate position within the full viewport, ensuring full visibility
      const x = margin + Math.random() * (viewportWidth - width - margin * 2);
      const y = headerHeight + margin + Math.random() * (viewportHeight - headerHeight - height - margin * 2);
      
      if (!checkOverlap(x, y, width, height)) {
        return { x, y };
      }
      
      attempts++;
    }
    
    // If we can't find a non-overlapping position, place it in a safe corner
    const corners = [
      { x: margin, y: headerHeight + margin },
      { x: viewportWidth - width - margin, y: headerHeight + margin },
      { x: margin, y: viewportHeight - height - margin },
      { x: viewportWidth - width - margin, y: viewportHeight - height - margin }
    ];
    
    return corners[Math.floor(Math.random() * corners.length)];
  };

  // Handle new images
  useEffect(() => {
    if (images.length > 0) {
      const latestImage = images[images.length - 1];
      
      // Check if this is a new image we haven't processed
      if (!processedImages.has(latestImage.imageId)) {
        console.log('New drawing detected in display2:', latestImage.imageId);
        
        // Generate responsive dimensions that work with the TV container
        const baseSize = Math.min(screenDimensions.width, screenDimensions.height) * 0.15; // Base 15% of screen
        const sizeVariation = baseSize * 0.3; // 30% variation
        const containerSize = baseSize + (Math.random() * sizeVariation - sizeVariation / 2); // Random variation around base size
        
        const width = Math.max(containerSize, 120); // Minimum 120px width
        const height = Math.max(containerSize, 120); // Minimum 120px height
        const position = generateRandomPosition(width, height);
        
        // Create new floating drawing
        const newDrawing: FloatingDrawing = {
          id: latestImage.imageId,
          image: latestImage,
          x: position.x,
          y: position.y,
          width,
          height,
          rotation: (Math.random() - 0.5) * 15, // Random rotation between -7.5 and 7.5 degrees
          timestamp: Date.now(),
          animated: false, // New drawings are not animated initially
        };
        
        setFloatingDrawings(prev => {
          const updated = [...prev, newDrawing];
          
          // If we exceed MAX_FRAME_IMAGES, remove the oldest drawing and reuse its position
          if (updated.length > MAX_FRAME_IMAGES) {
            // Sort by timestamp and keep only the newest ones
            const sorted = updated.sort((a, b) => a.timestamp - b.timestamp);
            const trimmed = sorted.slice(-MAX_FRAME_IMAGES);
            
            // Get the removed drawing's position to reuse
            const removedDrawing = sorted[0]; // Oldest drawing that was removed
            
            // Clean up initializedCanvases for removed drawing
            const keysToRemove = Array.from(initializedCanvases.current).filter(key => key.startsWith(`${removedDrawing.id}-`));
            keysToRemove.forEach(key => initializedCanvases.current.delete(key));
            
            // Update the new drawing to use the removed drawing's position
            const updatedWithReusedPosition = trimmed.map(d => 
              d.id === newDrawing.id 
                ? { ...d, x: removedDrawing.x, y: removedDrawing.y }
                : d
            );
            
            console.log(`Replaced oldest drawing at position (${removedDrawing.x}, ${removedDrawing.y}), now showing ${updatedWithReusedPosition.length} drawings`);
            return updatedWithReusedPosition;
          }
          
          return updated;
        });
        
        setProcessedImages(prev => new Set([...prev, latestImage.imageId]));
      }
    }
  }, [images, processedImages, floatingDrawings, screenDimensions]);

  return (
    <div className="w-full h-full bg-white overflow-hidden relative">
      {/* Full Browser Display Area - Responsive to any browser shape */}
      <div className="w-full h-full bg-white relative overflow-hidden">
        
        {/* Header - MESSAGE WALL - Fully responsive */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4">
          <h1 className="font-serif text-gray-800 tracking-wider text-center" 
              style={{ 
                fontFamily: 'Copperplate, "Copperplate Gothic Light", serif',
                fontSize: `clamp(2rem, 6vw, 5rem)`
              }}>
            MESSAGE WALL
          </h1>
        </div>

        {/* Floating Drawing Animations - Raw drawings on canvas */}
        {floatingDrawings.map((drawing) => (
          <div
            key={drawing.id}
            className="absolute z-20"
            style={{
              left: drawing.x,
              top: drawing.y,
              width: drawing.width,
              height: drawing.height,
              transform: `rotate(${drawing.rotation}deg)`,
            }}
          >
            <canvas
              ref={(el) => {
                if (el && drawing.width > 0 && drawing.height > 0) {
                  const canvasKey = `${drawing.id}-${drawing.width}-${drawing.height}`;
                  
                  // Only process this canvas if it hasn't been initialized yet
                  if (!initializedCanvases.current.has(canvasKey)) {
                    try {
                      el.width = drawing.width;
                      el.height = drawing.height;
                      
                      if (!drawing.animated) {
                        // Animate the drawing stroke by stroke
                        animateDrawingStroke(el, drawing.image.canvas, drawing.width, drawing.height);
                        
                        // Mark this drawing as animated to prevent re-animation
                        setFloatingDrawings(prev => 
                          prev.map(d => 
                            d.id === drawing.id ? { ...d, animated: true } : d
                          )
                        );
                      } else {
                        // For already animated drawings, just render the final result
                        renderStaticDrawing(el, drawing.image.canvas, drawing.width, drawing.height);
                      }
                      
                      // Mark this canvas as initialized
                      initializedCanvases.current.add(canvasKey);
                    } catch (error) {
                      console.error('Error rendering drawing:', error);
                    }
                  }
                }
              }}
              style={{
                width: drawing.width,
                height: drawing.height,
                display: 'block'
              }}
            />
          </div>
        ))}

        {/* Error Display */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg z-30 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
