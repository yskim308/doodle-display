# Display Page - TV Screen Mirror

This page is designed to be displayed on an 85" TV screen to show a "MESSAGE WALL" of user drawings in real-time.

## Features

- **85" TV Container**: Maintains proper 16:9 aspect ratio on any screen
- **Clean Display**: No debug information - pure TV display experience
- **MESSAGE WALL Header**: Positioned above the frame without overlap
- **Perimeter Frame**: Drawings are displayed around the edges of the screen
- **Center Animation**: New drawings appear in the center with a slide-in animation
- **FIFO Queue**: When the frame is full (20 images), oldest drawings are removed
- **Real-time Updates**: Automatically polls for new drawings every 3 seconds

## How It Works

1. **Drawing Submission**: Users submit drawings via the `/canvas` page on mobile devices
2. **JSON Processing**: Drawings are received as JSON data (same as `/view` page)
3. **Center Display**: New drawings appear in the center with animation for 3 seconds
4. **Frame Addition**: After animation, drawings are added to the perimeter frame
5. **Queue Management**: Maintains maximum 20 drawings in the frame using FIFO logic

## Technical Details

- **Polling Interval**: 3 seconds (configurable)
- **Frame Capacity**: 20 images maximum
- **Canvas Rendering**: Uses the same `renderSaveDataToCanvas` utility as other pages
- **TV Container**: Maintains 16:9 aspect ratio (85" TV standard) on any screen
- **Responsive Design**: Automatically adapts to any screen size while maintaining TV proportions
- **Frame Sizing**: Frames are 12% of width or 15% of height (whichever is smaller)
- **Perfect Centering**: Frame area is automatically centered on any screen size
- **Header Spacing**: Automatically reserves space above frame to prevent overlap
- **Center Image**: Responsive sizing (25% of width or 40% of height)
- **Animation**: Custom CSS animations for smooth transitions

## Usage

1. Navigate to `/display` on the TV screen
2. The page will automatically start polling for new drawings
3. New drawings will appear in the center with animation
4. Drawings will be added to the frame around the perimeter
5. When the frame is full, oldest drawings are automatically removed

## Customization

- **Frame Sizing**: Adjust the percentage values in `calculateFramePositions` function
- **Animation Duration**: Adjust the 3000ms timeout in the center animation
- **Polling Interval**: Change `defaultInterval` in `useDrawingPolling`
- **Frame Capacity**: Modify `MAX_FRAME_IMAGES` constant
- **Responsive Behavior**: Modify the `useEffect` that handles window resize events

## Dependencies

- Uses the same `useDrawingPolling` hook as `/view` page
- Requires `renderSaveDataToCanvas` utility for canvas rendering
- Tailwind CSS for styling and animations
- Custom CSS animations defined in `globals.css`
