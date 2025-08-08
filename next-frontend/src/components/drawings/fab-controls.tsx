"use client"

import React from "react"
import { Box, Fab, Tooltip } from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"

export interface FabControlsProps {
  isPolling: boolean
  isLoading: boolean
  onRefresh: () => void
  onToggle: () => void
}

export function FabControls({
  isPolling = true,
  isLoading = false,
  onRefresh = () => {},
  onToggle = () => {},
}: FabControlsProps) {
  return (
    <Box sx={{ position: "fixed", right: 24, bottom: 24, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Tooltip title="Manual refresh">
        <span>
          <Fab color="primary" size="medium" onClick={onRefresh} aria-label="refresh" disabled={isLoading}>
            <RefreshIcon />
          </Fab>
        </span>
      </Tooltip>
      <Tooltip title={isPolling ? "Pause polling" : "Resume polling"}>
        <Fab color={isPolling ? "error" : "success"} onClick={onToggle} aria-label="toggle-polling">
          {isPolling ? <PauseIcon /> : <PlayArrowIcon />}
        </Fab>
      </Tooltip>
    </Box>
  )
}
