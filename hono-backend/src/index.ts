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
  json: string;
  png: string;
}
app.post("/submit", async (c: Context) => {
  const { json, png }: SubmitBody = await c.req.json();
  if (!json || !png) {
    return c.text("missing image field", 400);
  }
  const uniqueId = crypto.randomUUID();
  const imageObject: ImageObject = {
    imageId: uniqueId,
    json,
    png,
  };
  circularArray.insert(imageObject);
  console.log("New image inserted:", uniqueId);
  return c.json({
    message: "inserted succesfully",
    imageID: uniqueId,}, 200);
});

app.get("/getAll", async (c: Context) => {
  const objectList = circularArray.getAll().map((img) => ({
    imageId: img.imageId,
    json: img.json,
    png: img.png,
    canvas: img.json,
  }));
  return c.json(objectList);
});

// for animated playback (/view)
app.get("/view/:id", async (c: Context) => {
  const id = c.req.param("id");
  const image = circularArray.getAll().find((obj) => obj.imageId === id);

  if (!image) return c.text("Image not found", 404);

  return c.json({ imageId: id, json: image.json, png: image.png, canvas: image.json });
});

// for static success page (/success)
app.get("/success/:id", async (c: Context) => {
  const id = c.req.param("id");
  const image = circularArray.getAll().find((obj) => obj.imageId === id);

  if (!image) return c.text("Image not found", 404);

  return c.json({ imageId: id, canvas: image.png });
});


// settings for server
serve({
  fetch: app.fetch,
  port: 4000,
});
console.log("running on port 4000");
