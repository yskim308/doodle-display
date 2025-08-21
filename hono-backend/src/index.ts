import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import circularArray from "./CircularArray";
import type { Context } from "hono";
import type { Canvas, ImageObject } from "./types";

const app = new Hono();

// cors settings
const frontendBase = process.env.FRONTEND_BASE_URL;
let origin: string[] = ["http://localhost:3000"];
if (frontendBase) origin.push(frontendBase);
app.use(
  "/*",
  cors({
    origin: origin,
  }),
);

// routes
app.get("/", (c: Context) => {
  return c.text("Hewwo!");
});

// submit body
interface SubmitBody {
  canvas: string;
}
app.post("/submit", async (c: Context) => {
  const { canvas }: SubmitBody = await c.req.json();
  if (!canvas) {
    return c.text("missing canvas field", 400);
  }
  const uniqueId = crypto.randomUUID();
  const imageObject: ImageObject = {
    imageId: uniqueId,
    canvas: canvas,
  };
  circularArray.insert(imageObject);
  
  return c.json({
    message: "inserted succesfully",
    imageID: uniqueId,}, 200);
});

app.get("/getAll", async (c: Context) => {
  const objectList = circularArray.getAll();
  return c.json(objectList);
});

app.get("/get/:id", async (c: Context) => {
  const id = c.req.param("id");
  const objectList = circularArray.getAll(); 
  const image = objectList.find(obj) => obj.imageId === id);

  if (!image) {
    return circularArray.text("Image not found", 404);
  }
  return circularArray.json(image, 200);
});

// settings for server
serve({
  fetch: app.fetch,
  port: 4000,
});
console.log("running on port 4000");
