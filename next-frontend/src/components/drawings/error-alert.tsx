"use client"

import React from "react"
import { Alert } from "@mui/material"

export interface ErrorAlertProps {
  error: string | null
  onClose: () => void
}

export function ErrorAlert({ error = null, onClose = () => {} }: ErrorAlertProps) {
  if (!error) return null
  return (
    <Alert severity="error" sx={{ mb: 3 }} onClose={onClose}>
      {error}
    </Alert>
  )
}
