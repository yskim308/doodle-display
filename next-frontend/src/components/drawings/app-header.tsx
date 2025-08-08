"use client"

import React from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import GestureIcon from "@mui/icons-material/Gesture"

export interface AppHeaderProps {
  total: number
  isPolling: boolean
  pollInterval: number
  lastUpdate: Date | null
  isLoading: boolean
  onRefresh: () => void
  onToggle: () => void
}

function formatTime(date: Date) {
  return date.toLocaleTimeString()
}

export function AppHeader({
  total = 0,
  isPolling = false,
  pollInterval = 1000,
  lastUpdate = null,
  isLoading = false,
  onRefresh = () => {},
  onToggle = () => {},
}: AppHeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <GestureIcon />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Live Drawing Gallery
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            color="default"
            variant="outlined"
            label={`${total} drawings`}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          />
          <Chip
            icon={<AccessTimeIcon sx={{ color: "#fff !important" }} />}
            label={isPolling ? `Polling ${Math.round(pollInterval / 1000)}s` : "Polling paused"}
            sx={{
              bgcolor: isPolling ? "rgba(16,185,129,0.35)" : "rgba(156,163,175,0.35)",
              color: "#fff",
            }}
          />
          {lastUpdate && (
            <Chip
              variant="outlined"
              label={`Last: ${formatTime(lastUpdate)}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
          )}

          <Tooltip title="Manual refresh">
            <span>
              <IconButton onClick={onRefresh} disabled={isLoading} sx={{ color: "white" }}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isPolling ? "Pause polling" : "Resume polling"}>
            <IconButton onClick={onToggle} sx={{ color: "white" }}>
              {isPolling ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
