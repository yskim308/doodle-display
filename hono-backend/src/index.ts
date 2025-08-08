import { serve } from "bun";
import { Hono } from "hono";
import type { Context } from "hono";

// interfaces
interface Canvas {}

const app = new Hono();

app.get("/", (c: Context) => {
  return c.text("Hewwo!");
});

serve({
  fetch: app.fetch,
  port: 4000,
});
console.log("running on port 4000");
