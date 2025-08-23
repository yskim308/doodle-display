"use client";

import React, { useEffect, useState } from "react";
import { useDrawingPolling } from "@/hooks/use-drawing-polling";
import { normalizeSaveDataString } from "@/utils/canvas";
import CanvasDraw from "react-canvas-draw";
import type { ImageObject } from "@/types/image-object";

interface FrameImage {
  imageId: string;
  canvas: string;
  timestamp: number;
}

export default function DisplayPage() {
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

  const [frameImages, setFrameImages] = useState<FrameImage[]>([]);
  const [centerImage, setCenterImage] = useState<ImageObject | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  

  
  // Maximum number of images in the frame
  const MAX_FRAME_IMAGES = 20;
  
  // Responsive frame positions - will be calculated based on screen dimensions
  const [framePositions, setFramePositions] = useState<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>>([]);

  // Calculate responsive frame positions
  useEffect(() => {
    const calculateFramePositions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // For 85" TV ratio (16:9), we want to maintain proper proportions
      // Calculate frame size based on screen dimensions while maintaining TV ratio
      const frameSize = Math.min(screenWidth * 0.12, screenHeight * 0.15); // Bigger frames
      
      // Reserve space for header at the top
      const headerHeight = Math.max(screenHeight * 0.08, 60); // 8% of height or minimum 60px
      
      // Calculate total frame area width and center it
      const totalFrameWidth = (frameSize * 10) + (9 * 10); // 10 frames with 10px spacing
      const frameAreaStartX = (screenWidth - totalFrameWidth) / 2; // Center the frame area
      
      // Calculate spacing between frames - minimal spacing
      const horizontalSpacing = 10; // Fixed 10px spacing
      const verticalSpacing = Math.max((screenHeight - headerHeight - (frameSize * 4)) / 5, 10); // 4 frames on left/right, minimum 10px
      
      const positions = [
        // Top row (10 frames) - centered
        ...Array.from({ length: 10 }, (_, i) => ({
          x: frameAreaStartX + (i * (frameSize + horizontalSpacing)),
          y: headerHeight + verticalSpacing,
          width: frameSize,
          height: frameSize,
        })),
        
        // Right side (4 frames)
        ...Array.from({ length: 4 }, (_, i) => ({
          x: frameAreaStartX + totalFrameWidth - frameSize,
          y: headerHeight + verticalSpacing + frameSize + verticalSpacing + (i * (frameSize + verticalSpacing)),
          width: frameSize,
          height: frameSize,
        })),
        
        // Bottom row (10 frames, right to left) - centered
        ...Array.from({ length: 10 }, (_, i) => ({
          x: frameAreaStartX + totalFrameWidth - frameSize - (i * (frameSize + horizontalSpacing)),
          y: screenHeight - frameSize - verticalSpacing,
          width: frameSize,
          height: frameSize,
        })),
        
        // Left side (4 frames, bottom to top)
        ...Array.from({ length: 4 }, (_, i) => ({
          x: frameAreaStartX,
          y: screenHeight - verticalSpacing - frameSize - (i * (frameSize + verticalSpacing)),
          width: frameSize,
          height: frameSize,
        })),
      ];
      
      setFramePositions(positions);
    };

    // Calculate initial positions
    calculateFramePositions();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateFramePositions);
    
    return () => {
      window.removeEventListener('resize', calculateFramePositions);
    };
  }, []);



  // Handle new images
  useEffect(() => {
    if (images.length > 0) {
      const latestImage = images[images.length - 1];
      
      // Check if this is a new image we haven't processed
      if (!frameImages.find(img => img.imageId === latestImage.imageId)) {
        console.log('New drawing detected:', latestImage.imageId); // Debug log
        // Show in center first
        setCenterImage(latestImage);
        setIsAnimating(true);
        
        // After animation, add to frame with smooth transition
        setTimeout(() => {
          console.log('Adding drawing to frame:', latestImage.imageId); // Debug log
          
          // Start transition animation
          setIsAnimating(false);
          
          // Small delay to let center fade out
          setTimeout(() => {
            addToFrame(latestImage);
            setCenterImage(null);
          }, 200);
        }, 3000);
      }
    }
  }, [images]); // Remove frameImages dependency to prevent circular updates

  const addToFrame = (image: ImageObject) => {
    console.log('Adding to frame:', image.imageId, 'Current frame count:', frameImages.length); // Debug log
    const newFrameImage: FrameImage = {
      ...image,
      timestamp: Date.now()
    };
    
    setFrameImages(prev => {
      const updated = [...prev, newFrameImage];
      console.log('Frame images updated:', updated.length, 'New array:', updated.map(img => img.imageId)); // Debug log
      // Keep only the latest MAX_FRAME_IMAGES (FIFO)
      if (updated.length > MAX_FRAME_IMAGES) {
        const trimmed = updated.slice(-MAX_FRAME_IMAGES);
        console.log('Trimmed to max frames:', trimmed.length, 'Removed:', updated.length - trimmed.length);
        return trimmed;
      }
      return updated;
    });
  };





  // Show loading while calculating frame positions
  if (framePositions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading Message Wall...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* 85" TV Container (16:9 aspect ratio) */}
      <div 
        className="bg-white relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          aspectRatio: '16/9'
        }}
      >
        {/* Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <h1 className="font-serif text-gray-800 tracking-wider" 
              style={{ 
                fontFamily: 'Copperplate, "Copperplate Gothic Light", serif',
                fontSize: `clamp(1.5rem, 3vw, 2.5rem)`
              }}>
            MESSAGE WALL
          </h1>
        </div>

      {/* Center Animation Area */}
      {isAnimating && centerImage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-200">
          <div className="border border-gray-300 bg-white">
            <CanvasDraw
              saveData={normalizeSaveDataString(centerImage.canvas)}
              canvasWidth={200}
              canvasHeight={200}
              disabled
              hideGrid
              hideInterface
              brushRadius={2}
              lazyRadius={0}
              brushColor="#111827"
              backgroundColor="#ffffff"
            />
          </div>
        </div>
      )}

      {/* Frame Images */}
      {framePositions.map((pos, index) => (
        <div
          key={index}
          className={`absolute border-2 border-gray-200 overflow-hidden bg-white transition-all duration-300 ${
            frameImages[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            left: pos.x,
            top: pos.y,
            width: pos.width,
            height: pos.height,
          }}
        >
          {frameImages[index] && frameImages[index].canvas ? (
            <canvas
              ref={(el) => {
                if (el) {
                  try {
                    // Use the working renderSaveDataToCanvas utility for static images
                    const { renderSaveDataToCanvas } = require('@/utils/canvas');
                    renderSaveDataToCanvas(el, frameImages[index].canvas, {
                      width: pos.width,
                      height: pos.height,
                      background: "#ffffff"
                    });
                  } catch (error) {
                    console.error('Error rendering frame canvas:', error);
                  }
                }
              }}
              width={pos.width}
              height={pos.height}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-white"></div>
          )}
        </div>
      ))}





      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-30">
          {error}
        </div>
      )}
      </div>
    </div>
  );
}
