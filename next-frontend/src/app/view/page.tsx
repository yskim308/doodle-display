"use client";
export default function Page() {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!backendBase) throw new Error("backend base url not set in .env");
  return <h1>hello worlrd</h1>;
}
