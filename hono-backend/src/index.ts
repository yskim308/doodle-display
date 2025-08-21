import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import circularArray from "./CircularArray";
import type { Context } from "hono";
import type { ImageObject } from "./types";

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
  return c.text("inserted succesfully", 200);
});

app.get("/getAll", async (c: Context) => {
  const objectList = circularArray.getAll();
  return c.json(objectList);
});

// settings for server
serve({
  fetch: app.fetch,
  port: 4000,
});
console.log("running on port 4000");
