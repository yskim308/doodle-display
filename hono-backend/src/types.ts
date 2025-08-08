export interface Canvas {
  lines: Line[];
  width: number;
  height: number;
}

export interface Line {
  points: Point[];
  brushColor: string;
  brushRadius: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ImageObject {
  imageId: string;
  canvas: Canvas;
}
