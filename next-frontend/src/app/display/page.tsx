"use client";

import React, { useEffect, useState } from "react";
import { useDrawingPolling } from "@/hooks/use-drawing-polling";
import { normalizeSaveDataString, renderSaveDataToCanvas } from "@/utils/canvas";
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

  // Function to animate drawing stroke by stroke
  const animateDrawing = (canvas: HTMLCanvasElement, saveDataString: string, size: number) => {
    try {
      const data = JSON.parse(normalizeSaveDataString(saveDataString));
      const originalWidth = data.width ?? 300;
      const originalHeight = data.height ?? 300;
      
      // Calculate scale factors to fit the drawing within the target dimensions
      const scaleX = size / originalWidth;
      const scaleY = size / originalHeight;
      const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
      
      // Calculate centering offsets
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      const offsetX = (size - scaledWidth) / 2;
      const offsetY = (size - scaledHeight) / 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear and set background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

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
          ctx.lineWidth = line.brushRadius ?? 2;

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          
          ctx.stroke();
        }

        currentLine++;
        
        // Animate next stroke with a small delay
        setTimeout(animateNextStroke, 50); // 50ms delay between strokes
      };

      // Start the animation
      animateNextStroke();
    } catch (error) {
      console.error('Error animating drawing:', error);
    }
  };
  
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
      const frameSize = Math.min(screenWidth * 0.1, screenHeight * 0.12); // Slightly smaller frames for better fit
      
      // Reserve space for header at the top
      const headerHeight = Math.max(screenHeight * 0.08, 60); // 8% of height or minimum 60px
      
      // Calculate total frame area width and center it
      const totalFrameWidth = (frameSize * 10) + (9 * 15); // 10 frames with 15px spacing
      const frameAreaStartX = (screenWidth - totalFrameWidth) / 2; // Center the frame area
      
      // Calculate spacing between frames - ensure minimum spacing
      const horizontalSpacing = 15; // Fixed 15px spacing
      const verticalSpacing = Math.max((screenHeight - headerHeight - (frameSize * 4)) / 5, 15); // 4 frames on left/right, minimum 15px
      
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
    
    console.log('Display dimensions:', { screenWidth: window.innerWidth, screenHeight: window.innerHeight, frameSize: Math.min(window.innerWidth * 0.1, window.innerHeight * 0.12) });
    
    // Recalculate on window resize
    window.addEventListener('resize', () => {
      calculateFramePositions();
      console.log('Resized to:', { width: window.innerWidth, height: window.innerHeight });
    });
    
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
        console.log('New drawing detected:', latestImage.imageId);
        // Show in center first
        setCenterImage(latestImage);
        setIsAnimating(true);
        
        // After center animation, add to frame
        setTimeout(() => {
          console.log('Adding drawing to frame:', latestImage.imageId);
          addToFrame(latestImage);
          setCenterImage(null);
          setIsAnimating(false);
        }, 3000);
      }
    }
  }, [images]);

  const addToFrame = (image: ImageObject) => {
    console.log('Adding to frame:', image.imageId, 'Current frame count:', frameImages.length);
    const newFrameImage: FrameImage = {
      ...image,
      timestamp: Date.now()
    };
    
    setFrameImages(prev => {
      const updated = [...prev, newFrameImage];
      console.log('Frame images updated:', updated.length);
      // Keep only the latest MAX_FRAME_IMAGES (FIFO)
      if (updated.length > MAX_FRAME_IMAGES) {
        const trimmed = updated.slice(-MAX_FRAME_IMAGES);
        console.log('Trimmed to max frames:', trimmed.length);
        return trimmed;
      }
      return updated;
    });
  };

  // Show loading while calculating frame positions
  if (framePositions.length === 0 || framePositions.some(pos => pos.width <= 0 || pos.height <= 0)) {
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
              <canvas
                ref={(el) => {
                  if (el) {
                    try {
                      // Use a reasonable size for center display
                      const centerSize = Math.min(window.innerWidth * 0.2, window.innerHeight * 0.25);
                      el.width = centerSize;
                      el.height = centerSize;
                      
                      // Animate the drawing stroke by stroke
                      animateDrawing(el, centerImage.canvas, centerSize);
                    } catch (error) {
                      console.error('Error rendering center canvas:', error);
                      // Fallback: show a placeholder
                      const ctx = el.getContext('2d');
                      if (ctx) {
                        const centerSize = Math.min(window.innerWidth * 0.2, window.innerHeight * 0.25);
                        ctx.fillStyle = '#f3f4f6';
                        ctx.fillRect(0, 0, centerSize, centerSize);
                        ctx.fillStyle = '#9ca3af';
                        ctx.font = '16px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Drawing', centerSize / 2, centerSize / 2);
                      }
                    }
                  }
                }}
                style={{
                  width: Math.min(window.innerWidth * 0.2, window.innerHeight * 0.25),
                  height: Math.min(window.innerWidth * 0.2, window.innerHeight * 0.25),
                  display: 'block'
                }}
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
                  if (el && pos.width > 0 && pos.height > 0) {
                    try {
                      el.width = pos.width;
                      el.height = pos.height;
                      
                      renderSaveDataToCanvas(el, frameImages[index].canvas, {
                        width: pos.width,
                        height: pos.height,
                        background: "#ffffff"
                      });
                    } catch (error) {
                      console.error('Error rendering canvas:', error);
                      // Fallback: show a placeholder
                      const ctx = el.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#f3f4f6';
                        ctx.fillRect(0, 0, pos.width, pos.height);
                        ctx.fillStyle = '#9ca3af';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Drawing', pos.width / 2, pos.height / 2);
                      }
                    }
                  }
                }}
                style={{
                  width: pos.width,
                  height: pos.height,
                  display: 'block'
                }}
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
