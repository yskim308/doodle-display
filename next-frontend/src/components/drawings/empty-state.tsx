"use client"

import React from "react"
import { Box, Paper, Stack, Typography, CircularProgress } from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"

export interface EmptyStateProps {
  loading?: boolean
}

export function EmptyState({ loading = false }: EmptyStateProps) {
  if (loading) {
    return (
      <Box sx={{ py: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack alignItems="center" gap={2}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" color="text.secondary">
            Loading drawings...
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 6,
        borderRadius: 2,
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          mx: "auto",
          mb: 2,
        }}
      >
        <RefreshIcon color="disabled" fontSize="large" />
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        No drawings yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Waiting for submissions to appear...
      </Typography>
    </Paper>
  )
}
