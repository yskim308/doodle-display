"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, Divider, Box } from "@mui/material"
import CanvasDraw from "react-canvas-draw"
import { normalizeSaveDataString, DEFAULT_HEIGHT, DEFAULT_WIDTH, shortId } from "@/utils/canvas"
import type { ImageObject } from "@/types/image-object"

export interface DrawingCardProps {
  image: ImageObject
  index: number
}

export const DrawingCard = React.memo(function DrawingCard({
  image,
  index,
}: DrawingCardProps) {
  const normalizedSaveData = useMemo(() => normalizeSaveDataString(image.canvas), [image.canvas])

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <CardHeader
        titleTypographyProps={{ variant: "subtitle1" }}
        subheaderTypographyProps={{ variant: "caption" }}
        title={`Drawing #${index + 1}`}
        subheader={`ID • ${shortId(image.imageId)}`}
        sx={{ pb: 1.5 }}
      />
      <Divider />
      <CardContent sx={{ pt: 2 }}>
        <Box
          sx={{
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CanvasDraw
            saveData={normalizedSaveData}
            canvasWidth={DEFAULT_WIDTH}
            canvasHeight={DEFAULT_HEIGHT}
            disabled
            hideGrid
            hideInterface
            immediateLoading
            brushRadius={2}
            lazyRadius={0}
            brushColor="#111827"
            backgroundColor="#ffffff"
          />
        </Box>
      </CardContent>
    </Card>
  )
})
