import { serve } from "bun";
import { Hono } from "hono";
import circularArray from "./CircularArray";
import type { Context } from "hono";
import type { Canvas, ImageObject } from "./types";

const app = new Hono();
app.get("/", (c: Context) => {
  return c.text("Hewwo!");
});

// submit body
interface SubmitBody {
  canvas: Canvas;
}
app.post("/submit", async (c: Context) => {
  const { canvas }: SubmitBody = await c.req.json();
  if (!canvas) {
    c.text("missing canvas field", 400);
  }
  const uniqueId = crypto.randomUUID();
  const imageObject: ImageObject = {
    imageId: uniqueId,
    canvas: canvas,
  };
  circularArray.insert(imageObject);
  c.text("inserted succesfully", 200);
});

app.post("/getAll", async (c: Context) => {
  const objectList = circularArray.getAll();
  c.json(objectList);
});

serve({
  fetch: app.fetch,
  port: 4000,
});
console.log("running on port 4000");
