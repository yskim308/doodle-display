"use client"

import React from "react"
import { Grid } from "@mui/material"
import { DrawingCard } from "@/components/drawings/drawing-card"
import type { ImageObject } from "@/types/image-object"

export interface DrawingsGridProps {
  images: ImageObject[]
}

export function DrawingsGrid({ images = [] }: DrawingsGridProps) {
  return (
    <Grid container spacing={2.5}>
      {images.map((img, idx) => (
        <Grid item key={img.imageId} xs={12} sm={6} md={4} lg={3}>
          <DrawingCard image={img} index={idx} />
        </Grid>
      ))}
    </Grid>
  )
}
