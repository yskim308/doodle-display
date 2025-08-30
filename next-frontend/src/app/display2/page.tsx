"use client";

import React, { useEffect, useState } from "react";
import { useDrawingPolling } from "@/hooks/use-drawing-polling";
import { normalizeSaveDataString } from "@/utils/canvas";
import CanvasDraw from "react-canvas-draw";
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
  
  // Screen dimensions for positioning
  const [screenDimensions, setScreenDimensions] = useState({ width: 1920, height: 1080 });

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
    
    // Adaptive margins and header height for different screen sizes
    const isSmallScreen = Math.min(viewportWidth, viewportHeight) < 768;
    const headerHeight = isSmallScreen ? 60 : 80; // Smaller header on mobile
    const margin = isSmallScreen ? 20 : 30; // Smaller margins on mobile
    
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
    console.log('🔄 useEffect triggered - images.length:', images.length, 'processedImages.size:', processedImages.size);
    
    if (images.length > 0) {
      const latestImage = images[images.length - 1];
      console.log('📸 Latest image ID:', latestImage.imageId, 'Already processed?', processedImages.has(latestImage.imageId));
      
      // Check if this is a new image we haven't processed
      if (!processedImages.has(latestImage.imageId)) {
        console.log('✅ New drawing detected in display2:', latestImage.imageId);
        
        // Generate responsive dimensions that work on ALL screen sizes
        const minScreenDimension = Math.min(screenDimensions.width, screenDimensions.height);
        
        // Adaptive sizing: smaller screens get smaller drawings
        let baseSize;
        if (minScreenDimension < 768) { // Mobile/tablet
          baseSize = minScreenDimension * 0.12; // 12% of screen
        } else if (minScreenDimension < 1200) { // Small desktop
          baseSize = minScreenDimension * 0.13; // 13% of screen
        } else { // Large desktop/TV
          baseSize = minScreenDimension * 0.15; // 15% of screen
        }
        
        const sizeVariation = baseSize * 0.2; // Reduced variation for smaller screens
        const containerSize = baseSize + (Math.random() * sizeVariation - sizeVariation / 2);
        
        // Adaptive minimum sizes
        const minSize = minScreenDimension < 768 ? 80 : 120; // Smaller minimum on mobile
        const width = Math.max(containerSize, minSize);
        const height = Math.max(containerSize, minSize);
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
        };
        
        setFloatingDrawings((prev) => {
          const startingCount = prev.length;
          console.log(`🎨 DRAWING ${startingCount + 1} ADDED - Current drawings on screen: ${startingCount}`);
          
          // Check if array is getting full
          if (startingCount >= MAX_FRAME_IMAGES - 2) {
            console.log(`⚠️  ARRAY GETTING FULL: ${startingCount}/${MAX_FRAME_IMAGES} - Will pop soon!`);
          }
          
          // 1) remove any existing item with the same id (prevents duplicates)
          const dedup = prev.filter(d => d.id !== newDrawing.id);
          
          // 2) if original array was full, drop the oldest, then append the new
          const shouldRemoveOldest = startingCount >= MAX_FRAME_IMAGES;
          
          if (shouldRemoveOldest) {
            console.log(`🗑️  ARRAY FULL (${startingCount}/${MAX_FRAME_IMAGES}) - Removing oldest drawing!`);
            const base = dedup.slice(1);
            const next = [...base, newDrawing];
            console.log(`✅ OLDEST POPPED - Now showing ${next.length} drawings`);
            return next;
          } else {
            const next = [...dedup, newDrawing];
            console.log(`➕ DRAWING ADDED - Now showing ${next.length} drawings`);
            return next;
          }
        });
        
        
        setProcessedImages(prev => new Set([...prev, latestImage.imageId]));
      }
    }
  }, [images, processedImages, screenDimensions]);

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

        {/* Floating Drawing Animations - Using react-canvas-draw */}
        {floatingDrawings.map((drawing) => (
          <div
            key={`${drawing.id}-${drawing.timestamp}`}
            className="absolute z-20"
            style={{
              left: drawing.x,
              top: drawing.y,
              width: drawing.width,
              height: drawing.height,
              transform: `rotate(${drawing.rotation}deg)`,
              overflow: 'visible',
              pointerEvents: 'none',
              // Safari-specific fixes
              WebkitTransform: `rotate(${drawing.rotation}deg)`,
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <CanvasDraw
              saveData={normalizeSaveDataString(drawing.image.canvas)}
              canvasWidth={300}
              canvasHeight={300}
              disabled
              hideGrid
              hideInterface
              brushRadius={2}
              lazyRadius={0}
              brushColor="#111827"
              backgroundColor="#ffffff"
              style={{
                width: drawing.width,
                height: drawing.height,
                display: 'block',
                // Safari-specific fixes to prevent clipping
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
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
