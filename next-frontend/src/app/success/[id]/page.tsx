"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Container } from "@mui/material";

export default function SuccessPage({ params }: { params: { id: string } }) {
  const { id } = params; // comes from /success/[id]
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const [image, setImage] = useState<{ imageId: string; canvas: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !backendBase) return;

    const fetchImage = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendBase}/get/${id}`);
        if (!res.ok) throw new Error("Image not found");
        const data = await res.json();
        setImage(data);
      } catch (err: any) {
        setError(err.message || "Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id, backendBase]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !image) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error || "Image not found"}</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ textAlign: "center", py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Success!
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Here’s your drawing:
      </Typography>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={image.canvas}
          alt="User Drawing"
          style={{
            maxWidth: "100%",
            height: "auto",
            border: "2px solid #ddd",
            borderRadius: "12px",
          }}
        />
      </Box>
    </Container>
  );
}
