"use client"

import React from "react"
import {
  Box,
  Paper,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Tooltip,
  IconButton,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"

type IntervalPreset = 1000 | 2000 | 5000

export interface PollControlsProps {
  pollInterval: number
  isPolling: boolean
  isLoading: boolean
  onSetInterval: (ms: number) => void
  onRefresh: () => void
  onToggle: () => void
}

export function PollControls({
  pollInterval = 1000,
  isPolling = true,
  isLoading = false,
  onSetInterval = () => {},
  onRefresh = () => {},
  onToggle = () => {},
}: PollControlsProps) {
  const handlePresetChange = (_: React.MouseEvent<HTMLElement>, value: IntervalPreset | null) => {
    if (value) onSetInterval(value)
  }
  const handleSliderChange = (_: Event, value: number | number[]) => {
    if (typeof value === "number") onSetInterval(value)
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography variant="subtitle1" sx={{ minWidth: 160, fontWeight: 600 }}>
          Poll interval
        </Typography>

        <ToggleButtonGroup
          exclusive
          color="primary"
          value={[1000, 2000, 5000].includes(pollInterval) ? (pollInterval as IntervalPreset) : null}
          onChange={handlePresetChange}
          size="small"
        >
          <ToggleButton value={1000}>1s</ToggleButton>
          <ToggleButton value={2000}>2s</ToggleButton>
          <ToggleButton value={5000}>5s</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flexGrow: 1, px: { xs: 0, sm: 2 } }}>
          <Slider
            size="small"
            value={pollInterval}
            min={500}
            max={10000}
            step={500}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${Math.round((v as number) / 1000)}s`}
            aria-label="Custom interval"
          />
        </Box>

        <Stack direction="row" gap={1} alignItems="center" sx={{ ml: "auto" }}>
          <Tooltip title="Manual refresh">
            <span>
              <IconButton color="primary" onClick={onRefresh} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isPolling ? "Pause polling" : "Resume polling"}>
            <IconButton color={isPolling ? "error" : "success"} onClick={onToggle}>
              {isPolling ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  )
}
